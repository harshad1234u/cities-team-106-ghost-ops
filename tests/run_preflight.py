import os
import sys
import subprocess
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from scripts.preflight.test_roboflow import test_roboflow_detection
from scripts.preflight.test_roboflow_segmentation import test_roboflow_segmentation
from scripts.preflight.test_nemotron import test_nemotron
from scripts.preflight.test_llama_vision import test_llama_vision
from scripts.preflight.test_supabase import test_supabase
from scripts.preflight.test_email import test_email

load_dotenv()

def run_preflight_suite():
    print("========================================")
    print("CivoAI PRE-FLIGHT VERIFICATION REPORT")
    print("========================================\n")

    results = {}

    # Section A: REPOSITORY & SETUP
    print("REPOSITORY & SETUP")
    git_pass = os.path.exists(".git")
    env_pass = os.path.exists(".env.example")
    results["Git repository"] = "PASS" if git_pass else "FAIL"
    results["Environment configuration"] = "PASS" if env_pass else "FAIL"
    print(f"[{results['Git repository']}] Git repository")
    print(f"[{results['Environment configuration']}] Environment configuration\n")

    # Section B: INFRASTRUCTURE
    print("INFRASTRUCTURE")
    sb_res = test_supabase()
    results["Supabase"] = "PASS" if sb_res else "BLOCKED"
    results["Supabase Storage"] = "PASS" if sb_res else "BLOCKED"
    print(f"[{results['Supabase']}] Supabase")
    print(f"[{results['Supabase Storage']}] Supabase Storage\n")

    # Section C: AI SERVICES
    print("AI SERVICES")
    rf_det = test_roboflow_detection()
    results["Roboflow Detection"] = "PASS" if rf_det else "BLOCKED"

    rf_seg = test_roboflow_segmentation()
    results["Roboflow Segmentation"] = rf_seg if isinstance(rf_seg, str) else ("PASS" if rf_seg else "BLOCKED")

    nemo = test_nemotron()
    results["NVIDIA Nemotron"] = "PASS" if nemo else "BLOCKED"

    llama = test_llama_vision()
    results["NVIDIA Llama 3.2 Vision"] = "PASS" if llama else "BLOCKED"
    print()

    # Section D: NOTIFICATION
    print("NOTIFICATION")
    em = test_email()
    results["Email Provider"] = "PASS" if em else "BLOCKED"
    print()

    # Section E: DEPLOYMENT
    print("DEPLOYMENT")
    be_pass = os.path.exists("backend/app/main.py")
    fe_pass = os.path.exists("frontend/package.json")
    results["Frontend"] = "PASS" if fe_pass else "FAIL"
    results["Backend"] = "PASS" if be_pass else "FAIL"
    print(f"[{results['Frontend']}] Frontend")
    print(f"[{results['Backend']}] Backend\n")

    print("========================================")
    all_ready = all(v in ("PASS", "WARNING") for v in results.values())
    if all_ready:
        print("PRE-FLIGHT STATUS: READY")
    else:
        print("PRE-FLIGHT STATUS: BLOCKED — UNVERIFIED DEPENDENCIES")
    print("========================================\n")

    return results

if __name__ == "__main__":
    run_preflight_suite()
