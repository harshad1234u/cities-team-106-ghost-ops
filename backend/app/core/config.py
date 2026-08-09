import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "CivoAI Backend"
    VERSION: str = "3.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Roboflow AI
    ROBOFLOW_API_KEY: str = ""
    ROBOFLOW_DETECTION_MODEL_ID: str = "pothole-detection/1"
    ROBOFLOW_SEGMENTATION_MODEL_ID: str = "pothole-segmentation/1"
    
    # NVIDIA NIM AI
    NVIDIA_NIM_API_KEY: str = ""
    NVIDIA_NIM_ENDPOINT: str = "https://integrate.api.nvidia.com/v1/chat/completions"
    NEMOTRON_MODEL: str = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"
    LLAMA_VISION_MODEL: str = "meta-llama/llama-3.2-11b-vision-instruct"

    # Legacy alias support for backward compatibility
    LLAMA_API_KEY: Optional[str] = None
    LLAMA_MODEL: Optional[str] = None
    LLAMA_API_BASE: Optional[str] = None
    
    # Supabase Database & Storage
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "pothole-images"
    
    # Image Validation
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"
    
    # Email Provider
    EMAIL_PROVIDER: str = "resend"
    RESEND_API_KEY: str = ""
    EMAIL_PROVIDER_API_KEY: str = ""
    EMAIL_FROM: str = "civoai-alerts@resend.dev"
    ADMIN_EMAIL: str = "admin@civoai.gov.in"

    @property
    def resend_key(self) -> str:
        return self.RESEND_API_KEY or self.EMAIL_PROVIDER_API_KEY or os.environ.get("RESEND_API_KEY", "")
    
    # Deployment URLs & CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_cors_origins(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL.rstrip("/"))
        return origins

settings = Settings()
