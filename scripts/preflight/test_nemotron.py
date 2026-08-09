import os
import sys
import json
import httpx
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_nemotron():
    api_key = os.getenv("NVIDIA_NIM_API_KEY")
    model_name = os.getenv("NVIDIA_NIM_MODEL", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning")

    if not api_key:
        print("[NVIDIA NEMOTRON] [BLOCKED] NVIDIA_NIM_API_KEY is not set in environment.")
        return False

    print(f"[NVIDIA NEMOTRON] Testing Nemotron API with model '{model_name}'...")

    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": "Perform a concise visual analysis check on a sample road pothole image. Respond with structured visual assessment categories (size, depth category, damage)."
            }
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            if content:
                print(f"[NVIDIA NEMOTRON] [PASS] HTTP 200 OK. Response: {content[:150]}...")
                return True
            else:
                print("[NVIDIA NEMOTRON] [FAIL] HTTP 200 returned but response content was empty.")
                return False
        else:
            print(f"[NVIDIA NEMOTRON] [FAIL] HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[NVIDIA NEMOTRON] [FAIL] Connection/Execution error: {str(e)}")
        return False

if __name__ == "__main__":
    test_nemotron()
