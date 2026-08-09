"""Deterministic Risk Engine for CivoAI."""

from typing import Dict, Any, Tuple

def calculate_risk(
    citizen_danger: bool,
    water_visible: bool,
    pothole_detected: bool,
    confidence: float,
    nemotron_analysis: Dict[str, Any]
) -> Tuple[str, str, str, str]:
    """
    Deterministically calculates operational scoring based strictly on Roboflow detection & Nemotron findings.
    
    CRITICAL WORKFLOW RULE:
    If NO pothole is detected by Roboflow (pothole_detected == False), stop downstream risk fabrication.
    Returns: (severity, priority, repair_recommendation, estimated_cost)
    """
    # 1. STRICT STOP: If no pothole detected by CV model, return NONE with zero cost
    if not pothole_detected:
        return ("NONE", "NONE", "No Pothole Detected — No Repair Needed", "₹0")

    # 2. Base score for confirmed pothole detection
    score = 1

    if confidence and confidence > 0.6:
        score += 1
    if water_visible:
        score += 1
    if citizen_danger:
        score += 1

    # Check Nemotron visual analysis findings if available
    if nemotron_analysis:
        apparent_depth = str(nemotron_analysis.get("apparent_depth", "")).lower()
        surrounding_damage = str(nemotron_analysis.get("surrounding_damage", "")).lower()
        visual_size = str(nemotron_analysis.get("visual_size", "")).lower()
        
        if apparent_depth in ("moderate", "deep"):
            score += 1
        if surrounding_damage in ("visible", "extensive"):
            score += 1
        if visual_size in ("medium", "large"):
            score += 1

    # Map score to realistic engineering severity, priority, recommendation, and cost per PRD
    if score >= 5:
        severity = "CRITICAL"
        priority = "P0"
        recommendation = "Emergency Excavation & Full-Depth Asphalt Resurfacing"
        cost = "₹25,000 - ₹55,000"
    elif score == 4:
        severity = "HIGH"
        priority = "P1"
        recommendation = "Mill & Heavy Hot-Mix Bituminous Patching"
        cost = "₹12,000 - ₹24,000"
    elif score >= 2:
        severity = "MEDIUM"
        priority = "P2"
        recommendation = "Standard Hot-Mix Patching & Water Drainage Clearing"
        cost = "₹4,500 - ₹9,500"
    else:
        severity = "LOW"
        priority = "P3"
        recommendation = "Cold-Mix Surface Sealing & Monitoring"
        cost = "₹1,500 - ₹3,500"

    return severity, priority, recommendation, cost
