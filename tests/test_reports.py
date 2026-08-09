"""
CivoAI Reports API Test Suite
Tests POST /api/v1/reports, GET /api/v1/reports/{report_id}, and edge cases.
Uses FastAPI TestClient (no running server required).
"""
import os
import sys
import io
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def print_result(name: str, passed: bool, detail: str = "") -> bool:
    status = "[PASS]" if passed else "[FAIL]"
    msg = f"  {status} {name}"
    if detail:
        msg += f" — {detail}"
    print(msg)
    return passed


def _load_fixture_image() -> bytes:
    """Load the pothole test fixture image."""
    path = os.path.join(os.path.dirname(__file__), "fixtures", "pothole_test.jpg")
    if not os.path.exists(path):
        return b""
    with open(path, "rb") as f:
        return f.read()


def _make_minimal_png() -> bytes:
    """Create a tiny valid PNG for testing."""
    return (
        b"\x89PNG\r\n\x1a\n"  # PNG signature
        b"\x00\x00\x00\rIHDR"  # IHDR chunk
        b"\x00\x00\x00\xc8"  # width = 200
        b"\x00\x00\x00\xc8"  # height = 200
        b"\x08\x02"  # bit depth 8, color type 2 (RGB)
        b"\x00\x00\x00"  # compression, filter, interlace
        b"\x00\xd8\x12\x0b"  # CRC (placeholder)
        b"\x00\x00\x00\x00IEND\xaeB`\x82"  # IEND chunk
    )


def test_post_report():
    """Test creating a new report with a valid image."""
    image_bytes = _load_fixture_image()
    if not image_bytes:
        return print_result("POST report", False, "pothole_test.jpg fixture not found")

    res = client.post(
        "/api/v1/reports",
        data={
            "latitude": "10.123456",
            "longitude": "78.123456",
            "road_name": "Test Road",
            "description": "Integration test pothole report",
            "citizen_danger": "true",
            "water_visible": "false",
        },
        files={"image": ("test_pothole.jpg", image_bytes, "image/jpeg")},
    )

    if res.status_code != 200:
        return print_result(
            "POST report", False, f"HTTP {res.status_code}: {res.text[:200]}"
        )

    data = res.json()
    report_id = data.get("report_id", "")

    passed = True
    passed &= print_result(
        "POST report", res.status_code == 200, f"report_id={report_id}"
    )
    passed &= print_result(
        "Report ID generated",
        report_id.startswith("CIV-") and len(report_id) == 15,
        report_id,
    )
    passed &= print_result(
        "Status is NEW", data.get("status") == "NEW"
    )
    passed &= print_result(
        "Success message",
        "created" in data.get("message", "").lower(),
    )

    return passed, report_id


def _test_get_report(report_id: str):
    """Test retrieving a report by report_id."""
    res = client.get(f"/api/v1/reports/{report_id}")

    if res.status_code != 200:
        return print_result(
            "GET report", False, f"HTTP {res.status_code}: {res.text[:200]}"
        )

    data = res.json()
    passed = True
    passed &= print_result(
        "GET report", True, f"report_id={data.get('report_id')}"
    )
    passed &= print_result(
        "Image path present",
        bool(data.get("image", {}).get("path")),
    )
    passed &= print_result(
        "Location data",
        data.get("location", {}).get("latitude") is not None,
        f"lat={data.get('location', {}).get('latitude')}",
    )
    passed &= print_result(
        "AI fields null (not processed yet)",
        data.get("ai", {}).get("detection") is None,
    )
    passed &= print_result(
        "Created timestamp present",
        bool(data.get("created_at")),
    )

    return passed


def test_get_nonexistent_report():
    """Test that requesting a non-existent report returns 404."""
    res = client.get("/api/v1/reports/CIV-9999-999999")
    return print_result(
        "GET nonexistent report → 404",
        res.status_code == 404,
        f"HTTP {res.status_code}",
    )


def test_no_image():
    """Test that submitting without an image is rejected."""
    res = client.post(
        "/api/v1/reports",
        data={
            "latitude": "10.0",
            "longitude": "78.0",
        },
    )
    return print_result(
        "Missing image rejected",
        res.status_code in (400, 422),
        f"HTTP {res.status_code}",
    )


def test_invalid_file_type():
    """Test that non-image files are rejected."""
    fake_pdf = b"%PDF-1.4 fake content here"
    res = client.post(
        "/api/v1/reports",
        data={"latitude": "10.0", "longitude": "78.0"},
        files={"image": ("document.pdf", fake_pdf, "application/pdf")},
    )
    return print_result(
        "Invalid file type rejected",
        res.status_code == 400,
        f"HTTP {res.status_code}",
    )


def test_corrupted_image():
    """Test that corrupted image data is rejected."""
    corrupted = b"\xff\xd8\xff\xe0" + b"\x00" * 100  # Fake JPEG header + garbage
    res = client.post(
        "/api/v1/reports",
        data={"latitude": "10.0", "longitude": "78.0"},
        files={"image": ("bad_image.jpg", corrupted, "image/jpeg")},
    )
    return print_result(
        "Corrupted image rejected",
        res.status_code == 400,
        f"HTTP {res.status_code}",
    )


def test_oversized_image():
    """Test that oversized images are rejected."""
    # Create data larger than MAX_IMAGE_SIZE_MB
    max_bytes = (settings.MAX_IMAGE_SIZE_MB + 1) * 1024 * 1024
    oversized = b"\xff\xd8\xff\xe0" + (b"\x00" * max_bytes)
    res = client.post(
        "/api/v1/reports",
        data={"latitude": "10.0", "longitude": "78.0"},
        files={"image": ("huge.jpg", oversized, "image/jpeg")},
    )
    return print_result(
        "Oversized image rejected",
        res.status_code == 400,
        f"HTTP {res.status_code}",
    )


def run_reports_tests():
    print("=" * 50)
    print("CivoAI REPORTS API TEST SUITE")
    print("=" * 50)
    print()

    all_passed = True
    created_report_id = None

    # Check prerequisites
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("  [SKIP] Supabase not configured — cannot run reports tests")
        print(f"\n{'=' * 50}")
        print("REPORTS: SKIPPED")
        print(f"{'=' * 50}")
        return 1

    # Test 1: POST report
    print("--- Create Report ---")
    result = test_post_report()
    if isinstance(result, tuple):
        post_passed, created_report_id = result
        all_passed &= post_passed
    else:
        all_passed = False
    print()

    # Test 2: GET report (only if POST succeeded)
    print("--- Retrieve Report ---")
    if created_report_id:
        all_passed &= _test_get_report(created_report_id)
    else:
        print_result("GET report", False, "No report created to retrieve")
        all_passed = False
    print()

    # Test 3: GET nonexistent report
    print("--- Edge Cases ---")
    all_passed &= test_get_nonexistent_report()

    # Test 4: No image
    all_passed &= test_no_image()

    # Test 5: Invalid file type
    all_passed &= test_invalid_file_type()

    # Test 6: Corrupted image
    all_passed &= test_corrupted_image()

    # Test 7: Oversized image
    all_passed &= test_oversized_image()

    # Summary
    print(f"\n{'=' * 50}")
    status = "PASS" if all_passed else "FAILED"
    print(f"REPORTS: {status}")
    print(f"{'=' * 50}")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(run_reports_tests())
