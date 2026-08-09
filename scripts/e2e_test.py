import os
import sys
import time
import httpx
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:8000/api/v1"
TEST_IMAGE_PATH = os.getenv("TEST_IMAGE_PATH", "scripts/test_pothole.jpg")

def run_test():
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"Error: {TEST_IMAGE_PATH} does not exist.")
        print("Please use a real pothole image or set TEST_IMAGE_PATH environment variable.")
        return False

    print("Submitting citizen report...")
    report_data = {
        "latitude": "37.7749",
        "longitude": "-122.4194",
        "road_name": "E2E Test Boulevard",
        "description": "Deep pothole causing swerving.",
        "citizen_danger": "true",
        "water_visible": "false"
    }

    with open(TEST_IMAGE_PATH, "rb") as f:
        files = {"image": ("test_pothole.jpg", f, "image/jpeg")}
        res = httpx.post(f"{API_URL}/reports", data=report_data, files=files, timeout=30.0)

    if res.status_code != 200:
        print(f"Failed to create report: {res.text}")
        return False
        
    data = res.json()
    report_id = data["report_id"]
    print(f"Report created successfully: {report_id}")
    
    # Poll GET /reports/{report_id} until AI_VERIFIED or timeout
    print("Polling for background AI processing completion...")
    max_attempts = 15 # 75 seconds
    ai_verified = False
    final_report = None
    
    for attempt in range(max_attempts):
        res = httpx.get(f"{API_URL}/reports/{report_id}", timeout=10.0)
        if res.status_code == 200:
            final_report = res.json()
            status = final_report.get("status")
            print(f"Attempt {attempt + 1}/{max_attempts}: Status is {status}")
            
            if status == "AI_VERIFIED":
                ai_verified = True
                break
        else:
            print(f"Failed to fetch report status: {res.status_code}")
            
        time.sleep(5)
        
    if not ai_verified:
        print(f"Report {report_id} did not reach AI_VERIFIED state in time.")
        return False

    print("\nAI Processing completed. Verifying results...")
    ai_data = final_report.get("ai", {})
    
    if not ai_data:
        print("No AI data found in the unified report!")
        return False
        
    print(f"AI Severity: {ai_data.get('severity')}")
    print(f"AI Priority: {ai_data.get('priority')}")
    print(f"Detection: {ai_data.get('detection')}")
    
    print("\nVerifying Admin GET /reports endpoint...")
    admin_res = httpx.get(f"{API_URL}/reports?limit=5", timeout=10.0)
    if admin_res.status_code == 200:
        admin_data = admin_res.json()
        print(f"Admin API returned {len(admin_data)} reports.")
    else:
        print(f"Admin API failed: {admin_res.status_code}")
        return False
        
    print("\n✅ Full Background E2E pipeline test passed!")
    return True

if __name__ == "__main__":
    run_test()
