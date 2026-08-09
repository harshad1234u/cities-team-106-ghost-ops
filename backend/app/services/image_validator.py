"""CivoAI Image Validation Service"""
import io
import os
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import settings

# Map allowed MIME types to file extensions
MIME_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

MIN_RESOLUTION = 100
MAX_RESOLUTION = 8000


async def validate_image(file: UploadFile) -> tuple:
    """
    Validate an uploaded image file.
    Returns (content_bytes, safe_filename, content_type) on success.
    Raises HTTPException(400) on failure.
    """
    # 1. File exists and has a filename
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No image file provided.")

    # 2. Check file extension
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # 3. Check declared content type
    allowed_types = [t.strip() for t in settings.ALLOWED_IMAGE_TYPES.split(",")]
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid image type. Please upload a JPEG, PNG, or WebP image."
        )

    # 4. Read content and check size
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {settings.MAX_IMAGE_SIZE_MB}MB."
        )

    # 5. Verify image can be decoded
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()  # Verify it's a valid image
        # Re-open after verify (verify can invalidate the image object)
        img = Image.open(io.BytesIO(content))
        width, height = img.size
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image. The file could not be decoded. Please upload a valid road photograph."
        )

    # 6. Check resolution
    if width < MIN_RESOLUTION or height < MIN_RESOLUTION:
        raise HTTPException(
            status_code=400,
            detail=f"Image resolution too low ({width}x{height}). Minimum is {MIN_RESOLUTION}x{MIN_RESOLUTION}."
        )
    if width > MAX_RESOLUTION or height > MAX_RESOLUTION:
        raise HTTPException(
            status_code=400,
            detail=f"Image resolution too high ({width}x{height}). Maximum is {MAX_RESOLUTION}x{MAX_RESOLUTION}."
        )

    # 7. Determine actual content type from Pillow format
    pillow_format = img.format
    format_to_mime = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}
    actual_mime = format_to_mime.get(pillow_format)
    if not actual_mime or actual_mime not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format detected. Please upload a JPEG, PNG, or WebP image."
        )

    # 8. Generate safe filename — never trust original
    safe_ext = MIME_TO_EXT.get(actual_mime, ".jpg")
    safe_filename = f"original{safe_ext}"

    return content, safe_filename, actual_mime
