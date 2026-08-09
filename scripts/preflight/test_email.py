import os
import sys
import httpx
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_email():
    api_key = os.getenv("EMAIL_PROVIDER_API_KEY")
    email_from = os.getenv("EMAIL_FROM", "civoai-alerts@resend.dev")
    admin_email = os.getenv("ADMIN_EMAIL")

    if not api_key or not admin_email:
        print("[EMAIL PROVIDER] [BLOCKED] EMAIL_PROVIDER_API_KEY or ADMIN_EMAIL is not set.")
        return False

    print(f"[EMAIL PROVIDER] Sending pre-flight test email to '{admin_email}' via Resend/Email API...")

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "from": email_from,
        "to": [admin_email],
        "subject": "[PRE-FLIGHT TEST] CivoAI Admin Alert Verification",
        "html": """
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #d9534f;">CivoAI Pre-Flight Verification</h2>
            <p>This is a real test email sent during <strong>CivoAI Phase 0 Pre-Flight Verification</strong>.</p>
            <hr>
            <p><strong>Status:</strong> PRE-FLIGHT VERIFIED</p>
            <p><strong>Recipient:</strong> Admin Inbox Received</p>
        </div>
        """
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, headers=headers, json=payload)

        if response.status_code in (200, 201):
            print(f"[EMAIL PROVIDER] [PASS] Email request succeeded (HTTP {response.status_code}). Email sent to '{admin_email}'.")
            return True
        else:
            print(f"[EMAIL PROVIDER] [FAIL] HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[EMAIL PROVIDER] [FAIL] Connection/Execution error: {str(e)}")
        return False

if __name__ == "__main__":
    test_email()
