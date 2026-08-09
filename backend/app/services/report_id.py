"""CivoAI Report ID Generator"""
from datetime import datetime, timezone
import httpx
import logging
from app.core.config import settings
from app.services.supabase_client import get_supabase_headers

logger = logging.getLogger("civoai.report_id")

def _get_supabase_rest_url() -> str:
    """Build the Supabase REST API base URL."""
    base = settings.SUPABASE_URL.rstrip("/")
    if base.endswith("/rest/v1"):
        return base
    return f"{base}/rest/v1"

def generate_report_id() -> str:
    """
    Generate a unique human-readable report ID in format CIV-YYYY-NNNNNN.
    Calls the Supabase RPC function `generate_civoai_report_id` which uses a sequence.
    """
    rest_url = _get_supabase_rest_url()
    rpc_url = f"{rest_url}/rpc/generate_civoai_report_id"
    headers = get_supabase_headers()

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(rpc_url, headers=headers)
            if res.status_code == 200:
                return res.json()
            else:
                logger.error(f"Failed to generate report ID via RPC: HTTP {res.status_code} - {res.text}")
    except Exception as e:
        logger.error(f"Exception generating report ID via RPC: {e}")

    # Fallback in case of database unavailability or if the RPC hasn't been deployed yet.
    # Uses timestamp to avoid collision since sequence is unavailable.
    year = datetime.now(timezone.utc).strftime("%Y")
    fallback_seq = int(datetime.now(timezone.utc).strftime("%H%M%S"))
    return f"CIV-{year}-{fallback_seq:06d}"
