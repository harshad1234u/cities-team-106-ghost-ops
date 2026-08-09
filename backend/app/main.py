from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers.reports import router as reports_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Pothole Reporting & Road Risk Intelligence Backend",
    version=settings.VERSION
)

# Configure CORS to allow any local frontend port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(reports_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    """
    Health Endpoint - Fast, independent status check.
    Does NOT depend on external AI providers or database connections.
    """
    return {
        "status": "ok",
        "service": "civoai-backend"
    }

@app.get("/preflight")
def preflight_check():
    """
    Phase 0/1 Pre-Flight Gate Verification Endpoint.
    Returns status of configured providers without exposing secret keys.
    """
    rf_det_key = bool(settings.ROBOFLOW_API_KEY and settings.ROBOFLOW_DETECTION_MODEL_ID)
    rf_seg_key = bool(settings.ROBOFLOW_API_KEY and settings.ROBOFLOW_SEGMENTATION_MODEL_ID)
    nemo_key = bool(settings.NVIDIA_NIM_API_KEY)
    llama_key = bool(settings.NVIDIA_NIM_API_KEY or settings.LLAMA_API_KEY)
    supabase_key = bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)
    email_key = bool(settings.EMAIL_PROVIDER_API_KEY and settings.ADMIN_EMAIL)

    providers = {
        "roboflow_detection": "PASS" if rf_det_key else "BLOCKED",
        "roboflow_segmentation": "PASS" if rf_seg_key else "BLOCKED",
        "nemotron": "PASS" if nemo_key else "BLOCKED",
        "llama_vision": "PASS" if llama_key else "BLOCKED",
        "supabase": "PASS" if supabase_key else "BLOCKED",
        "email": "PASS" if email_key else "BLOCKED"
    }

    all_ready = all(v == "PASS" for v in providers.values())

    return {
        "status": "ready" if all_ready else "blocked",
        "providers": providers
    }

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
