import os
import sys
import json
import time
import httpx
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_roboflow_segmentation():
    api_key = os.getenv("ROBOFLOW_API_KEY")
    model_id = os.getenv("ROBOFLOW_SEGMENTATION_MODEL_ID")

    if not api_key:
        print("[ROBOFLOW SEGMENTATION] [BLOCKED]")
        print("Reason: ROBOFLOW_API_KEY is not set in environment")
        return "BLOCKED"

    if not model_id:
        print("[ROBOFLOW SEGMENTATION] [BLOCKED]")
        print("Reason: ROBOFLOW_SEGMENTATION_MODEL_ID is not configured")
        return "BLOCKED"

    print(f"[ROBOFLOW SEGMENTATION] Testing model '{model_id}'...")

    fixture_path = os.path.join("tests", "fixtures", "pothole_test.jpg")
    start_time = time.time()

    # Roboflow instance/polygon segmentation inference endpoint (outline or detect with polygon)
    url = f"https://outline.roboflow.com/{model_id}?api_key={api_key}"

    try:
        with httpx.Client(timeout=15.0) as client:
            if os.path.exists(fixture_path):
                with open(fixture_path, "rb") as f:
                    response = client.post(url, files={"file": f})
            else:
                sample_image_url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"
                full_url = f"{url}&image={sample_image_url}"
                response = client.post(full_url)

        # Fallback to detect endpoint if outline endpoint is 404
        if response.status_code == 404:
            fallback_url = f"https://detect.roboflow.com/{model_id}?api_key={api_key}"
            with httpx.Client(timeout=15.0) as client:
                if os.path.exists(fixture_path):
                    with open(fixture_path, "rb") as f:
                        response = client.post(fallback_url, files={"file": f})
                else:
                    sample_image_url = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"
                    response = client.post(f"{fallback_url}&image={sample_image_url}")

        latency_ms = int((time.time() - start_time) * 1000)

        if response.status_code == 200:
            data = response.json()
            predictions = data.get("predictions", [])

            # Check if model returns segmentation masks / polygon points
            has_segmentation_capability = False
            mask_count = 0

            for p in predictions:
                if isinstance(p, dict):
                    # Roboflow segmentation returns 'points', 'polygon', 'mask', or 'segmentation'
                    if "points" in p or "polygon" in p or "mask" in p or "segmentation" in p:
                        has_segmentation_capability = True
                        mask_count += 1

            if len(predictions) > 0 and not has_segmentation_capability:
                print("[ROBOFLOW SEGMENTATION] [BLOCKED]")
                print("Reason: Configured model does not provide segmentation output.")
                return "BLOCKED"

            if mask_count > 0:
                print(f"[ROBOFLOW SEGMENTATION] [PASS]")
                print(f"HTTP: 200")
                print(f"Model: {model_id}")
                print(f"Masks detected: {mask_count}")
                print(f"Inference latency: {latency_ms}ms")
                return "PASS"
            else:
                print(f"[ROBOFLOW SEGMENTATION] [WARNING]")
                print(f"HTTP: 200")
                print("Inference succeeded, but no segmentation mask was detected.")
                return "WARNING"
        else:
            reason = response.text[:200].replace(api_key, "REDACTED")
            print(f"[ROBOFLOW SEGMENTATION] [FAIL]")
            print(f"HTTP: {response.status_code}")
            print(f"Reason: {reason}")
            return "FAIL"
    except Exception as e:
        err_msg = str(e).replace(api_key, "REDACTED") if api_key else str(e)
        print(f"[ROBOFLOW SEGMENTATION] [FAIL]")
        print(f"Reason: {err_msg}")
        return "FAIL"

if __name__ == "__main__":
    test_roboflow_segmentation()
