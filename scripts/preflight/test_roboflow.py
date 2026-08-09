import os
import sys
import json
import time
import httpx
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_roboflow_detection():
    api_key = os.getenv("ROBOFLOW_API_KEY")
    model_id = os.getenv("ROBOFLOW_DETECTION_MODEL_ID") or os.getenv("ROBOFLOW_MODEL_ID")

    if not api_key:
        print("[ROBOFLOW DETECTION] [BLOCKED] ROBOFLOW_API_KEY is not set in environment.")
        return False

    if not model_id:
        print("[ROBOFLOW DETECTION] [BLOCKED] ROBOFLOW_DETECTION_MODEL_ID is not configured in environment.")
        return False

    print(f"[ROBOFLOW DETECTION] Testing model '{model_id}'...")

    fixture_path = os.path.join("tests", "fixtures", "pothole_test.jpg")
    start_time = time.time()

    try:
        with httpx.Client(timeout=15.0) as client:
            if os.path.exists(fixture_path):
                url = f"https://detect.roboflow.com/{model_id}?api_key={api_key}"
                with open(fixture_path, "rb") as f:
                    response = client.post(url, files={"file": f})
            else:
                sample_image_url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"
                url = f"https://detect.roboflow.com/{model_id}?api_key={api_key}&image={sample_image_url}"
                response = client.post(url)

        latency_ms = int((time.time() - start_time) * 1000)

        if response.status_code == 200:
            data = response.json()
            predictions = data.get("predictions", [])
            print(f"[ROBOFLOW DETECTION] [PASS]")
            print(f"HTTP: 200")
            print(f"Model: {model_id}")
            print(f"Detections found: {len(predictions)}")
            print(f"Inference latency: {latency_ms}ms")
            return True
        else:
            reason = response.text[:200].replace(api_key, "REDACTED") if api_key else response.text[:200]
            print(f"[ROBOFLOW DETECTION] [FAIL]")
            print(f"HTTP: {response.status_code}")
            print(f"Reason: {reason}")
            return False
    except Exception as e:
        err_msg = str(e).replace(api_key, "REDACTED") if api_key else str(e)
        print(f"[ROBOFLOW DETECTION] [FAIL] Connection/Execution error: {err_msg}")
        return False

if __name__ == "__main__":
    test_roboflow_detection()
