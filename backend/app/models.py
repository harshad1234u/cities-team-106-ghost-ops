"""CivoAI Pydantic Models — Phase 3 (4-Table Architecture)"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class ReportStatus(str, Enum):
    NEW = "NEW"
    PROCESSING = "PROCESSING"
    AI_VERIFIED = "AI_VERIFIED"
    REVIEWED = "REVIEWED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"
    REMOVED = "REMOVED"

REMOVAL_REASONS = ["DUPLICATE", "SPAM", "INVALID_IMAGE", "INCORRECT_SUBMISSION", "OTHER"]

class ReportRemoveRequest(BaseModel):
    reason: str
    note: Optional[str] = None


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Detection(BaseModel):
    class_name: str = Field(alias="class")
    confidence: float
    bbox: BoundingBox

    model_config = {"populate_by_name": True}


class DetectionResult(BaseModel):
    provider: str = "roboflow"
    model: str = ""
    pothole_detected: bool = False
    detections: List[Detection] = []
    error: Optional[str] = None


class VisualAnalysis(BaseModel):
    pothole_confirmed: bool = False
    visual_size: Optional[str] = None
    apparent_depth: Optional[str] = None
    surrounding_damage: Optional[str] = None
    water_contribution_visible: Optional[bool] = None
    confidence: float = 0.0
    uncertainties: List[str] = []


class PipelineResult(BaseModel):
    roboflow: Optional[DetectionResult] = None
    nemotron: Optional[VisualAnalysis] = None
    pipeline_status: str = "completed"
    errors: List[str] = []


class ReportResponse(BaseModel):
    report_id: str
    status: str
    message: str


class ImageInfo(BaseModel):
    path: str
    url: Optional[str] = None


class LocationInfo(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    road_name: Optional[str] = None
    landmark: Optional[str] = None


class AIInfo(BaseModel):
    detection: Optional[dict] = None
    visual_analysis: Optional[dict] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    repair_recommendation: Optional[str] = None
    estimated_cost: Optional[str] = None
    ai_summary: Optional[str] = None


class CitizenReportDetail(BaseModel):
    report_id: str
    status: str
    image: ImageInfo
    location: LocationInfo
    description: Optional[str] = None
    perceived_danger: bool = False
    water_present: bool = False
    traffic_level: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None


class ReportDetail(BaseModel):
    """Unified response model for frontend backward compatibility"""
    report_id: str
    status: str
    image: ImageInfo
    location: LocationInfo
    description: Optional[str] = None
    citizen_danger: bool = False # Kept for API compatibility temporarily, mapped to perceived_danger
    water_visible: bool = False  # Kept for API compatibility temporarily, mapped to water_present
    ai: AIInfo
    created_at: str
    updated_at: Optional[str] = None
    is_deleted: bool = False
    deleted_at: Optional[str] = None
    deleted_by: Optional[str] = None
    deletion_reason: Optional[str] = None
    deletion_note: Optional[str] = None


class AIProcessingResponse(BaseModel):
    report_id: str
    status: str
    pipeline_result: Optional[PipelineResult] = None
    message: str
