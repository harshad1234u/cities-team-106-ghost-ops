import os
import sys
import httpx
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_supabase():
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "pothole-images")

    if not supabase_url or not service_key:
        print("[SUPABASE] [BLOCKED] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.")
        return False

    print(f"[SUPABASE] Testing Supabase connection & storage bucket '{bucket_name}'...")

    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}"
    }

    rest_url = f"{supabase_url.rstrip('/')}/rest/v1/"
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.get(rest_url, headers=headers)
            if res.status_code not in (200, 204):
                print(f"[SUPABASE] [FAIL] Supabase REST auth check returned HTTP {res.status_code}")
                return False
            print("[SUPABASE] [PASS] Backend authenticated with Supabase REST service-role key.")

            storage_url = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket_name}/preflight_test.txt"
            upload_res = client.post(
                storage_url,
                headers={**headers, "Content-Type": "text/plain", "x-upsert": "true"},
                content=b"CivoAI Phase 0 Storage Upload Test"
            )

            if upload_res.status_code in (200, 201):
                print(f"[SUPABASE] [PASS] Test file uploaded successfully to bucket '{bucket_name}'.")
                return True
            else:
                print(f"[SUPABASE] [FAIL] Storage upload to '{bucket_name}' returned HTTP {upload_res.status_code}: {upload_res.text}")
                return False

    except Exception as e:
        print(f"[SUPABASE] [FAIL] Connection/Execution error: {str(e)}")
        return False

if __name__ == "__main__":
    test_supabase()
