"""CivoAI Supabase Service — 4-Table CRUD Operations"""
import logging
import time
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone
import httpx
from backend.app.core.config import settings
from backend.app.services.supabase_client import get_supabase_headers

logger = logging.getLogger("civoai.supabase_service")


def _get_rest_url() -> str:
    """Build Supabase REST API base URL."""
    base = settings.SUPABASE_URL.rstrip("/")
    if base.endswith("/rest/v1"):
        return base
    return f"{base}/rest/v1"


def _get_storage_url() -> str:
    """Build Supabase Storage API base URL."""
    base = settings.SUPABASE_URL.rstrip("/")
    if "/rest/v1" in base:
        base = base.split("/rest/v1")[0]
    return f"{base}/storage/v1"


def upload_report_image(content: bytes, storage_path: str, content_type: str) -> bool:
    """Upload an image to Supabase Storage."""
    storage_url = _get_storage_url()
    upload_url = f"{storage_url}/object/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            res = client.post(upload_url, headers=headers, content=content)
            if res.status_code in (200, 201):
                return True
            logger.error(f"Storage upload failed: HTTP {res.status_code} — {res.text[:200]}")
            return False
    except Exception as e:
        logger.error(f"Storage upload exception: {e}")
        return False


def delete_storage_file(storage_path: str) -> bool:
    """Delete a file from Supabase Storage."""
    storage_url = _get_storage_url()
    delete_url = f"{storage_url}/object/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.delete(delete_url, headers=headers)
            return res.status_code in (200, 204)
    except Exception as e:
        logger.warning(f"Storage cleanup failed for '{storage_path}': {e}")
        return False


def download_storage_file(storage_path: str) -> Optional[bytes]:
    """Download a file from Supabase Storage."""
    storage_url = _get_storage_url()
    download_url = f"{storage_url}/object/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            res = client.get(download_url, headers=headers)
            if res.status_code == 200:
                return res.content
            logger.error(f"Storage download failed: HTTP {res.status_code}")
            return None
    except Exception as e:
        logger.error(f"Storage download exception: {e}")
        return None


_signed_url_cache: Dict[str, Any] = {}


def create_signed_url(storage_path: str, expires_in: int = 3600) -> Optional[str]:
    """Generate an authenticated signed URL for a stored file in private Supabase bucket."""
    if not storage_path:
        return None

    # Check cache first
    now = time.time()
    if storage_path in _signed_url_cache:
        cached_url, exp_time = _signed_url_cache[storage_path]
        if now < exp_time:
            return cached_url

    storage_url = _get_storage_url()
    sign_url = f"{storage_url}/object/sign/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
    headers = get_supabase_headers()
    payload = {"expiresIn": expires_in}

    try:
        with httpx.Client(timeout=0.8) as client:
            res = client.post(sign_url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                signed_path = data.get("signedURL", "")
                if signed_path:
                    base = settings.SUPABASE_URL.rstrip("/")
                    if "/rest/v1" in base:
                        base = base.split("/rest/v1")[0]
                    full_url = f"{base}/storage/v1{signed_path}"
                    _signed_url_cache[storage_path] = (full_url, now + expires_in - 300)
                    return full_url
    except Exception as e:
        logger.warning(f"Could not generate signed URL for {storage_path}: {e}")

    # Fallback to public URL structure
    base = settings.SUPABASE_URL.rstrip("/")
    if "/rest/v1" in base:
        base = base.split("/rest/v1")[0]
    return f"{base}/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"






def insert_citizen_report(data: Dict[str, Any]) -> Optional[Dict]:
    """Insert a new report record into the citizen_reports table."""
    rest_url = _get_rest_url()
    url = f"{rest_url}/citizen_reports"
    headers = {
        **get_supabase_headers(),
        "Prefer": "return=representation",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, json=data)
            if res.status_code in (200, 201):
                rows = res.json()
                return rows[0] if isinstance(rows, list) and rows else rows
            logger.error(f"DB insert_citizen_report failed: HTTP {res.status_code} — {res.text[:300]}")
            return None
    except Exception as e:
        logger.error(f"DB insert_citizen_report exception: {e}")
        return None


def get_citizen_report_by_report_id(report_id: str) -> Optional[Dict]:
    """Retrieve a citizen report by its human-readable report_id."""
    rest_url = _get_rest_url()
    headers = get_supabase_headers()
    url = f"{rest_url}/citizen_reports?report_id=eq.{report_id}&limit=1"

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code == 200:
                rows = res.json()
                if not rows:
                    return None
                report = rows[0]
                cid = report.get("id")
                if cid:
                    ai_res = client.get(f"{rest_url}/ai_reports?citizen_report_id=eq.{cid}&limit=1", headers=headers)
                    if ai_res.status_code == 200:
                        ai_rows = ai_res.json()
                        report["ai_reports"] = ai_rows if isinstance(ai_rows, list) else []
                    else:
                        report["ai_reports"] = []
                else:
                    report["ai_reports"] = []
                return report
            return None
    except Exception as e:
        logger.error(f"DB get_citizen_report_by_report_id exception: {e}")
        return None


def update_citizen_report_status(report_id: str, new_status: str) -> bool:
    """Update a citizen report's status."""
    rest_url = _get_rest_url()
    url = f"{rest_url}/citizen_reports?report_id=eq.{report_id}"
    headers = {
        **get_supabase_headers(),
        "Prefer": "return=minimal",
    }
    
    data = {"status": new_status}

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.patch(url, headers=headers, json=data)
            return res.status_code in (200, 204)
    except Exception as e:
        logger.error(f"DB update_citizen_report_status exception: {e}")
        return False


def insert_ai_report(data: Dict[str, Any]) -> Optional[Dict]:
    """Insert a new AI report record."""
    rest_url = _get_rest_url()
    url = f"{rest_url}/ai_reports"
    headers = {
        **get_supabase_headers(),
        "Prefer": "return=representation",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, json=data)
            if res.status_code in (200, 201):
                rows = res.json()
                return rows[0] if isinstance(rows, list) and rows else rows
            logger.error(f"DB insert_ai_report failed: HTTP {res.status_code} — {res.text[:300]}")
            return None
    except Exception as e:
        logger.error(f"DB insert_ai_report exception: {e}")
        return None


def get_all_citizen_reports(limit: int = 50, offset: int = 0) -> list:
    """Fetch all citizen reports with their AI reports joined, paginated."""
    rest_url = _get_rest_url()
    headers = get_supabase_headers()
    url = f"{rest_url}/citizen_reports?select=*&is_deleted=eq.false&order=created_at.desc&limit={limit}&offset={offset}"
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code != 200:
                return []
            reports = res.json()
            if not reports:
                return []

            citizen_ids = [r["id"] for r in reports if r.get("id")]
            if citizen_ids:
                ids_str = ",".join(citizen_ids)
                ai_res = client.get(f"{rest_url}/ai_reports?citizen_report_id=in.({ids_str})", headers=headers)
                if ai_res.status_code == 200:
                    ai_rows = ai_res.json()
                    ai_map = {ai["citizen_report_id"]: ai for ai in ai_rows if isinstance(ai, dict) and ai.get("citizen_report_id")}
                    for r in reports:
                        cid = r.get("id")
                        if cid in ai_map:
                            r["ai_reports"] = [ai_map[cid]]
                        else:
                            r["ai_reports"] = []
            return reports
    except Exception as e:
        logger.error(f"DB get_all_citizen_reports exception: {e}")
        return []



def upsert_user(user_id: str, email: str, role: str, full_name: Optional[str] = None) -> bool:
    """Upsert a user into the public.users table using service role key (bypasses RLS). Preserves registered role if already set."""
    rest_url = _get_rest_url()
    headers = get_supabase_headers()

    # First check if user already exists with a role
    existing_role = None
    try:
        with httpx.Client(timeout=5.0) as client:
            check_res = client.get(f"{rest_url}/users?id=eq.{user_id}&select=role", headers=headers)
            if check_res.status_code == 200:
                rows = check_res.json()
                if rows and isinstance(rows, list) and rows[0].get("role"):
                    existing_role = rows[0].get("role")
    except Exception as e:
        logger.warning(f"Could not check existing user role: {e}")

    # Use existing registered role if already present in DB
    final_role = existing_role if existing_role else role

    url = f"{rest_url}/users"
    post_headers = {
        **headers,
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    data = {
        "id": user_id,
        "email": email,
        "role": final_role,
    }
    if full_name:
        data["full_name"] = full_name

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, headers=post_headers, json=data)
            if res.status_code in (200, 201, 204):
                logger.info(f"Successfully upserted user {user_id} ({email}) with role '{final_role}' into public.users")
                return True
            logger.error(f"DB upsert_user failed: HTTP {res.status_code} — {res.text[:200]}")
            return False
    except Exception as e:
        logger.error(f"DB upsert_user exception: {e}")
        return False


def get_users_by_role(role: Optional[str] = None) -> list:
    """Fetch users from public.users table using service role key (bypasses RLS)."""
    rest_url = _get_rest_url()
    headers = get_supabase_headers()
    url = f"{rest_url}/users?order=created_at.desc"
    if role:
        url = f"{rest_url}/users?role=eq.{role}&order=created_at.desc"

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code == 200:
                return res.json()
            logger.error(f"DB get_users_by_role failed: HTTP {res.status_code}")
            return []
    except Exception as e:
        logger.error(f"DB get_users_by_role exception: {e}")
        return []


def insert_engineer_report(data: Dict[str, Any]) -> Optional[Dict]:
    """Insert or update an engineer assessment record in engineer_reports table."""
    rest_url = _get_rest_url()
    url = f"{rest_url}/engineer_reports"
    headers = {
        **get_supabase_headers(),
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, json=data)
            if res.status_code in (200, 201):
                rows = res.json()
                logger.info(f"Successfully saved engineer report for report_id: {data.get('report_id')}")
                return rows[0] if isinstance(rows, list) and rows else rows
            logger.error(f"DB insert_engineer_report failed: HTTP {res.status_code} — {res.text[:300]}")
            return None
    except Exception as e:
        logger.error(f"DB insert_engineer_report exception: {e}")
        return None

def soft_delete_citizen_report(report_id: str, admin_id: str, reason: str, note: str = "") -> bool:
    """Soft-delete a citizen report by marking is_deleted=true."""
    rest_url = _get_rest_url()
    url = f"{rest_url}/citizen_reports?report_id=eq.{report_id}"
    headers = {
        **get_supabase_headers(),
        "Prefer": "return=minimal",
    }
    data = {
        "is_deleted": True,
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "deleted_by": admin_id,
        "deletion_reason": reason,
        "deletion_note": note or "",
        "status": "REMOVED",
    }
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.patch(url, headers=headers, json=data)
            return res.status_code in (200, 204)
    except Exception as e:
        logger.error(f"DB soft_delete_citizen_report exception: {e}")
        return False

def get_removed_citizen_reports(limit: int = 50, offset: int = 0) -> list:
    """Fetch soft-deleted citizen reports for admin audit history."""
    rest_url = _get_rest_url()
    headers = get_supabase_headers()
    url = f"{rest_url}/citizen_reports?select=*&is_deleted=eq.true&order=deleted_at.desc&limit={limit}&offset={offset}"
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=headers)
            if res.status_code != 200:
                return []
            reports = res.json()
            return reports if reports else []
    except Exception as e:
        logger.error(f"DB get_removed_citizen_reports exception: {e}")
        return []




