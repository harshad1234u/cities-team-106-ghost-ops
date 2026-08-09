"""
CivoAI Resend Admin Email Alert Service.
Integrates with Resend API to deliver automated admin notifications
after background AI processing and deterministic risk assessment complete.
"""

import logging
import httpx
from typing import Dict, Any, Optional, Set
from app.core.config import settings

logger = logging.getLogger("civoai.email")

# In-memory idempotency tracking to prevent duplicate admin alert emails
_SENT_EMAIL_REPORT_IDS: Set[str] = set()


def is_email_configured() -> bool:
    """Check whether Resend API key is present and configured."""
    return bool(settings.resend_key)


def reset_email_idempotency_tracker():
    """Reset sent email tracker (useful for testing)."""
    _SENT_EMAIL_REPORT_IDS.clear()


def build_email_subject(report_id: str, pothole_detected: bool, severity: str, priority: str) -> str:
    """Build dynamic email subject based strictly on finalized AI findings."""
    if not pothole_detected:
        return f"CivoAI Report — No Pothole Detected — {report_id}"
    
    if severity == "CRITICAL" or priority == "P0":
        return f"CivoAI Road Damage Alert — CRITICAL ({priority}) — {report_id}"
    
    return f"CivoAI Road Damage Alert — {severity} Priority ({priority}) — {report_id}"


def build_email_html(report_data: Dict[str, Any]) -> str:
    """Build clean, professional HTML email matching the visual reference structure."""
    report_id = report_data.get("report_id", "N/A")
    created_at = report_data.get("created_at", "")
    
    # Location
    location = report_data.get("location") or {}
    road_name = location.get("road_name") or "Road Unspecified"
    landmark = location.get("landmark") or "None"
    lat = location.get("latitude")
    lng = location.get("longitude")
    
    # Citizen inputs
    citizen_danger = report_data.get("citizen_danger", False)
    water_visible = report_data.get("water_visible", False)
    
    # AI data
    ai = report_data.get("ai") or {}
    detection = ai.get("detection") or {}
    pothole_detected = detection.get("pothole_detected", False) if isinstance(detection, dict) else False
    confidence = detection.get("confidence", 0.0) if isinstance(detection, dict) else 0.0
    conf_pct = f"{int(confidence * 100)}%" if confidence else "N/A"
    
    severity = ai.get("severity") or ("NONE" if not pothole_detected else "UNKNOWN")
    priority = ai.get("priority") or ("NONE" if not pothole_detected else "UNKNOWN")
    repair_rec = ai.get("repair_recommendation") or ("No Pothole Detected — No Repair Needed" if not pothole_detected else "Inspection Required")
    estimated_cost = ai.get("estimated_cost") or ("₹0" if not pothole_detected else "Pending")
    ai_summary = ai.get("ai_summary") or ("No pothole hazard identified in visual imagery." if not pothole_detected else f"Automated AI classification: {severity} severity road risk hazard.")
    
    # Visual reasoning details
    visual_analysis = ai.get("visual_analysis") or {}
    apparent_depth = visual_analysis.get("apparent_depth") or "Uncertain"
    surrounding_damage = visual_analysis.get("surrounding_damage") or "Minimal"
    visual_size = visual_analysis.get("visual_size") or "Standard"

    # Image
    image = report_data.get("image") or {}
    image_url = image.get("url") or ""
    
    # Report Link
    frontend_url = (settings.FRONTEND_URL or "http://localhost:5173").rstrip("/")
    report_link = f"{frontend_url}/admin/reports/{report_id}"

    # Semantic Colors
    sev_bg = "#fee2e2" if severity == "CRITICAL" else "#ffedd5" if severity == "HIGH" else "#fef3c7" if severity == "MEDIUM" else "#f3f4f6"
    sev_color = "#991b1b" if severity == "CRITICAL" else "#c2410c" if severity == "HIGH" else "#92400e" if severity == "MEDIUM" else "#374151"

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{build_email_subject(report_id, pothole_detected, severity, priority)}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background-color: #0f172a; color: #ffffff; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 20px; font-weight: 700; tracking-tight: -0.5px;">
                📣 CivoAI Road Damage Alert
            </div>
            <div style="font-size: 14px; font-weight: 600; color: #38bdf8;">
                CivoAI Operations
            </div>
        </div>

        <div style="padding: 24px;">
            <!-- 2-Column Info & Image Container -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                    <!-- Left Column: Location & AI Assessment -->
                    <td width="55%" valign="top" style="padding-right: 12px;">
                        
                        <!-- Location Card -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 14px;">
                            <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
                                📍 Location Information
                            </div>
                            <div style="font-size: 13px; line-height: 1.6; color: #1e293b;">
                                <strong>Road/Street:</strong> {road_name}<br>
                                <strong>Landmark:</strong> {landmark}<br>
                                <strong>Coordinates:</strong> Lat: {lat or 'N/A'}, Long: {lng or 'N/A'}
                            </div>
                        </div>

                        <!-- AI Assessment Card -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                            <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
                                🤖 AI Risk Assessment
                            </div>
                            <div style="font-size: 13px; line-height: 1.7; color: #1e293b;">
                                <strong>Detection:</strong> <span style="font-weight: 700; color: {'#16a34a' if pothole_detected else '#475569'};">{'Pothole Confirmed' if pothole_detected else 'No Pothole Identified'}</span><br>
                                <strong>Severity:</strong> <span style="background: {sev_bg}; color: {sev_color}; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px;">{severity}</span><br>
                                <strong>Priority Level:</strong> <span style="font-weight: 700; color: #2563eb;">{priority}</span><br>
                                <strong>Confidence Score:</strong> {conf_pct}<br>
                                <strong>Apparent Depth:</strong> {apparent_depth}<br>
                                <strong>Surrounding Damage:</strong> {surrounding_damage}<br>
                                <strong>Estimated Repair Cost:</strong> <span style="font-weight: 700; color: #0f172a;">{estimated_cost}</span>
                            </div>
                        </div>
                    </td>

                    <!-- Right Column: Pothole Image -->
                    <td width="45%" valign="top" style="padding-left: 12px;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
                            <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; text-align: left;">
                                📷 Citizen Evidence Image
                            </div>
                            {'<img src="' + image_url + '" alt="Reported Hazard Image" style="width: 100%; height: auto; max-height: 240px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;">' if image_url else '<div style="height: 180px; background: #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 12px;">No Image Provided</div>'}
                        </div>
                    </td>
                </tr>
            </table>

            <!-- AI Summary Section -->
            <div style="margin-top: 18px; padding: 14px; background-color: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px;">
                    AI Analysis Summary
                </div>
                <div style="font-size: 13px; color: #334155; line-height: 1.5;">
                    {ai_summary}
                </div>
            </div>

            <!-- Recommended Action Section -->
            <div style="margin-top: 14px; padding: 14px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 4px;">
                    Recommended Maintenance Action
                </div>
                <div style="font-size: 13px; color: #047857; font-weight: 600; line-height: 1.5;">
                    {repair_rec}
                </div>
            </div>

            <!-- CTA Button -->
            <div style="margin-top: 24px; text-align: center;">
                <a href="{report_link}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                    Inspect Full Report Details →
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 11px; color: #64748b; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span><strong>Report ID:</strong> {report_id}</span>
                <span><strong>Reported:</strong> {created_at}</span>
            </div>
            <div style="margin-top: 6px; color: #94a3b8; font-style: italic;">
                Notice: AI assessment is preliminary and intended for operational triage. Official engineering verification is required before field dispatch.
            </div>
        </div>
    </div>
</body>
</html>"""
    return html


def send_admin_pothole_alert(report_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Delivers an automated admin email alert via Resend API after AI processing completes.
    
    Idempotent & Failure Isolated:
    - Skips duplicate sends for the same report_id.
    - Captures all Resend API errors gracefully without affecting report processing status.
    """
    report_id = report_data.get("report_id", "")
    
    # 1. Idempotency Check
    if report_id and report_id in _SENT_EMAIL_REPORT_IDS:
        logger.info(f"Email notification for {report_id} skipped: duplicate notification prevented.")
        return {"status": "skipped", "reason": "already_sent", "report_id": report_id}

    # 2. Resend API Key Check
    api_key = settings.resend_key
    if not api_key:
        logger.warning(f"Email notification for {report_id} skipped: RESEND_API_KEY is not configured.")
        return {"status": "skipped", "reason": "not_configured", "report_id": report_id}

    from_email = settings.EMAIL_FROM or "onboarding@resend.dev"
    to_email = settings.ADMIN_EMAIL or "admin@example.com"
    
    ai_info = report_data.get("ai") or {}
    detection = ai_info.get("detection") or {}
    pothole_detected = detection.get("pothole_detected", False) if isinstance(detection, dict) else False
    severity = ai_info.get("severity") or ("NONE" if not pothole_detected else "UNKNOWN")
    priority = ai_info.get("priority") or ("NONE" if not pothole_detected else "UNKNOWN")
    
    subject = build_email_subject(report_id, pothole_detected, severity, priority)
    html_content = build_email_html(report_data)

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }

    try:
        with httpx.Client(timeout=12.0) as client:
            res = client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            
            if res.status_code in (200, 201):
                res_data = res.json()
                msg = f"🚀 [Resend Admin Alert] Successfully delivered email for report {report_id} to {to_email} (Resend ID: {res_data.get('id')})"
                logger.info(msg)
                print(msg)
                if report_id:
                    _SENT_EMAIL_REPORT_IDS.add(report_id)
                return {
                    "status": "success",
                    "resend_id": res_data.get("id"),
                    "recipient": to_email,
                    "report_id": report_id,
                }
            
            err_msg = f"❌ [Resend Admin Alert] Failed to send email for {report_id}: HTTP {res.status_code} — {res.text[:200]}"
            logger.error(err_msg)
            print(err_msg)
            return {
                "status": "failed",
                "http_status": res.status_code,
                "error": res.text[:200],
                "report_id": report_id,
            }
            
    except Exception as e:
        logger.error(f"Resend email request exception for {report_id}: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "report_id": report_id,
        }


def send_admin_email(
    report_id: str,
    image_url: str,
    citizen_data: Dict[str, Any],
    ai_data: Dict[str, Any],
    risk_data: Dict[str, str]
) -> bool:
    """Legacy alias helper function for backward compatibility."""
    mock_report = {
        "report_id": report_id,
        "image": {"url": image_url},
        "location": {
            "road_name": citizen_data.get("road_name"),
            "landmark": citizen_data.get("landmark"),
            "latitude": citizen_data.get("latitude"),
            "longitude": citizen_data.get("longitude"),
        },
        "citizen_danger": citizen_data.get("citizen_danger", False),
        "water_visible": citizen_data.get("water_visible", False),
        "ai": {
            "detection": {"pothole_detected": ai_data.get("pothole_detected", True), "confidence": ai_data.get("confidence", 0.8)},
            "severity": risk_data.get("severity", "MEDIUM"),
            "priority": risk_data.get("priority", "P2"),
            "repair_recommendation": risk_data.get("recommendation") or risk_data.get("repair_recommendation"),
            "estimated_cost": risk_data.get("cost") or risk_data.get("estimated_cost"),
            "ai_summary": ai_data.get("summary", ""),
        },
        "created_at": "Just now",
    }
    result = send_admin_pothole_alert(mock_report)
    return result.get("status") == "success"
