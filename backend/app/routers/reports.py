"""CivoAI Reports API Router — 4-Table Architecture"""
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Query, Header
from typing import Optional, List

from pydantic import BaseModel
from backend.app.models import (
    ReportResponse,
    ReportDetail,
    ImageInfo,
    LocationInfo,
    AIInfo,
    ReportStatus,
    ReportRemoveRequest,
    REMOVAL_REASONS,
)
from backend.app.services.image_validator import validate_image
from backend.app.services.report_id import generate_report_id
from backend.app.services.supabase_service import (
    upload_report_image,
    delete_storage_file,
    download_storage_file,
    insert_citizen_report,
    get_citizen_report_by_report_id,
    update_citizen_report_status,
    insert_ai_report,
    create_signed_url,
    get_all_citizen_reports,
    upsert_user,
    get_users_by_role,
    insert_engineer_report,
    soft_delete_citizen_report,
    get_removed_citizen_reports,
)
from backend.app.core.risk_engine import calculate_risk
from backend.app.services.email_service import send_admin_email

logger = logging.getLogger("civoai.reports")

router = APIRouter(tags=["Reports"])

async def _verify_admin(authorization: str = Header(None)) -> str:
    """
    Verify the request has a valid Supabase JWT and the user's role is 'admin'.
    Returns the authenticated user's UUID.
    Raises HTTPException 401 if unauthenticated, 403 if not admin.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required.")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    # Verify JWT with Supabase Auth
    from backend.app.core.config import settings
    import httpx
    
    auth_url = settings.SUPABASE_URL.rstrip("/")
    if "/rest/v1" in auth_url:
        auth_url = auth_url.split("/rest/v1")[0]
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"{auth_url}/auth/v1/user",
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {token}",
                }
            )
            if res.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
            
            user_data = res.json()
            user_id = user_data.get("id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Could not identify authenticated user.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication verification failed.")
    
    # Check role from public.users table
    from backend.app.services.supabase_service import _get_rest_url
    from backend.app.services.supabase_client import get_supabase_headers
    
    rest_url = _get_rest_url()
    headers = get_supabase_headers()
    
    try:
        with httpx.Client(timeout=5.0) as sync_client:
            role_res = sync_client.get(
                f"{rest_url}/users?id=eq.{user_id}&select=role",
                headers=headers
            )
            if role_res.status_code == 200:
                rows = role_res.json()
                if rows and isinstance(rows, list) and rows[0].get("role") == "admin":
                    return user_id
    except Exception:
        pass
    
    raise HTTPException(status_code=403, detail="Admin authorization required.")


async def _run_ai_pipeline(report_id: str):
    """Background task to run AI processing, calculate risk, and notify admin."""
    # 1. Update status to PROCESSING
    update_citizen_report_status(report_id, ReportStatus.PROCESSING.value)

    row = get_citizen_report_by_report_id(report_id)
    if not row:
        return
    
    # Protect REMOVED reports from being overwritten by background AI
    if row.get("is_deleted") is True or row.get("status") == "REMOVED":
        logger.info(f"Report {report_id} is REMOVED — skipping AI pipeline.")
        return

    citizen_report_id = row.get("id")
    image_path = row.get("image_path", "")
    
    if not image_path:
        update_citizen_report_status(report_id, ReportStatus.NEW.value)
        return

    image_bytes = download_storage_file(image_path)
    if not image_bytes:
        update_citizen_report_status(report_id, ReportStatus.NEW.value)
        return

    # 4. Run AI pipeline
    try:
        from backend.app.ai.pipeline import AIPipeline
        pipeline = AIPipeline()
        result = pipeline.run(image_bytes)
    except Exception as e:
        logger.error(f"AI pipeline error for {report_id}: {e}")
        update_citizen_report_status(report_id, ReportStatus.NEW.value)
        return

    # 5. Calculate Risk
    nemotron_data = result.nemotron.model_dump() if result.nemotron else {}
    confidence = 0.0
    if result.roboflow and result.roboflow.detections:
        confidence = max(d.confidence for d in result.roboflow.detections)
    pothole_detected = result.roboflow.pothole_detected if result.roboflow else False
    
    sev, pri, rec, cost = calculate_risk(
        citizen_danger=row.get("perceived_danger", False),
        water_visible=row.get("water_present", False),
        pothole_detected=pothole_detected,
        confidence=confidence,
        nemotron_analysis=nemotron_data
    )

    ai_data = {
        "citizen_report_id": citizen_report_id,
        "engineer_report_id": None,
        "pothole_detected": pothole_detected,
        "severity": sev,
        "priority": pri,
        "repair_recommendation": rec,
        "estimated_cost": cost,
    }
    
    if result.roboflow:
        ai_data["roboflow_detection"] = result.roboflow.model_dump(by_alias=True)
        if confidence > 0.0:
            ai_data["confidence"] = confidence

    if result.nemotron:
        ai_data["vision_analysis"] = nemotron_data
        ai_data["ai_summary"] = nemotron_data.get("ai_summary", "")

    # Store AI results in ai_reports table
    ai_insert_ok = insert_ai_report(ai_data)
    
    # Re-check before final status write to prevent race condition
    fresh_check = get_citizen_report_by_report_id(report_id)
    if fresh_check and (fresh_check.get("is_deleted") is True or fresh_check.get("status") == "REMOVED"):
        logger.info(f"Report {report_id} was REMOVED during AI processing — preserving REMOVED status.")
        return

    new_status = ReportStatus.NEW.value
    if ai_insert_ok:
        new_status = ReportStatus.AI_VERIFIED.value
        update_citizen_report_status(report_id, new_status)
        
        # 6. Trigger Admin Email Alert via Resend (Failure Isolated)
        try:
            from backend.app.services.email_service import send_admin_pothole_alert
            # Fetch unified report detail representation
            fresh_row = get_citizen_report_by_report_id(report_id)
            if fresh_row:
                signed_url = create_signed_url(image_path) or ""
                ai_records = fresh_row.get("ai_reports", [])
                ai_row = ai_records[0] if ai_records else {}
                
                report_dict = {
                    "report_id": report_id,
                    "created_at": str(fresh_row.get("created_at", "")),
                    "image": {"path": image_path, "url": signed_url},
                    "location": {
                        "road_name": fresh_row.get("road_name"),
                        "landmark": fresh_row.get("landmark"),
                        "latitude": fresh_row.get("latitude"),
                        "longitude": fresh_row.get("longitude"),
                    },
                    "citizen_danger": fresh_row.get("perceived_danger", False),
                    "water_visible": fresh_row.get("water_present", False),
                    "ai": {
                        "detection": {"pothole_detected": pothole_detected, "confidence": confidence},
                        "visual_analysis": nemotron_data,
                        "severity": sev,
                        "priority": pri,
                        "repair_recommendation": rec,
                        "estimated_cost": cost,
                        "ai_summary": ai_row.get("ai_summary") or ("No pothole hazard identified." if not pothole_detected else f"Automated AI classification: {sev} severity road risk hazard requiring {pri} priority maintenance."),
                    }
                }
                send_admin_pothole_alert(report_dict)
        except Exception as email_err:
            logger.warning(f"Admin email notification exception for {report_id}: {email_err}")
    else:
        logger.error(f"Failed to persist AI results for {report_id}")
        update_citizen_report_status(report_id, ReportStatus.PROCESSING.value)


@router.post("/reports", response_model=ReportResponse)
async def create_report(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    road_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    citizen_danger: bool = Form(False),
    water_visible: bool = Form(False),
):
    """
    Create a new pothole report (Citizen Report).
    Accepts multipart/form-data with an image and citizen information.
    Automatically triggers AI processing in the background.
    """
    content, safe_filename, content_type = await validate_image(image)
    report_id = generate_report_id()
    storage_path = f"citizen-reports/{report_id}/original{safe_filename[-4:]}"
    
    upload_ok = upload_report_image(content, storage_path, content_type)
    if not upload_ok:
        raise HTTPException(status_code=500, detail="Failed to store the image. Please try again.")

    record = {
        "report_id": report_id,
        "image_path": storage_path,
        "latitude": latitude,
        "longitude": longitude,
        "road_name": road_name,
        "description": description,
        "perceived_danger": citizen_danger,
        "water_present": water_visible,
        "status": ReportStatus.NEW.value,
    }

    result = insert_citizen_report(record)
    if not result:
        delete_storage_file(storage_path)
        raise HTTPException(status_code=500, detail="Failed to create report record.")

    # Trigger background AI Processing
    background_tasks.add_task(_run_ai_pipeline, report_id)

    return ReportResponse(
        report_id=report_id,
        status=ReportStatus.NEW.value,
        message="Pothole report created successfully and processing started.",
    )


@router.post("/reports/{report_id}/process")
async def process_report(report_id: str, background_tasks: BackgroundTasks):
    """
    On-demand endpoint to trigger or re-run AI analysis pipeline for a report.
    """
    row = get_citizen_report_by_report_id(report_id)
    if not row:
        raise HTTPException(status_code=404, detail="Report not found.")

    update_citizen_report_status(report_id, ReportStatus.PROCESSING.value)
    background_tasks.add_task(_run_ai_pipeline, report_id)
    return {"status": "success", "message": f"AI analysis pipeline initiated for report {report_id}"}


@router.get("/reports", response_model=List[ReportDetail])
async def get_reports(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)):
    """
    Retrieve all unified pothole reports.
    Supports pagination. For Admin UI.
    """
    rows = get_all_citizen_reports(limit=limit, offset=offset)
    results = []
    for row in rows:
        image_path = row.get("image_path", "")
        signed_url = create_signed_url(image_path) if image_path else None
        
        ai_records = row.get("ai_reports", [])
        ai_row = ai_records[0] if ai_records else {}
        
        det = ai_row.get("roboflow_detection") or {}
        p_detected = det.get("pothole_detected", False) if det else ai_row.get("pothole_detected", False)
        conf = det.get("confidence", 0.0) if det else 0.0

        severity = ai_row.get("severity")
        priority = ai_row.get("priority")
        rec = ai_row.get("repair_recommendation")
        cost = ai_row.get("estimated_cost")

        if not severity:
            severity, priority, rec, cost = calculate_risk(
                citizen_danger=row.get("perceived_danger", False),
                water_visible=row.get("water_present", False),
                pothole_detected=p_detected,
                confidence=conf,
                nemotron_analysis=ai_row.get("vision_analysis") or {},
            )

        detection_data = det or {
            "pothole_detected": p_detected,
            "confidence": conf,
            "model": "my-first-project-0t7uc/2"
        }

        results.append(ReportDetail(
            report_id=row.get("report_id", ""),
            status=row.get("status", "NEW"),
            image=ImageInfo(path=image_path, url=signed_url),
            location=LocationInfo(
                latitude=row.get("latitude"),
                longitude=row.get("longitude"),
                road_name=row.get("road_name"),
                landmark=row.get("landmark"),
            ),
            description=row.get("description"),
            citizen_danger=row.get("perceived_danger", False),
            water_visible=row.get("water_present", False),
            ai=AIInfo(
                detection=detection_data,
                visual_analysis=ai_row.get("vision_analysis"),
                severity=severity,
                priority=priority,
                repair_recommendation=rec,
                estimated_cost=cost,
                ai_summary=ai_row.get("ai_summary") or ("No pothole hazard detected in image." if not p_detected else f"Automated AI classification: {severity} severity road risk hazard."),
            ),
            created_at=str(row.get("created_at", "")),
            updated_at=str(row.get("updated_at")) if row.get("updated_at") else None,
            is_deleted=row.get("is_deleted", False),
            deleted_at=str(row.get("deleted_at")) if row.get("deleted_at") else None,
            deleted_by=row.get("deleted_by"),
            deletion_reason=row.get("deletion_reason"),
            deletion_note=row.get("deletion_note"),
        ))
    return results


@router.get("/reports/audit-history")
async def get_audit_history(authorization: str = Header(None), limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)):
    """
    Admin-only: Retrieve soft-deleted reports for audit purposes.
    """
    await _verify_admin(authorization)
    
    rows = get_removed_citizen_reports(limit=limit, offset=offset)
    results = []
    for row in rows:
        results.append({
            "report_id": row.get("report_id", ""),
            "status": row.get("status", "REMOVED"),
            "deletion_reason": row.get("deletion_reason"),
            "deletion_note": row.get("deletion_note"),
            "deleted_by": row.get("deleted_by"),
            "deleted_at": str(row.get("deleted_at", "")),
            "created_at": str(row.get("created_at", "")),
            "road_name": row.get("road_name"),
            "description": row.get("description"),
        })
    return results


@router.get("/reports/{report_id}", response_model=ReportDetail)
async def get_report(report_id: str):
    """
    Retrieve a unified pothole report by its human-readable report ID.
    Merges citizen_reports and ai_reports data for the frontend.
    """
    row = get_citizen_report_by_report_id(report_id)
    if not row:
        raise HTTPException(status_code=404, detail="Report not found.")

    image_path = row.get("image_path", "")
    signed_url = create_signed_url(image_path) if image_path else None

    ai_records = row.get("ai_reports", [])
    ai_row = ai_records[0] if ai_records else {}

    det = ai_row.get("roboflow_detection") or {}
    p_detected = det.get("pothole_detected", False) if det else ai_row.get("pothole_detected", False)
    conf = det.get("confidence", 0.0) if det else 0.0

    severity = ai_row.get("severity")
    priority = ai_row.get("priority")
    rec = ai_row.get("repair_recommendation")
    cost = ai_row.get("estimated_cost")

    # If AI record is not yet in DB or severity missing, calculate strictly using risk engine
    if not severity:
        severity, priority, rec, cost = calculate_risk(
            citizen_danger=row.get("perceived_danger", False),
            water_visible=row.get("water_present", False),
            pothole_detected=p_detected,
            confidence=conf,
            nemotron_analysis=ai_row.get("vision_analysis") or {},
        )

    detection_data = det or {
        "pothole_detected": p_detected,
        "confidence": conf,
        "model": "my-first-project-0t7uc/2"
    }

    return ReportDetail(
        report_id=row.get("report_id", ""),
        status=row.get("status", "NEW"),
        image=ImageInfo(path=image_path, url=signed_url),
        location=LocationInfo(
            latitude=row.get("latitude"),
            longitude=row.get("longitude"),
            road_name=row.get("road_name"),
            landmark=row.get("landmark"),
        ),
        description=row.get("description"),
        citizen_danger=row.get("perceived_danger", False),
        water_visible=row.get("water_present", False),
        ai=AIInfo(
            detection=detection_data,
            visual_analysis=ai_row.get("vision_analysis"),
            severity=severity,
            priority=priority,
            repair_recommendation=rec,
            estimated_cost=cost,
            ai_summary=ai_row.get("ai_summary") or f"Automated AI classification: {severity} severity road risk hazard requiring {priority} priority maintenance.",
        ),
        created_at=str(row.get("created_at", "")),
        updated_at=str(row.get("updated_at")) if row.get("updated_at") else None,
        is_deleted=row.get("is_deleted", False),
        deleted_at=str(row.get("deleted_at")) if row.get("deleted_at") else None,
        deleted_by=row.get("deleted_by"),
        deletion_reason=row.get("deletion_reason"),
        deletion_note=row.get("deletion_note"),
    )


class UserSyncRequest(BaseModel):
    user_id: str
    email: str
    role: str
    full_name: Optional[str] = None


@router.post("/auth/sync-user")
async def sync_user(payload: UserSyncRequest):
    """Sync newly registered or logged in user to public.users table in Supabase."""
    success = upsert_user(
        user_id=payload.user_id,
        email=payload.email,
        role=payload.role,
        full_name=payload.full_name,
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to sync user to database.")
    return {"status": "success", "message": "User synchronized to Supabase"}


@router.get("/users")
async def get_users(role: Optional[str] = Query(None)):
    """Fetch registered users, optionally filtered by role (e.g. engineer)."""
    return get_users_by_role(role=role)


class EngineerAssessmentRequest(BaseModel):
    user_id: Optional[str] = None
    road_category: Optional[str] = "Arterial"
    road_environment: Optional[str] = "Urban"
    approx_length: Optional[float] = 0.0
    approx_width: Optional[float] = 0.0
    apparent_depth: Optional[str] = "Shallow"
    surrounding_damage: Optional[str] = "Minimal"
    water_drainage: Optional[str] = "Good"
    traffic_level: Optional[str] = "Low"
    safety_risk: Optional[str] = "Low"
    nearby_risk_location: Optional[str] = None
    engineering_observation: Optional[str] = None
    urgency: Optional[str] = "Routine"


@router.post("/reports/{report_id}/engineer-assessment")
async def create_engineer_assessment(report_id: str, payload: EngineerAssessmentRequest):
    """Save engineering field assessment for a report."""
    data = {
        "report_id": report_id,
        "user_id": payload.user_id or "34254a81-a79e-441e-accc-ff4484e2205e",
        "road_category": payload.road_category,
        "road_environment": payload.road_environment,
        "approx_length": payload.approx_length,
        "approx_width": payload.approx_width,
        "apparent_depth": payload.apparent_depth,
        "surrounding_damage": payload.surrounding_damage,
        "water_drainage": payload.water_drainage,
        "traffic_level": payload.traffic_level,
        "safety_risk": payload.safety_risk,
        "nearby_risk_location": payload.nearby_risk_location,
        "engineering_observation": payload.engineering_observation,
        "urgency": payload.urgency,
        "status": "ENGINEER_VERIFIED",
    }
    
    result = insert_engineer_report(data)
    update_citizen_report_status(report_id, "ENGINEER_VERIFIED")
    
    return {"status": "success", "message": f"Assessment for {report_id} saved successfully", "data": result}


class StatusUpdateRequest(BaseModel):
    status: str


@router.patch("/reports/{report_id}/status")
async def update_report_status(report_id: str, payload: StatusUpdateRequest):
    """
    Update a report's lifecycle status (e.g. REPAIRED, RESOLVED, ENGINEER_VERIFIED).
    Report deletion is strictly disabled to preserve civic audit trail.
    """
    row = get_citizen_report_by_report_id(report_id)
    if not row:
        raise HTTPException(status_code=404, detail="Report not found.")

    success = update_citizen_report_status(report_id, payload.status)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update report status.")

    return {
        "status": "success",
        "message": f"Report {report_id} status updated to {payload.status}",
        "report_id": report_id,
        "new_status": payload.status
    }

@router.post("/reports/{report_id}/remove")
async def remove_report(report_id: str, payload: ReportRemoveRequest, authorization: str = Header(None)):
    """
    Admin-only: Soft-delete a report. Preserves all data for audit purposes.
    Does NOT physically delete the database row, AI data, or stored images.
    """
    # 1. Verify admin authorization
    admin_id = await _verify_admin(authorization)
    
    # 2. Validate reason
    if not payload.reason or payload.reason not in REMOVAL_REASONS:
        raise HTTPException(status_code=422, detail=f"Invalid reason. Must be one of: {', '.join(REMOVAL_REASONS)}")
    
    if payload.reason == "OTHER" and (not payload.note or not payload.note.strip()):
        raise HTTPException(status_code=422, detail="A note is required when reason is 'OTHER'.")
    
    # 3. Check report exists
    row = get_citizen_report_by_report_id(report_id)
    if not row:
        raise HTTPException(status_code=404, detail="Report not found.")
    
    # 4. Idempotency: if already removed, return safely
    if row.get("is_deleted") is True or row.get("status") == "REMOVED":
        return {
            "report_id": report_id,
            "status": "REMOVED",
            "reason": row.get("deletion_reason", payload.reason),
            "message": "Report was already removed."
        }
    
    # 5. Perform soft delete
    success = soft_delete_citizen_report(
        report_id=report_id,
        admin_id=admin_id,
        reason=payload.reason,
        note=payload.note or ""
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to remove report. Database update failed.")
    
    return {
        "report_id": report_id,
        "status": "REMOVED",
        "reason": payload.reason
    }




