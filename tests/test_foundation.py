import os
import sys
from fastapi.testclient import TestClient

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.main import app
from app.core.config import settings
from app.services.supabase_client import (
    verify_supabase_connection,
    get_supabase_headers
)
import httpx

def verify_table(table_name: str) -> bool:
    if not verify_supabase_connection():
        return False
    
    table_url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}?select=id&limit=1"
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

def run_foundation_test():
    print("========================================")
    print("CivoAI PHASE 3 FOUNDATION VERIFICATION")
    print("========================================\n")

    results = {}

    # 1. FastAPI /health Check
    print("FASTAPI BACKEND")
    client = TestClient(app)
    try:
        res = client.get("/health")
        if res.status_code == 200 and res.json().get("status") == "ok":
            results["FastAPI Backend Health (/health)"] = "PASS"
            print("[PASS] FastAPI /health returns HTTP 200 ok")
        else:
            results["FastAPI Backend Health (/health)"] = "FAIL"
            print(f"[FAIL] FastAPI /health returned HTTP {res.status_code}")
    except Exception as e:
        results["FastAPI Backend Health (/health)"] = "FAIL"
        print(f"[FAIL] FastAPI health check exception: {str(e)}")

    print()

    # 2. Environment Configuration
    print("ENVIRONMENT & GIT SECURITY")
    env_gitignored = False
    if os.path.exists(".gitignore"):
        with open(".gitignore", "r") as f:
            content = f.read()
            if ".env" in content:
                env_gitignored = True

    env_example_exists = os.path.exists(".env.example")
    results["Environment Config (.env.example)"] = "PASS" if env_example_exists else "FAIL"
    results["Git Security (.env gitignored)"] = "PASS" if env_gitignored else "FAIL"
    print(f"[{results['Environment Config (.env.example)']}] .env.example exists")
    print(f"[{results['Git Security (.env gitignored)']}] .env is gitignored")

    print()

    # 3. Supabase Connection, Tables, and Storage Bucket Verification
    print("SUPABASE FOUNDATION (4-Table Architecture)")
    sb_conn = verify_supabase_connection()
    results["Supabase Connection"] = "PASS" if sb_conn else "BLOCKED"
    print(f"[{results['Supabase Connection']}] Supabase API Connection")

    # Verify tables
    tables = ["users", "citizen_reports", "engineer_reports", "ai_reports"]
    for table in tables:
        table_ok = verify_table(table) if sb_conn else False
        results[table] = "PASS" if table_ok else "BLOCKED"
        print(f"[{results[table]}] {table}")

    sb_bucket = verify_storage_bucket() if sb_conn else False
    results["Storage Bucket"] = "PASS" if sb_bucket else "BLOCKED"
    print(f"[{results['Storage Bucket']}] pothole-images Bucket Exists")

    print("\n========================================")
    print("FOUNDATION VERIFICATION SUMMARY")
    print("========================================")
    for key, val in results.items():
        print(f"[{val:<7}] {key}")

    print("========================================")
    all_ok = all(v == "PASS" for v in results.values())
    print(f"PHASE 3 FOUNDATION STATUS: {'READY' if all_ok else 'BLOCKED'}")
    print("========================================\n")

    return results

if __name__ == "__main__":
    run_foundation_test()
