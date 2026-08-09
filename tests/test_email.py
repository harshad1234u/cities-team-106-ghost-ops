import pytest
from unittest.mock import patch, MagicMock
from backend.app.services.email_service import (
    send_admin_pothole_alert,
    build_email_subject,
    build_email_html,
    reset_email_idempotency_tracker,
    is_email_configured,
)

@pytest.fixture(autouse=True)
def clear_idempotency():
    reset_email_idempotency_tracker()


def test_email_configuration_check():
    """TEST 1: Missing or blank API key reports not configured gracefully without crashing."""
    with patch("backend.app.services.email_service.settings") as mock_settings:
        mock_settings.resend_key = ""
        mock_settings.EMAIL_PROVIDER_API_KEY = ""
        
        report = {"report_id": "CIV-TEST-CONFIG-001"}
        result = send_admin_pothole_alert(report)
        assert result["status"] == "skipped"
        assert result["reason"] == "not_configured"


def test_email_subject_and_html_generation_positive_pothole():
    """TEST 2 & 6: Positive pothole report generates accurate subject and HTML payload."""
    report = {
        "report_id": "CIV-2026-000123",
        "created_at": "2026-08-09T07:00:00Z",
        "image": {"url": "https://eckmchgpoiemyczwniqx.supabase.co/signed-image.jpg"},
        "location": {
            "road_name": "Anna Salai Main Road",
            "landmark": "Near Bus Stand",
            "latitude": 13.0827,
            "longitude": 80.2707,
        },
        "citizen_danger": True,
        "water_visible": True,
        "ai": {
            "detection": {"pothole_detected": True, "confidence": 0.88},
            "visual_analysis": {
                "apparent_depth": "deep",
                "surrounding_damage": "extensive",
                "visual_size": "large"
            },
            "severity": "HIGH",
            "priority": "P1",
            "repair_recommendation": "Mill & Heavy Hot-Mix Bituminous Patching",
            "estimated_cost": "₹12,000 - ₹24,000",
            "ai_summary": "Automated AI classification: HIGH severity road risk hazard."
        }
    }

    subject = build_email_subject("CIV-2026-000123", True, "HIGH", "P1")
    assert "CivoAI Road Damage Alert — HIGH Priority (P1) — CIV-2026-000123" in subject

    html = build_email_html(report)
    assert "CIV-2026-000123" in html
    assert "Anna Salai Main Road" in html
    assert "HIGH" in html
    assert "P1" in html
    assert "Mill &amp; Heavy Hot-Mix Bituminous Patching" in html or "Mill & Heavy Hot-Mix Bituminous Patching" in html
    assert "₹12,000 - ₹24,000" in html
    assert "https://eckmchgpoiemyczwniqx.supabase.co/signed-image.jpg" in html
    assert "AI assessment is preliminary and intended for operational triage" in html


def test_non_pothole_email_behavior():
    """TEST 5: Non-pothole visual detection clearly states No Pothole Detected with NONE/₹0."""
    report = {
        "report_id": "CIV-2026-000999",
        "created_at": "2026-08-09T07:00:00Z",
        "image": {"url": "https://eckmchgpoiemyczwniqx.supabase.co/signed-clean-road.jpg"},
        "location": {"road_name": "Spider-Man Test Road"},
        "citizen_danger": True,
        "water_visible": True,
        "ai": {
            "detection": {"pothole_detected": False, "confidence": 0.0},
            "severity": "NONE",
            "priority": "NONE",
            "repair_recommendation": "No Pothole Detected — No Repair Needed",
            "estimated_cost": "₹0",
            "ai_summary": "No pothole hazard identified in visual imagery."
        }
    }

    subject = build_email_subject("CIV-2026-000999", False, "NONE", "NONE")
    assert subject == "CivoAI Report — No Pothole Detected — CIV-2026-000999"

    html = build_email_html(report)
    assert "No Pothole Identified" in html
    assert "NONE" in html
    assert "₹0" in html
    assert "CRITICAL" not in subject


def test_email_failure_isolation():
    """TEST 3: Resend API failure is gracefully captured without throwing exceptions."""
    report = {
        "report_id": "CIV-TEST-FAIL-001",
        "ai": {"detection": {"pothole_detected": True}, "severity": "HIGH", "priority": "P1"}
    }

    with patch("httpx.Client.post") as mock_post:
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_resp.text = "Internal Server Error"
        mock_post.return_value = mock_resp

        result = send_admin_pothole_alert(report)
        assert result["status"] == "failed"
        assert result["http_status"] == 500
        assert "Internal Server Error" in result["error"]


def test_email_duplicate_prevention_idempotency():
    """TEST 4: Duplicate processing requests for the same report_id do NOT trigger repeated emails."""
    report = {
        "report_id": "CIV-IDEMPOTENT-100",
        "ai": {"detection": {"pothole_detected": True}, "severity": "HIGH", "priority": "P1"}
    }

    with patch("httpx.Client.post") as mock_post:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"id": "resend_msg_12345"}
        mock_post.return_value = mock_resp

        # First call succeeds
        res1 = send_admin_pothole_alert(report)
        assert res1["status"] == "success"
        assert res1["resend_id"] == "resend_msg_12345"

        # Second call is skipped by idempotency filter
        res2 = send_admin_pothole_alert(report)
        assert res2["status"] == "skipped"
        assert res2["reason"] == "already_sent"
        
        # Verify HTTP post was invoked ONLY once
        assert mock_post.call_count == 1
