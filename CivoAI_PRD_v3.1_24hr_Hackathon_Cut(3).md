# CivoAI — Product Requirements Document (PRD)

> **Version:** 3.1.0 — 24-Hour Hackathon Cut  
> **Status:** BUILD SCOPE LOCKED  
> **Product:** CivoAI — AI-Powered Pothole Reporting & Road Risk Intelligence  
> **Primary MVP Users:** Citizen, Admin  
> **Hackathon Constraint:** Complete a reliable end-to-end MVP within 24 hours.

---

# 1. Executive Summary

CivoAI is an AI-assisted civic infrastructure platform that allows citizens to report potholes using an image, location, and short description.

For the 24-hour hackathon MVP, CivoAI focuses on one complete workflow:

```text
Citizen Report
      ↓
Image Validation
      ↓
Roboflow Pothole Detection
      ↓
Single Nemotron Visual/Reasoning Call
      ↓
Deterministic Severity + Priority
      ↓
Simple Repair Recommendation
      ↓
Simple Preliminary Cost Estimate
      ↓
Admin Dashboard
      ↓
Automated Admin Email + Pothole Image
```

The MVP deliberately avoids building a full municipal asset-management system.

The goal is to demonstrate one strong capability:

> **Turn a citizen's pothole photo into an explainable, prioritized, actionable report that reaches the administrator automatically.**

---

# 2. Hackathon Product Principle

## Build the spine, not the entire city.

The MVP must prioritize:

1. Reliability.
2. End-to-end completion.
3. Explainability.
4. Visual quality.
5. Demonstrable AI value.
6. Fast response.
7. Safe uncertainty handling.

Features that do not directly improve the core demo are deferred.

---

# 3. Problem Statement

Citizens can see road damage but typically have no simple way to provide authorities with structured evidence.

Administrators receive complaints that may lack:

- Clear visual evidence.
- Location.
- Severity.
- Priority.
- Suggested action.
- Preliminary repair cost.
- A concise summary.

CivoAI converts a citizen complaint into a structured AI-assisted pothole report.

---

# 4. MVP Goals

## Must Have

- Citizen can submit pothole image.
- Citizen can provide location.
- Citizen can provide a short description.
- System validates the image.
- Roboflow detects pothole.
- AI analyzes the visible road condition.
- Python calculates deterministic severity/risk.
- System assigns priority.
- System provides a preliminary repair recommendation.
- System provides a simple cost estimate.
- Report is stored.
- Admin sees report in dashboard.
- Admin receives an automated email.
- Email contains the pothole image.
- Email contains location, severity, recommendation, and cost estimate.

## Should Have

- Map link.
- Duplicate-report warning.
- AI confidence.
- Image-quality warning.
- Citizen report status.
- Admin filtering by priority.
- Simple report history.

## Nice to Have Only If Time Remains

- Heatmap.
- Before/after image.
- Admin assignment.
- Email retry UI.
- Basic analytics.

---

# 5. Explicit MVP Non-Goals

The following are **not part of the 24-hour implementation**.

- Engineer role.
- Full engineer inspection workflow.
- Full maintenance lifecycle.
- MoRTH RAG.
- Vector database for engineering documents.
- Automated document parsing pipeline.
- Real Tamil Nadu SOR ingestion pipeline.
- CPWD DSR ingestion pipeline.
- Live market-price collection.
- Full cost-rate versioning.
- Dedicated Depth Anything V2.
- RGB-D / LiDAR measurement.
- Live dashcam/video detection.
- Autonomous contractor dispatch.
- Final engineering certification.
- Tender/contract pricing.
- Complex GIS road-network analysis.
- Multi-hazard detection.
- Large-scale audit framework.

These features remain in the post-hackathon roadmap.

---

# 6. User Roles

## 6.1 Citizen — MVP

The citizen sees a very simple reporting interface.

### Citizen Form

```text
Report a Pothole
────────────────────────

📷 Upload Pothole Image
[ Choose Image ]

📍 Location
[ Use Current Location ]

Road / Area
[ Optional ]

⚠️ How dangerous is it?
[ Low ] [ Medium ] [ High ]

💧 Water visible?
[ Yes ] [ No ] [ Not Sure ]

📝 Description
[ Describe the problem ]

[ SUBMIT REPORT ]
```

### Required

- Image.
- Location.
- Perceived danger.

### Optional

- Road/area.
- Water presence.
- Description.

The citizen does not enter:

- Pothole dimensions.
- Depth in centimetres.
- Engineering classification.
- Repair method.
- Cost.

---

# 7. Admin — MVP

The admin is the primary operational user.

## Admin Dashboard

```text
CIVOAI ADMIN

┌─────────────────────────────────────────────┐
│ New Reports     High Priority     Resolved  │
│     18               5              31      │
└─────────────────────────────────────────────┘

Priority Queue
───────────────────────────────────────────────

CIV-000124   HIGH      Large pothole     NEW
CIV-000123   MEDIUM    Small pothole     REVIEW
CIV-000122   CRITICAL Deep pothole      NEW

[ View Report ]
```

## Admin Report View

```text
Report ID
Status
Priority
Pothole Image

AI Detection
Confidence

Severity
Risk Score

Location
Map Link

AI Recommendation

Estimated Cost
Cost Confidence

Citizen Description

[ Mark Reviewed ]
```

Admin assignment and full maintenance workflow are deferred.

---

# 8. Core User Journey

```text
1. Citizen opens CivoAI
        ↓
2. Uploads pothole image
        ↓
3. Shares/selects location
        ↓
4. Adds basic description
        ↓
5. Clicks Submit
        ↓
6. Backend creates Report ID
        ↓
7. Image validation
        ↓
8. Roboflow detection
        ↓
9. Nemotron analysis
        ↓
10. Deterministic severity engine
        ↓
11. Cost estimation
        ↓
12. Llama 3.2 11B Vision report generation
        ↓
13. Store report
        ↓
14. Admin email sent
        ↓
15. Citizen sees confirmation
```

# 9. AI Architecture — 24hr Simplification

## Production Vision

The long-term CivoAI architecture can contain:

```text
Vision Model
+
Risk Engine
+
RAG
+
Cost Engine
+
Agent
+
Tools
```

## Hackathon Implementation

Use:

```text
Roboflow
    ↓
Nemotron Omni
    ↓
Python Risk/Cost Logic
    ↓
Llama 3.2 11B Vision
    ↓
Final Report
```

The MVP uses **three AI/model components with clearly separated responsibilities**:

1. Roboflow YOLO — pothole detection.
2. Nemotron 3 Nano Omni 30B-A3B Reasoning — visual analysis.
3. Llama 3.2 11B Vision — final report generation.

The Python risk and cost engines remain deterministic.

Do not implement a separate multi-tool agent orchestration layer during the 24-hour build.

The larger agent architecture remains a roadmap item.

---

# 10. Roboflow Pothole Detection & Segmentation

## Responsibility

Roboflow is the **cloud computer-vision layer** for the CivoAI MVP.

The CivoAI backend will call the deployed Roboflow model/workflow through the **Roboflow API**. The YOLO model is not trained or hosted locally by CivoAI.

### Input

Citizen image.

### API Flow

```text
Citizen Image
      ↓
CivoAI FastAPI Backend
      ↓
Roboflow API
      ↓
Detection / Segmentation Result
      ↓
CivoAI Structured Evidence
```

## Detection — REQUIRED

Roboflow detection identifies whether a pothole is present and provides its location/confidence.

Example:

```json
{
  "pothole_detected": true,
  "confidence": 0.947,
  "detections": [
    {
      "class": "pothole",
      "confidence": 0.947,
      "bbox": {}
    }
  ]
}
```

### MVP Behavior

If:

```text
confidence >= configured threshold
```

then:

```text
Pothole Detected
```

Otherwise:

```text
Possible Pothole / Manual Review
```

The threshold is configuration, not an LLM decision.

## Segmentation — OPTIONAL

If the deployed Roboflow model/workflow supports segmentation, CivoAI may request/use the segmentation output through the same Roboflow API workflow.

Segmentation provides a pixel-level mask/polygon for the detected pothole.

Example conceptual output:

```json
{
  "segmentation": {
    "mask": {},
    "polygon": []
  }
}
```

### Segmentation is used for

- Highlighting the pothole on the uploaded image.
- More precise visual localization.
- Providing a pothole region to downstream AI analysis.
- Future affected-area estimation.

### Important MVP boundary

Segmentation is **optional for the 24-hour MVP**.

Detection is mandatory.

Do not add a separate segmentation service or second API call if the deployed Roboflow workflow can return both detection and segmentation in one request.

If the current Roboflow deployment only supports detection, the MVP proceeds with detection only.

## Roboflow Boundary

Roboflow is responsible for:

```text
Detection
+
Optional Segmentation
```

Roboflow is NOT responsible for:

```text
Severity
Priority
Cost
Engineering recommendation
Final report
```

Those are handled by CivoAI's Python engines and AI report-generation layer.

---

# 11. Nemotron Omni — Single AI Call

## Responsibility

Nemotron 3 Nano Omni 30B-A3B Reasoning performs multimodal interpretation.

It receives:

```text
Original image
+
Roboflow detection result
+
Citizen description
+
Basic location context
```

### It should return structured evidence

```json
{
  "visual_assessment": {
    "size": "large",
    "apparent_depth": "deep",
    "surface_damage": true,
    "water_visible": false,
    "road_hazard": true
  },
  "confidence": 0.86,
  "limitations": [
    "Physical depth cannot be confirmed from a normal RGB image."
  ]
}
```

### The model must NOT claim

```text
Exact depth: 14.3 cm
Exact area: 2.16 m²
Exact repair quantity
```

unless reliable physical scale exists.

---

# 12. Llama 3.2 11B Vision — Report Generator

## Responsibility

Llama 3.2 11B Vision is the **final report-generation model** for the hackathon MVP.

It converts trusted structured outputs into a concise, professional pothole report for:

- Admin dashboard.
- Admin email.
- Citizen-facing status summary where appropriate.

### Inputs

```text
Original image
+
Roboflow detection result
+
Nemotron visual evidence
+
Python severity result
+
Python priority result
+
Python cost estimate
+
Citizen description
+
Location
```

### Output

The model should generate:

```text
1. Executive summary
2. Detection result
3. Visual assessment
4. Severity and priority
5. Recommended action
6. Preliminary repair-cost summary
7. Limitations / uncertainty
```

### Critical Governance Rule

Llama 3.2 11B Vision is a **report writer**, not the source of truth for calculated values.

It MUST NOT:

- Change severity.
- Change risk score.
- Change priority.
- Invent measurements.
- Invent cost values.
- Invent engineering references.
- Invent facts not present in the input.
- Override deterministic Python results.

If a value is unavailable, it must say:

```text
Not available
```

or omit the field.

### Recommended Prompt Contract

```text
You are the CivoAI report-generation model.

Generate a concise professional pothole report using
ONLY the supplied evidence and calculated values.

Do not modify calculated severity, risk score, priority,
or cost.

Do not invent measurements, engineering references,
prices, or facts.

Clearly state uncertainty where evidence is limited.

Return:
- Executive Summary
- Detection
- AI Visual Assessment
- Severity & Priority
- Recommended Action
- Cost Estimate
- Limitations
```

For maximum speed, the report prompt should request a short response. The image can be provided to Llama when visual confirmation adds value; otherwise, the trusted structured JSON can be sufficient for report generation.

---

# 13. Deterministic Severity Engine

Severity must not be invented by the LLM.

Python calculates the score from structured evidence.

## MVP Inputs

```text
Roboflow confidence
Visual size
Apparent depth
Visible surrounding damage
Water presence
Citizen perceived danger
Traffic/context where available
```

## Example Rule Model

```text
Base Score
──────────
Small       = 20
Medium      = 40
Large       = 60

Depth
─────
Shallow     +5
Moderate    +10
Deep        +15
Very Deep   +20

Surrounding damage
──────────────────
Yes         +10

Water
─────
Yes         +10

Citizen danger
──────────────
Low         +0
Medium      +5
High        +10
```

Clamp:

```text
0–100
```

### Severity

```text
0–25    LOW
26–50   MODERATE
51–75   HIGH
76–100  CRITICAL
```

These are CivoAI MVP rules and must be clearly labeled as such.

---

# 14. Priority

Priority is derived from severity plus immediate hazard signals.

```text
CRITICAL → P0
HIGH     → P1
MODERATE → P2
LOW      → P3
```

Additional immediate-hazard signals may elevate priority:

```text
High citizen danger
+
Deep apparent pothole
+
Water
+
High-traffic context
```

The rules remain deterministic.

---

# 15. Repair Recommendation

Do not build a full engineering recommendation engine.

Use a small, transparent rule set.

## MVP Recommendation Rules

### LOW

```text
Routine monitoring / maintenance review.
```

### MODERATE

```text
Schedule routine pothole repair.
```

### HIGH

```text
Prioritize field inspection and pothole repair.
```

### CRITICAL

```text
Urgent site inspection and immediate safety-focused
maintenance action.
```

### Water Contribution

If water is visible:

```text
Pothole repair +
drainage inspection recommended.
```

The recommendation is explicitly:

> AI-assisted preliminary guidance, not final engineering approval.

---

# 16. Hackathon Cost Estimation

## Principle

Do not build a real-world rate ingestion platform during the hackathon.

Instead, use a **small local reference table** containing approximately 10–15 predefined cost items.

Example:

```text
cost_reference
─────────────────────────────────────
repair_type
size_category
material_cost
labour_cost
equipment_cost
total_min
total_max
unit
source_note
```

Example categories:

```text
Small pothole repair
Medium pothole repair
Large pothole repair
Deep pothole repair
Emergency temporary repair
Drainage-related maintenance allowance
```

The actual rates must be populated from an available authoritative or clearly documented local reference before the demo.

Do not fabricate that the table is official if it is not.

## Cost Logic

```text
Severity
+
Size
+
Repair Category
+
Optional Water/Drainage Flag
        ↓
Local Reference Table
        ↓
Preliminary Cost Range
```

### Output

```json
{
  "min": 3000,
  "max": 6000,
  "currency": "INR",
  "confidence": "MEDIUM",
  "type": "preliminary_estimate"
}
```

## Important

The cost is:

> **Preliminary AI-assisted estimate**

It is not:

- Contractor quotation.
- Tender price.
- Sanctioned municipal estimate.
- Final engineering cost.

---

# 17. Cost Resource Roadmap

The production system should eventually use:

```text
Tamil Nadu PWD / Schedule of Rates
        +
CPWD DSR
        +
Applicable local rates
        +
Material supplier quotations
        +
Labour/equipment rates
```

But the 24-hour MVP only needs a small verified reference table.

## Future Cost Architecture

```text
Official Rate Documents
        ↓
Structured Rate Database
        ↓
Financial-Year Versioning
        ↓
Regional Selection
        ↓
Quantity Calculation
        ↓
Deterministic Cost Engine
        ↓
AI Explanation
```

---

# 18. Admin Email — Mandatory MVP Feature

After every successfully processed citizen pothole complaint, CivoAI must send an automated email to the configured admin email address.

## Email Purpose

The email is an **alert**, not the complete system of record.

The admin should understand the incident in seconds.

## Email Structure

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CIVOAI
AI-Powered Civic Infrastructure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 NEW POTHOLE REPORT — HIGH PRIORITY

Report ID: CIV-2026-000124
Detected: 08 Aug 2026, 02:18 PM
Status: AI VERIFIED
Priority: P1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 POTHOLE EVIDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ORIGINAL POTHOLE IMAGE ]

AI Detection Confidence: 94.7%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 LOCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Road: Trichy Main Road
Area: Ward 12
City: Coimbatore

Latitude: 10.xxxxxx
Longitude: 76.xxxxxx

[ VIEW LOCATION ON MAP ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pothole Detected: YES
Visual Size: LARGE
Apparent Depth: DEEP
Severity: HIGH
Risk Score: 82 / 100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ REQUIRED SOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prioritize field inspection and pothole repair.

If water contribution is detected:
Drainage inspection is also recommended.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ESTIMATED REPAIR COST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

₹3,000 – ₹6,000

Confidence: MEDIUM
Type: Preliminary AI-assisted estimate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 CITIZEN REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Citizen description]

Reported through: CivoAI Citizen Portal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [ OPEN FULL REPORT ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CivoAI AI Agent
Automated Pothole Detection & Reporting System

AI-generated decision-support output.
Final repair decisions require appropriate validation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

# 19. Email Image Requirement

The original citizen image must be visible in the admin email.

Preferred implementation:

```text
Email
  ↓
Inline image / CID attachment
```

Fallback:

```text
Secure image URL
```

Do not expose storage credentials or API keys.

---

# 20. GIS — MVP

Do not build a GIS platform.

Only store:

```text
latitude
longitude
road/area if available
```

Generate a map link.

Example:

```text
[ View Location on Map ]
```

Future:

```text
PostGIS
Road network
Ward boundaries
Heatmaps
Historical pothole clusters
```

---

# 21. Database — MVP

Only the essential entities are required.

## reports

```text
id
report_id
image_url
latitude
longitude
road_name
description
citizen_danger
water_visible

detection_status
detection_confidence

visual_size
apparent_depth
visual_damage
ai_confidence

severity_score
severity_level
priority

recommendation

cost_min
cost_max
cost_currency
cost_confidence

status

created_at
updated_at
```

## Optional users

```text
id
name
email
role
created_at
```

Only Citizen/Admin roles are required for MVP.

---

# 22. Report Status

Keep status simple.

```text
NEW
AI_VERIFIED
REVIEWED
RESOLVED
```

Do not implement the 10-state maintenance lifecycle in the hackathon.

---

# 23. Minimal Auditability

Store only the versions needed to reproduce the demo:

```text
model_version
rule_version
cost_table_version
created_at
```

Do not build a complete enterprise audit system.

---

# 24. Image Validation

Before calling AI:

```text
File type
File size
Resolution
Basic image readability
```

Return:

```text
ACCEPTED
```

or:

```text
REJECTED — Please upload a clearer road image.
```

If the image is acceptable but low quality:

```text
AI confidence may be reduced.
```

---

# 25. Failure Handling

## Roboflow Failure

```text
Retry once
↓
If failed:
Report processing failed
```

Do not fabricate detection.

## Nemotron Failure

```text
Use Roboflow result
+
safe deterministic fallback
```

Mark:

```text
AI analysis unavailable
```

## Cost Table Failure

Do not invent a price.

Return:

```text
Cost estimate unavailable.
```

## Email Failure

The report remains stored.

```text
Email status:
PENDING / FAILED
```

Retry if time permits.

---

# 26. Security

MVP requirements:

- API keys stored in environment variables/secrets.
- No secrets committed to Git.
- Validate uploaded files.
- Validate admin endpoints.
- Protect citizen information.
- Do not expose private image-storage credentials.
- Use HTTPS in deployment.
- Do not expose internal model/API credentials in email.

---

# 27. MVP API

## POST `/api/v1/reports`

Creates a citizen pothole report.

```text
multipart/form-data

image
latitude
longitude
road_name
description
citizen_danger
water_visible
```

## GET `/api/v1/reports/{report_id}`

Returns the report and AI assessment.

## GET `/api/v1/admin/reports`

Returns reports for admin dashboard.

## POST `/api/v1/reports/{report_id}/process`

Runs:

```text
Roboflow
→ Nemotron
→ Risk
→ Cost
→ Recommendation
→ Email
```

## POST `/api/v1/reports/{report_id}/review`

Admin marks report reviewed.

---

# 28. Technical Stack — MVP

| Layer | Technology |
|---|---|
| Frontend | React / Vite |
| Backend | Python + FastAPI |
| Validation | Pydantic |
| Database | PostgreSQL / Supabase |
| Storage | Supabase Storage |
| Vision detection | Roboflow YOLO via API |
| Segmentation | Roboflow segmentation via API where supported |
| Visual AI | NVIDIA Nemotron 3 Nano Omni 30B-A3B Reasoning |
| Report generation | Llama 3.2 11B Vision |
| Risk calculation | Python |
| Cost calculation | Python |
| Maps | Google Maps link / lightweight map |
| Email | Transactional email provider |
| Deployment | Vercel + backend cloud deployment |
| Containerization | Docker where required |

Use existing team infrastructure where available.

Do not add a new service unless necessary.

---

# 29. 24-Hour Execution Plan

## Hour 0–2 — Foundation

- Repository setup.
- Environment variables.
- Database.
- Storage.
- Basic routing.
- Backend health check.

## Hour 2–5 — Citizen UI

- Upload.
- Location.
- Description.
- Danger.
- Water.
- Submit.

## Hour 5–8 — Roboflow

- API integration.
- Detection result.
- Image overlay if possible.
- Error handling.

## Hour 8–11 — Nemotron

- Single multimodal call.
- Structured JSON output.
- Prompt hardening.
- Confidence/uncertainty.

## Hour 11–13 — Risk Engine

- Deterministic rules.
- Severity.
- Priority.
- Tests.

## Hour 13–15 — Cost

- Small verified reference table.
- Deterministic cost mapping.
- Cost range.
- Confidence.

## Hour 15–18 — Admin Dashboard

- Report list.
- Priority.
- Detail page.
- Image.
- AI analysis.
- Cost.
- Recommendation.

## Hour 18–20 — Email

- HTML email.
- Embedded pothole image.
- Map link.
- Cost.
- Recommendation.
- Full report link.

## Hour 20–22 — Integration

Full flow:

```text
Citizen
→ Backend
→ Roboflow
→ Nemotron
→ Risk
→ Cost
→ DB
→ Email
→ Admin
```

## Hour 22–24 — Demo Hardening

- Test 5–10 images.
- Test failure paths.
- Fix UI issues.
- Deploy.
- Prepare demo.
- Freeze features.

---

# 30. Demo Script

The judges should see this sequence.

### 1. Citizen

Upload a real pothole image.

### 2. Location

Select the road location.

### 3. Submit

Show processing.

### 4. AI Detection

```text
Pothole detected — 94.7%
```

### 5. AI Understanding

```text
Large
Deep apparent depth
Visible road damage
```

### 6. Risk

```text
HIGH
82 / 100
P1
```

### 7. Recommendation

```text
Prioritize field inspection and pothole repair.
```

### 8. Cost

```text
₹3,000 – ₹6,000
Preliminary estimate
```

### 9. Admin Email

Open email:

```text
Image
+
Location
+
Severity
+
Solution
+
Cost
```

### 10. Admin Dashboard

Show the same report stored in CivoAI.

This proves the complete loop.

---

# 31. Acceptance Criteria

## Citizen

- [ ] Can upload a valid image.
- [ ] Can provide location.
- [ ] Can submit report.
- [ ] Receives report ID.
- [ ] Receives processing status.

## AI

- [ ] Roboflow API detection works.
- [ ] Roboflow segmentation works if supported by the deployed model/workflow.
- [ ] MVP does not require a separate segmentation service.
- [ ] Nemotron returns structured visual assessment.
- [ ] Llama 3.2 11B Vision generates the final report.
- [ ] Report model does not alter deterministic values.
- [ ] No fake exact depth.
- [ ] Confidence is stored.

## Risk

- [ ] Same evidence produces same score.
- [ ] Severity is deterministic.
- [ ] Priority is deterministic.

## Cost

- [ ] Uses local reference table.
- [ ] Produces a range.
- [ ] Includes confidence.
- [ ] Does not fabricate rates.

## Admin

- [ ] Can see report.
- [ ] Can see image.
- [ ] Can see location.
- [ ] Can see severity.
- [ ] Can see recommendation.
- [ ] Can see cost.

## Email

- [ ] Sent after successful citizen processing.
- [ ] Contains pothole image.
- [ ] Contains report ID.
- [ ] Contains severity.
- [ ] Contains location.
- [ ] Contains recommendation.
- [ ] Contains cost.
- [ ] Links to full report.

## Reliability

- [ ] API failures do not create fake results.
- [ ] Email failure does not delete report.
- [ ] Secrets are protected.
- [ ] Production deployment works.

---

# 32. Post-Hackathon Roadmap

The following features are intentionally deferred.

## Phase 2 — Engineering Intelligence

- Engineer role.
- Detailed field inspection.
- Engineer evidence.
- Full inspection history.
- MoRTH RAG.
- Engineering clause retrieval.
- Better repair recommendations.

## Phase 3 — Cost Intelligence

- Tamil Nadu PWD/SOR ingestion.
- CPWD DSR integration.
- Financial-year versioning.
- District-level rates.
- Material quantity calculation.
- Labour/equipment calculations.
- Supplier quotations.
- Estimated vs actual cost calibration.

## Phase 4 — Advanced Vision

- Depth Anything V2.
- Camera calibration.
- Physical dimension estimation.
- Better segmentation.
- Multi-image inspection.
- Video/dashcam analysis.

## Phase 5 — GIS Intelligence

- PostGIS.
- Road network.
- Ward boundaries.
- Pothole heatmaps.
- Spatial clustering.
- Road-level deterioration analysis.

## Phase 6 — Operations

- Engineer assignment.
- Maintenance team workflow.
- Repair status lifecycle.
- Before/after verification.
- SLA tracking.
- Contractor integration.

## Phase 7 — Agentic CivoAI

```text
Vision Agent
     ↓
Risk Engine
     ↓
Engineering RAG
     ↓
Cost Engine
     ↓
GIS Tools
     ↓
Maintenance Tools
     ↓
AI Operations Agent
```

The multi-tool agent architecture belongs here, not in the 24-hour MVP.

---

# 33. Architecture Evolution

## Hackathon

```text
Citizen
   ↓
Roboflow
   ↓
Nemotron Omni
   ↓
Python Risk + Cost
   ↓
Report
   ├── Admin Dashboard
   └── Admin Email
```

## Production

```text
Citizen / Engineer
        ↓
Inspection Service
        ↓
Vision Pipeline
        ↓
Evidence Layer
        ↓
Risk Engine
        ↓
Engineering RAG
        ↓
Cost Intelligence
        ↓
Agent
        ↓
GIS + Maintenance Tools
        ↓
Operations Platform
```

---

# 34. Governance Rules

1. Do not add features during the 24-hour build unless they are required for the core demo.
2. Do not add new AI models without a measurable MVP need.
3. Do not let the LLM calculate deterministic severity.
4. Do not let the LLM invent cost rates.
5. Do not claim exact physical measurements without physical scale.
6. Do not claim official engineering guidance without a real source.
7. Label the cost as preliminary.
8. Keep the demo path reliable.
9. Prefer one working workflow over many incomplete workflows.
10. All external APIs require timeout/error handling.
11. Roboflow inference must be performed through the deployed API; no local YOLO hosting is required for the MVP.
12. Never commit secrets.
13. Freeze scope after Hour 20.
14. Roadmap features must not block the MVP.
15. AI recommendations are decision support, not final engineering approval.

# 35. Final MVP Definition

> **CivoAI is a citizen-first AI pothole reporting system that analyzes a submitted road image, detects and interprets the pothole, calculates a deterministic risk and priority score, produces a preliminary repair recommendation and cost range, and immediately delivers the evidence-backed report to an administrator through a dashboard and email.**

## The 24-hour product is complete when this works reliably:

```text
              CITIZEN
                 |
        Image + Location
                 |
                 v
             FASTAPI
                 |
                 v
          ROBOFLOW API
       Detection (Required)
       Segmentation (Optional)
                 |
                 v
          NEMOTRON OMNI
        Visual Assessment
                 |
                 v
       +---------+---------+
       |                   |
       v                   v
   RISK ENGINE        COST TABLE
   Python Rules       Python Rules
       |                   |
       +---------+---------+
                 |
                 v
       LLAMA 3.2 11B VISION
          Report Generator
                 |
                 v
          FINAL REPORT
           /        \
          v          v
      DASHBOARD     EMAIL
                   + IMAGE
```

**This is the scope freeze for the 24-hour hackathon.**

Anything outside this flow is **Phase 2+** unless the core workflow is already stable.
