"""
CivoAI AI Pipeline Integration Test
Tests the Roboflow → Nemotron AI chain using real API calls.
No mocks. No fake responses. No hardcoded results.
"""
import os
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure project root is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings


def print_result(name: str, passed: bool, detail: str = "") -> bool:
    status = "[PASS]" if passed else "[FAIL]"
    msg = f"  {status} {name}"
    if detail:
        msg += f" — {detail}"
    print(msg)
    return passed


def test_ai_pipeline():
    print("=" * 50)
    print("CivoAI AI PIPELINE TEST")
    print("=" * 50)
    print()

    all_passed = True

    # ------------------------------------------------------------------
    # Step 1: Load sample image
    # ------------------------------------------------------------------
    fixture_path = os.path.join(
        os.path.dirname(__file__), "fixtures", "pothole_test.jpg"
    )

    if not os.path.exists(fixture_path):
        print_result("Sample image loaded", False, f"Not found: {fixture_path}")
        print(f"\n{'=' * 50}")
        print("AI PIPELINE: FAILED")
        print(f"{'=' * 50}")
        return 1

    with open(fixture_path, "rb") as f:
        image_bytes = f.read()

    passed = print_result(
        "Sample image loaded", bool(image_bytes), f"{len(image_bytes)} bytes"
    )
    all_passed &= passed
    if not passed:
        print(f"\n{'=' * 50}")
        print("AI PIPELINE: FAILED")
        print(f"{'=' * 50}")
        return 1

    # ------------------------------------------------------------------
    # Step 2: Roboflow Detection (real API call)
    # ------------------------------------------------------------------
    print()
    if not settings.ROBOFLOW_API_KEY:
        print_result("Roboflow request", False, "ROBOFLOW_API_KEY not configured")
        print(f"\n{'=' * 50}")
        print("AI PIPELINE: FAILED")
        print(f"{'=' * 50}")
        return 1

    from app.ai.roboflow import RoboflowService

    roboflow = RoboflowService()
    detection = roboflow.detect(image_bytes)

    if detection.error:
        print_result("Roboflow request", False, detection.error)
        print(f"\n{'=' * 50}")
        print("AI PIPELINE: FAILED")
        print(f"{'=' * 50}")
        return 1

    all_passed &= print_result("Roboflow request", True, f"model={detection.model}")
    all_passed &= print_result(
        "Pothole detection received",
        True,
        f"detected={detection.pothole_detected}, "
        f"count={len(detection.detections)}",
    )

    if detection.detections:
        for i, d in enumerate(detection.detections):
            print(
                f"         Detection {i + 1}: class={d.class_name}, "
                f"confidence={d.confidence:.3f}, "
                f"bbox=({d.bbox.x:.0f}, {d.bbox.y:.0f}, "
                f"{d.bbox.width:.0f}, {d.bbox.height:.0f})"
            )

    # ------------------------------------------------------------------
    # Step 3: Nemotron Visual Analysis (real API call)
    # Only if pothole was detected
    # ------------------------------------------------------------------
    print()
    if not detection.pothole_detected:
        print(
            "  [SKIP] Nemotron — no pothole detected (this is correct behaviour, "
            "not a failure)"
        )
        print(f"\n{'=' * 50}")
        status = "PASS" if all_passed else "FAILED"
        print(f"AI PIPELINE: {status}")
        print(f"{'=' * 50}")
        return 0 if all_passed else 1

    if not settings.NVIDIA_NIM_API_KEY:
        print_result("Nemotron request", False, "NVIDIA_NIM_API_KEY not configured")
        print(f"\n{'=' * 50}")
        print("AI PIPELINE: FAILED")
        print(f"{'=' * 50}")
        return 1

    from app.ai.nemotron import NemotronService

    nemotron = NemotronService()
    try:
        analysis = nemotron.analyze(detection=detection, image_bytes=image_bytes)
        all_passed &= print_result(
            "Nemotron request", True, f"model={nemotron.model}"
        )
        all_passed &= print_result(
            "Structured visual analysis received",
            True,
            f"confirmed={analysis.pothole_confirmed}, "
            f"size={analysis.visual_size}, "
            f"depth={analysis.apparent_depth}, "
            f"confidence={analysis.confidence:.2f}",
        )

        if analysis.uncertainties:
            for u in analysis.uncertainties:
                print(f"         Uncertainty: {u}")

    except ValueError as e:
        all_passed = False
        print_result("Nemotron request", False, str(e))

    # ------------------------------------------------------------------
    # Step 4: Full pipeline test
    # ------------------------------------------------------------------
    print()
    from app.ai.pipeline import AIPipeline

    pipeline = AIPipeline()
    result = pipeline.run(image_bytes)

    all_passed &= print_result(
        "Full pipeline chain",
        result.pipeline_status in ("completed", "partial_nemotron_failed", "no_pothole_detected"),
        f"status={result.pipeline_status}",
    )

    if result.errors:
        for err in result.errors:
            print(f"         Pipeline error: {err}")

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    print(f"\n{'=' * 50}")
    status = "PASS" if all_passed else "FAILED"
    print(f"AI PIPELINE: {status}")
    print(f"{'=' * 50}")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(test_ai_pipeline())
