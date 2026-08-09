import os
import httpx
from typing import Dict, Any, Optional
from backend.app.core.config import settings

def get_supabase_headers() -> Dict[str, str]:
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

def verify_supabase_connection() -> bool:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return False
    
    rest_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/"
    headers = get_supabase_headers()
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(rest_url, headers=headers)
            return res.status_code in (200, 204)
    except Exception:
        return False

def verify_reports_table() -> bool:
    if not verify_supabase_connection():
        return False
    
    table_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/reports?select=id&limit=1"
    headers = get_supabase_headers()
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(table_url, headers=headers)
            return res.status_code == 200
    except Exception:
        return False

def verify_storage_bucket() -> bool:
    if not verify_supabase_connection():
        return False
    
    buckets_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/bucket"
    headers = get_supabase_headers()
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(buckets_url, headers=headers)
            if res.status_code == 200:
                buckets = res.json()
                return any(b.get("name") == settings.SUPABASE_STORAGE_BUCKET or b.get("id") == settings.SUPABASE_STORAGE_BUCKET for b in buckets)
            return False
    except Exception:
        return False

def upload_test_image(file_content: bytes = b"CivoAI Phase 1 Storage Test Image") -> bool:
    if not verify_supabase_connection():
        return False
    
    storage_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/foundation_test.txt"
    headers = {
        **get_supabase_headers(),
        "Content-Type": "text/plain",
        "x-upsert": "true"
    }
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(storage_url, headers=headers, content=file_content)
            return res.status_code in (200, 201)
    except Exception:
        return False

def create_signed_url(image_path: str, expires_in: int = 3600) -> Optional[str]:
    if not verify_supabase_connection():
        return None
    
    signed_url_endpoint = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/sign/{settings.SUPABASE_STORAGE_BUCKET}/{image_path}"
    headers = get_supabase_headers()
    payload = {"expiresIn": expires_in}
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(signed_url_endpoint, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                signed_path = data.get("signedURL")
                if signed_path:
                    return f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1{signed_path}"
            return None
    except Exception:
        return None
