"""CivoAI Roboflow Detection Service"""
import logging
import httpx
from backend.app.core.config import settings
from backend.app.models import DetectionResult, Detection, BoundingBox

logger = logging.getLogger("civoai.roboflow")

ROBOFLOW_DETECT_URL = "https://detect.roboflow.com"
TIMEOUT_SECONDS = 30.0
MAX_RETRIES = 1


class RoboflowService:
    """Roboflow pothole detection service."""

    def __init__(self):
        self.api_key = settings.ROBOFLOW_API_KEY
        self.model_id = settings.ROBOFLOW_DETECTION_MODEL_ID

    def detect(self, image_bytes: bytes) -> DetectionResult:
        """
        Send an image to Roboflow for pothole detection.
        Returns a normalized DetectionResult.
        Never fabricates results.
        """
        if not self.api_key:
            return DetectionResult(
                model=self.model_id,
                pothole_detected=False,
                error="Roboflow API key not configured.",
            )

        url = f"{ROBOFLOW_DETECT_URL}/{self.model_id}"
        params = {"api_key": self.api_key}

        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
                    res = client.post(
                        url,
                        params=params,
                        files={"file": ("image.jpg", image_bytes, "image/jpeg")},
                    )

                if res.status_code != 200:
                    last_error = f"Roboflow API returned HTTP {res.status_code}"
                    logger.warning(f"Roboflow attempt {attempt + 1} failed: {last_error}")
                    continue

                data = res.json()
                return self._normalize(data)

            except httpx.TimeoutException:
                last_error = "Roboflow API request timed out."
                logger.warning(f"Roboflow attempt {attempt + 1}: timeout")
            except Exception as e:
                last_error = f"Roboflow request failed: {str(e)}"
                logger.error(f"Roboflow attempt {attempt + 1}: {e}")

        # All retries exhausted
        return DetectionResult(
            model=self.model_id,
            pothole_detected=False,
            error=last_error or "Roboflow detection failed.",
        )

    def _normalize(self, data: dict) -> DetectionResult:
        """
        Normalize Roboflow provider response into internal CivoAI structure.
        """
        predictions = data.get("predictions", [])
        detections = []

        for pred in predictions:
            try:
                # Roboflow returns center x, y and width, height
                bbox = BoundingBox(
                    x=float(pred.get("x", 0)),
                    y=float(pred.get("y", 0)),
                    width=float(pred.get("width", 0)),
                    height=float(pred.get("height", 0)),
                )
                detection = Detection(
                    **{
                        "class": str(pred.get("class", "unknown")),
                        "confidence": float(pred.get("confidence", 0)),
                        "bbox": bbox,
                    }
                )
                detections.append(detection)
            except Exception as e:
                logger.warning(f"Skipping malformed detection: {e}")

        pothole_detected = any(
            d.class_name.lower() in (
                "pothole", "potholes", "alligator_crack", "longitudinal_crack",
                "rutting", "road_defect", "hole", "crack"
            ) or "crack" in d.class_name.lower() or "pothole" in d.class_name.lower()
            for d in detections
        )

        return DetectionResult(
            provider="roboflow",
            model=self.model_id,
            pothole_detected=pothole_detected,
            detections=detections,
        )
