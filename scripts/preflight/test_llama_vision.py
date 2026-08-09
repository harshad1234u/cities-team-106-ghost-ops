import os
import sys
import json
import httpx
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_llama_vision():
    api_key = os.getenv("LLAMA_API_KEY")
    model_name = os.getenv("LLAMA_MODEL", "meta-llama/llama-3.2-11b-vision-instruct")

    if not api_key:
        print("[LLAMA 3.2 VISION] [BLOCKED] LLAMA_API_KEY is not set in environment.")
        return False

    print(f"[LLAMA 3.2 VISION] Testing Llama 3.2 Vision API with model '{model_name}'...")

    url = os.getenv("LLAMA_API_BASE", "https://integrate.api.nvidia.com/v1/chat/completions")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    sample_image_url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Generate a 2-line summary of this road condition evidence image for a municipal pothole report."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": sample_image_url
                        }
                    }
                ]
            }
        ],
        "max_tokens": 150
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            if content:
                print(f"[LLAMA 3.2 VISION] [PASS] HTTP 200 OK. Response: {content[:150]}...")
                return True
            else:
                print("[LLAMA 3.2 VISION] [FAIL] HTTP 200 returned but response content was empty.")
                return False
        else:
            print(f"[LLAMA 3.2 VISION] [FAIL] HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[LLAMA 3.2 VISION] [FAIL] Connection/Execution error: {str(e)}")
        return False

if __name__ == "__main__":
    test_llama_vision()
