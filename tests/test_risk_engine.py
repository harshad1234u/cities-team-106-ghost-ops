import pytest
from app.core.risk_engine import calculate_risk

def test_risk_engine_no_pothole():
    sev, pri, rec, cost = calculate_risk(False, False, False, 0.0, {})
    assert sev == "NONE"
    assert pri == "NONE"
    assert rec == "No Pothole Detected — No Repair Needed"
    assert cost == "₹0"

def test_spiderman_regression_non_pothole_with_citizen_danger_and_water():
    """
    REGRESSION TEST (CIV-2026-000014):
    Citizen inputs (danger=True, water=True) MUST NOT override an explicit negative
    visual detection (pothole_detected=False) to create a fake CRITICAL rating.
    """
    sev, pri, rec, cost = calculate_risk(
        citizen_danger=True,
        water_visible=True,
        pothole_detected=False,
        confidence=0.0,
        nemotron_analysis={}
    )
    assert sev == "NONE"
    assert pri == "NONE"
    assert rec == "No Pothole Detected — No Repair Needed"
    assert cost == "₹0"

def test_risk_engine_low_risk():
    sev, pri, rec, cost = calculate_risk(False, False, True, 0.5, {})
    assert sev == "LOW"
    assert pri == "P3"

def test_risk_engine_medium_risk():
    sev, pri, rec, cost = calculate_risk(True, False, True, 0.7, {})
    assert sev == "MEDIUM"
    assert pri == "P2"

def test_risk_engine_high_risk():
    sev, pri, rec, cost = calculate_risk(True, True, True, 0.7, {})
    assert sev == "HIGH"
    assert pri == "P1"

def test_risk_engine_critical_risk():
    nemotron = {
        "apparent_depth": "deep",
        "surrounding_damage": "extensive",
        "visual_size": "large"
    }
    sev, pri, rec, cost = calculate_risk(True, True, True, 0.9, nemotron)
    assert sev == "CRITICAL"
    assert pri == "P0"
    assert rec == "Emergency Excavation & Full-Depth Asphalt Resurfacing"
    assert cost == "₹25,000 - ₹55,000"
