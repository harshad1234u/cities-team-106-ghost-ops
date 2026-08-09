"""CivoAI AI Pipeline Orchestrator"""
import logging
from backend.app.ai.roboflow import RoboflowService
from backend.app.ai.nemotron import NemotronService
from backend.app.models import PipelineResult

logger = logging.getLogger("civoai.pipeline")


class AIPipeline:
    """Orchestrates the Roboflow → Nemotron AI chain."""

    def __init__(self):
        self.roboflow = RoboflowService()
        self.nemotron = NemotronService()

    def run(self, image_bytes: bytes) -> PipelineResult:
        """
        Execute the AI pipeline:
        1. Roboflow Detection
        2. Nemotron Visual Analysis (only if pothole detected)

        Never fabricates results. Preserves partial results on failure.
        """
        errors = []

        # Step 1: Roboflow Detection (REQUIRED)
        logger.info("Starting Roboflow detection...")
        detection = self.roboflow.detect(image_bytes)

        if detection.error:
            logger.error(f"Roboflow failed: {detection.error}")
            return PipelineResult(
                roboflow=detection,
                nemotron=None,
                pipeline_status="roboflow_failed",
                errors=[detection.error],
            )

        logger.info(
            f"Roboflow complete: pothole_detected={detection.pothole_detected}, "
            f"detections={len(detection.detections)}"
        )

        # Step 2: Check if pothole was detected
        if not detection.pothole_detected:
            logger.info("No pothole detected — skipping Nemotron.")
            return PipelineResult(
                roboflow=detection,
                nemotron=None,
                pipeline_status="no_pothole_detected",
                errors=[],
            )

        # Step 3: Nemotron Visual Analysis (only if pothole detected)
        logger.info("Starting Nemotron visual analysis...")
        visual_analysis = None
        try:
            visual_analysis = self.nemotron.analyze(
                detection=detection,
                image_bytes=image_bytes,
            )
            logger.info(
                f"Nemotron complete: confirmed={visual_analysis.pothole_confirmed}, "
                f"confidence={visual_analysis.confidence}"
            )
        except ValueError as e:
            error_msg = f"Nemotron analysis failed: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
        except Exception as e:
            error_msg = f"Nemotron unexpected error: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)

        # Determine pipeline status
        if visual_analysis:
            status = "completed"
        else:
            status = "partial_nemotron_failed"

        return PipelineResult(
            roboflow=detection,
            nemotron=visual_analysis,
            pipeline_status=status,
            errors=errors,
        )
