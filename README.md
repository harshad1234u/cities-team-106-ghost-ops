# CivoAI — AI-Powered Pothole Reporting & Road Risk Intelligence
### Cities Team 106 (Ghost Ops) · Tech for Good 2026 (GDG Coimbatore)

> **Version:** 3.1.0 — 24-Hour Hackathon Cut  
> **Status:** Full Stack Implementation (FastAPI, React Vite, Roboflow, Nemotron, Llama Vision, Supabase)

CivoAI is an AI-assisted civic infrastructure platform that converts citizen pothole photos into explainable, prioritized, actionable municipal reports delivered directly to administrators.

---

## Roboflow AI Models

CivoAI uses two separate, independently configured Roboflow models:

### 1. Detection Model
Used to identify potholes and return bounding boxes/detection regions.
- **Environment Variable**: `ROBOFLOW_DETECTION_MODEL_ID` (e.g., `pothole-detection/1`)
- **Output**: Bounding boxes, confidence, detection count

### 2. Segmentation Model
Used to identify pixel-level polygon masks and affected road surface region.
- **Environment Variable**: `ROBOFLOW_SEGMENTATION_MODEL_ID` (e.g., `pothole-segmentation/1`)
- **Output**: Polygon points, pixel masks, region geometry

Both models are independently tested during pre-flight verification.

---

## AI Pipeline Architecture

```text
Citizen uploads road image
          │
          ▼
    CivoAI Backend
          │
     ┌────┴────┐
     │         │
     ▼         ▼
Roboflow    Roboflow
Detection   Segmentation
     │         │
     │         └──────────► Pothole mask & geometry
     │
     └────────────────────► Detection region
          │
          ▼
    Llama 3.2 Vision
          │
          ▼
    Visual assessment
          │
          ▼
      Nemotron
          │
          ▼
 Structured pothole report
```

---

## Core Architecture Flow

```text
Citizen Pothole Photo + Location + Description
                      ↓
           Image File Validation
                      ↓
   Roboflow Pothole YOLO (Detection & Segmentation)
                      ↓
      Nemotron Visual Evidence Analysis
                      ↓
   Deterministic Python Risk & Cost Calculation
                      ↓
     Llama 3.2 11B Vision Report Generation
                      ↓
            Supabase DB & Storage
                      ↓
     Admin Dashboard + Admin Email Alert
```

---

## Pre-Flight Verification & Test Suite

To verify all external dependencies (Roboflow Detection, Roboflow Segmentation, NVIDIA Nemotron, NVIDIA Llama 3.2 Vision, Supabase, Email Provider):

```bash
# 1. Configure .env file
cp .env.example .env

# 2. Run backend test suite
python -m pytest

# 3. Run preflight suite
python scripts/preflight/run_all_preflight.py
```

---

## Repository Structure

```text
civoAI/
├── backend/                  # FastAPI backend server
│   ├── app/
│   │   ├── main.py           # Core FastAPI application & /health /preflight endpoints
│   │   ├── core/             # Engine logic (Risk, Cost, Config)
│   │   ├── services/         # External API services
│   │   └── api/              # API routes
│   └── Dockerfile
├── frontend/                 # React + Vite UI application
├── scripts/
│   └── preflight/            # Pre-flight scripts (test_roboflow, test_roboflow_segmentation, etc.)
├── tests/                    # Pre-flight test suite package & fixtures
│   ├── fixtures/             # Local pothole test image fixtures
│   └── run_preflight.py
├── .env.example
├── .gitignore
├── PROPOSAL.md
├── MILESTONES.md
└── README.md
```
