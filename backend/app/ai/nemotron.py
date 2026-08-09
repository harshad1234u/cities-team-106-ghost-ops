"""CivoAI Nemotron Visual Analysis Service (NVIDIA NIM)"""
import json
import logging
import base64
import re
import httpx
from app.core.config import settings
from app.models import DetectionResult, VisualAnalysis

logger = logging.getLogger("civoai.nemotron")

TIMEOUT_SECONDS = 60.0

# Constrained analysis prompt — asks ONLY for visible evidence
ANALYSIS_PROMPT = """You are CivoAI's visual analysis model. Analyze the pothole detection results and provide a structured visual assessment.

Roboflow Detection Results:
{detection_context}

Provide your analysis as a JSON object with EXACTLY these fields:
{{
  "pothole_confirmed": true/false,
  "visual_size": "small" or "medium" or "large",
  "apparent_depth": "shallow" or "moderate" or "deep",
  "surrounding_damage": "none" or "minor" or "visible" or "extensive",
  "water_contribution_visible": true/false,
  "confidence": 0.0 to 1.0,
  "uncertainties": ["list of limitations"]
}}

IMPORTANT CONSTRAINTS:
- Assess ONLY what is visually apparent from the detection data.
- Do NOT invent physical depth measurements (e.g., "14.3 cm").
- Do NOT invent exact physical dimensions (e.g., "2.16 m²").
- Do NOT reference MoRTH clauses, repair costs, or engineering standards.
- Do NOT calculate severity scores or priority levels.
- Use categorical values only: small/medium/large for size, shallow/moderate/deep for depth.
- If uncertain about any field, set confidence lower and add to uncertainties.
- "Physical depth cannot be measured from image detection data alone." must always appear in uncertainties.

Respond with ONLY the JSON object. No markdown, no explanation, no code blocks."""


class NemotronService:
    """NVIDIA NIM Nemotron visual analysis service."""

    def __init__(self):
        self.api_key = settings.NVIDIA_NIM_API_KEY
        self.endpoint = settings.NVIDIA_NIM_ENDPOINT
        self.model = settings.NEMOTRON_MODEL

    def analyze(self, detection: DetectionResult, image_bytes: bytes = None) -> VisualAnalysis:
        """
        Analyze detection results using Nemotron.
        Returns a validated VisualAnalysis.
        Raises ValueError if the response cannot be parsed/validated.
        """
        if not self.api_key:
            raise ValueError("NVIDIA NIM API key not configured.")

        # Build detection context for the prompt
        detection_context = json.dumps(
            detection.model_dump(by_alias=True),
            indent=2,
        )
        prompt = ANALYSIS_PROMPT.format(detection_context=detection_context)

        # Build messages payload
        messages = []

        # Attempt multimodal if image is available
        if image_bytes:
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"},
                    },
                    {"type": "text", "text": prompt},
                ],
            })
        else:
            messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 500,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
                res = client.post(self.endpoint, headers=headers, json=payload)

            if res.status_code != 200:
                # If multimodal failed, retry with text-only
                if image_bytes and res.status_code in (400, 422):
                    logger.info("Multimodal request failed, retrying text-only.")
                    return self._text_only_request(prompt, headers)
                raise ValueError(
                    f"Nemotron API returned HTTP {res.status_code}: {res.text[:200]}"
                )

            return self._parse_response(res.json())

        except httpx.TimeoutException:
            raise ValueError("Nemotron API request timed out.")
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Nemotron request failed: {str(e)}")

    def _text_only_request(self, prompt: str, headers: dict) -> VisualAnalysis:
        """Fallback text-only request if multimodal is not supported."""
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 500,
        }

        with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
            res = client.post(self.endpoint, headers=headers, json=payload)

        if res.status_code != 200:
            raise ValueError(
                f"Nemotron text-only request failed: HTTP {res.status_code}"
            )

        return self._parse_response(res.json())

    def _parse_response(self, data: dict) -> VisualAnalysis:
        """
        Parse and validate the Nemotron response.
        Raises ValueError if the response is malformed.
        """
        try:
            choices = data.get("choices", [])
            if not choices:
                raise ValueError("Nemotron returned no choices.")

            content = choices[0].get("message", {}).get("content", "")
            if not content:
                raise ValueError("Nemotron returned empty content.")

            # Try to extract JSON from the response
            json_str = self._extract_json(content)
            parsed = json.loads(json_str)

            # Validate with Pydantic
            analysis = VisualAnalysis(**parsed)

            # Ensure the mandatory uncertainty is present
            depth_warning = "Physical depth cannot be measured from image detection data alone."
            if depth_warning not in analysis.uncertainties:
                analysis.uncertainties.append(depth_warning)

            return analysis

        except json.JSONDecodeError as e:
            raise ValueError(f"Nemotron returned invalid JSON: {e}")
        except Exception as e:
            raise ValueError(f"Failed to parse Nemotron response: {e}")

    def _extract_json(self, text: str) -> str:
        """Extract JSON object from text that may contain markdown or extra text."""
        # Try to find JSON block in markdown code fence
        code_block = re.search(r"```(?:json)?\s*\n?(\{.*?\})\s*```", text, re.DOTALL)
        if code_block:
            return code_block.group(1)

        # Try to find raw JSON object
        json_match = re.search(r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", text, re.DOTALL)
        if json_match:
            return json_match.group(0)

        # Last resort: return the whole text and let json.loads fail if needed
        return text.strip()
