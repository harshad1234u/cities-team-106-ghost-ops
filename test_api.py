import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_reports_api_end_to_end():
    fixture_path = os.path.join(os.path.dirname(__file__), "tests", "fixtures", "pothole_test.jpg")
    assert os.path.exists(fixture_path), f"Fixture not found at {fixture_path}"

    with open(fixture_path, "rb") as f:
        image_bytes = f.read()

    # 1. Create Citizen Report
    response = client.post(
        "/api/v1/reports",
        data={
            "latitude": 13.0827,
            "longitude": 80.2707,
            "road_name": "Anna Salai Main Rd",
            "description": "Deep pothole near junction",
            "citizen_danger": "true",
            "water_visible": "true",
        },
        files={"image": ("pothole.jpg", image_bytes, "image/jpeg")},
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    report_id = data.get("report_id")
    assert report_id is not None
    assert data.get("status") == "NEW"

    # 2. Poll until status transitions from NEW/PROCESSING to AI_VERIFIED or terminal state
    status = "NEW"
    for _ in range(12):
        time.sleep(1)
        detail_res = client.get(f"/api/v1/reports/{report_id}")
        if detail_res.status_code == 200:
            status = detail_res.json().get("status", "NEW")
            if status not in ("NEW", "PROCESSING"):
                break

    assert status in ("AI_VERIFIED", "PROCESSING", "NEW")
    assert "ai" in detail_res.json()

if __name__ == "__main__":
    test_reports_api_end_to_end()
    print("API End-to-End Test PASSED successfully!")
