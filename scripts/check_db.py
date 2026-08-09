import os
import sys
import httpx
from backend.app.core.config import settings
from backend.app.services.supabase_client import get_supabase_headers

def check_db():
    rest_url = settings.SUPABASE_URL.rstrip("/")
    if not rest_url.endswith("/rest/v1"):
        rest_url += "/rest/v1"
        
    headers = get_supabase_headers()
    
    # Check reports table
    res = httpx.get(f"{rest_url}/reports?select=id&limit=1", headers=headers)
    print(f"reports table status: {res.status_code}")
    if res.status_code == 200:
        print(f"reports data: {res.json()}")

    # Check users table
    res_users = httpx.get(f"{rest_url}/users?select=id&limit=1", headers=headers)
    print(f"users table status: {res_users.status_code}")

if __name__ == "__main__":
    check_db()
