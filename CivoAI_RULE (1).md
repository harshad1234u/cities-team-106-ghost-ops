# CivoAI — AI Agent Rules & Hackathon Execution Governance

> **Version:** 1.0.0  
> **Project:** CivoAI  
> **Purpose:** Governing rules for any AI coding agent working on CivoAI during the 24-hour hackathon.  
> **Source of truth:** CivoAI PRD v3.1 — 24-Hour Hackathon Cut.  
> **Status:** Scope and execution rules locked.

---

## 1. Mission

The AI agent must help the team build a reliable, deployable, demonstrable CivoAI MVP within the 24-hour hackathon.

CivoAI's MVP converts:

```text
Citizen pothole image
        +
Location
        +
Citizen context
        ↓
Roboflow Detection
        ↓
Nemotron Visual Analysis
        ↓
Deterministic Python Risk + Cost
        ↓
Llama 3.2 11B Vision Report
        ↓
Admin Dashboard
        +
Admin Email + Image
```

The agent must optimize every action for:

1. Real-world problem impact
2. Working progress that can be demonstrated
3. Meaningful technical/AI execution
4. Deployability and continuity
5. Team collaboration and learning

---

# 2. Hackathon Judging Model

The hackathon evaluates five areas:

| Weight | Criterion |
|---:|---|
| 30% | Problem and real-world impact |
| 25% | Working progress demonstrated |
| 20% | Technical execution and meaningful AI use |
| 15% | Deployability and continuity |
| 10% | Collaboration and learning |

These criteria are not documentation only.

**Every meaningful agent action must be evaluated against them.**

---

# 3. Action Governance — Mandatory

Before making a significant code, architecture, dependency, model, UI, database, deployment, or scope decision, the AI agent must ask:

```text
1. Does this improve the real pothole-reporting problem?
2. Does this move the core workflow toward a working demo?
3. Does this provide meaningful technical or AI value?
4. Does this preserve deployability and continuity?
5. Can the team understand, test, explain, and maintain it?
```

If the answer is "No" to most of these questions, **do not implement the change.**

If the change is useful but outside MVP scope, defer it.

---

# 4. Weighted Decision Rule

When choosing between multiple implementation approaches, score each option:

```text
Impact              × 0.30
Working Demo        × 0.25
Technical/AI Value  × 0.20
Deployability       × 0.15
Collaboration       × 0.10
```

Use a 0–5 score for each dimension.

Example:

```text
Option A:
Impact              5
Working Demo        5
Technical/AI Value  4
Deployability       5
Collaboration       4

Weighted score =
5×0.30 + 5×0.25 + 4×0.20 + 5×0.15 + 4×0.10
= 4.75 / 5
```

Prefer the option with the stronger weighted score **unless reliability or security requires otherwise**.

---

# 5. Priority Hierarchy

When time or engineering capacity is limited, use this order:

```text
P0 — Core demo reliability
P1 — Required MVP functionality
P2 — Judge-visible AI/technical value
P3 — UX polish
P4 — Optional enhancement
P5 — Future roadmap
```

Never sacrifice P0/P1 work for P3/P4 features.

---

# 6. Core MVP Is the Protected Spine

The following workflow is protected:

```text
Citizen
  ↓
Image Validation
  ↓
Roboflow
  ↓
Nemotron
  ↓
Python Risk
  ↓
Python Cost
  ↓
Llama Report
  ↓
Database
  ↓
Admin Dashboard
  ↓
Admin Email + Image
```

Any change that threatens this workflow requires strong justification.

---

# 7. What the AI Agent MUST DO

## 7.1 Build the smallest working solution

Prefer:

```text
simple + reliable + explainable
```

over:

```text
complex + impressive-looking + fragile
```

---

## 7.2 Make every AI component meaningful

### Roboflow

Use for:

- pothole detection
- confidence
- bounding box
- optional segmentation if the deployed workflow supports it

### Nemotron

Use for:

- visual interpretation
- apparent size
- apparent depth category
- visible damage
- visible water
- hazard observations
- uncertainty

### Python

Use for:

- severity
- risk score
- priority
- recommendation
- cost lookup/calculation

### Llama 3.2 11B Vision

Use for:

- final report generation
- concise explanation
- presenting trusted evidence

Do not use an LLM merely to perform something deterministic that Python can do reliably.

---

# 8. AI Authority Rules

Authority is:

```text
User Input
    ↓
Roboflow Detection
    ↓
Python Deterministic Results
    ↓
Cost Reference Data
    ↓
Nemotron Visual Evidence
    ↓
Llama Report
```

The final report model must never override authoritative values.

For example:

```text
Python:
severity = HIGH
risk_score = 72
priority = P1
cost = ₹3,000–₹6,000
```

Llama must reproduce those values.

It must NOT change them to:

```text
severity = CRITICAL
risk_score = 86
cost = ₹8,000
```

---

# 9. What the AI Agent MUST NOT DO

## Never invent:

- pothole detection
- measurements
- exact depth
- exact width
- exact area
- cost
- government rates
- engineering standards
- road names
- ward numbers
- accident statistics
- traffic statistics
- contractor information
- official approvals
- citations
- sensor readings
- historical incidents

If information is unavailable:

```text
UNKNOWN
```

or

```text
UNAVAILABLE
```

or

```text
REVIEW_REQUIRED
```

---

# 10. No Fake AI

Do not add an AI model merely to claim that AI is being used.

Every model must have a clearly explainable responsibility.

A judge should be able to ask:

> "Why is this model here?"

and the team must have a precise answer.

---

# 11. No Fake Technical Complexity

Do not add:

- unnecessary microservices
- unnecessary queues
- unnecessary databases
- unnecessary agent frameworks
- unnecessary vector databases
- unnecessary orchestration
- unnecessary AI models

A simpler architecture that works is better than a complex architecture that fails during the demo.

---

# 12. Scope Lock

The AI agent MUST NOT independently expand the MVP.

Do not add during the 24-hour build:

- full engineer role
- full maintenance lifecycle
- engineering RAG
- Depth Anything V2
- physical depth measurement
- live dashcam/video detection
- contractor dispatch
- full GIS platform
- live market pricing
- automated engineering certification
- complex autonomous agent orchestration

These are roadmap items.

---

# 13. Scope Change Protocol

If the agent believes a new feature is necessary:

1. Explain why.
2. Identify which MVP requirement it enables.
3. Estimate implementation risk.
4. Identify what could break.
5. Determine whether the feature can wait.
6. Prefer the smallest version.

Do not silently expand scope.

---

# 14. Code Rules

Every code change must follow:

```text
Understand
  ↓
Plan
  ↓
Implement
  ↓
Validate
  ↓
Document important behavior
```

Do not blindly modify files.

Before editing:

- identify affected files
- understand current architecture
- preserve existing working behavior
- identify dependencies
- identify integration points

---

# 15. Code Quality Rules

Code must be:

- readable
- modular
- typed where practical
- validated
- testable
- consistent with existing project conventions

Avoid:

- giant functions
- duplicated business logic
- hidden magic numbers
- hard-coded API keys
- silent exceptions
- dead code
- unnecessary abstractions

---

# 16. Business Logic Must Not Live in Prompts

Do not encode critical business decisions only inside an LLM prompt.

For example, this is BAD:

```text
"Decide whether the pothole is critical."
```

Prefer:

```text
Nemotron → evidence

Python → severity score

Python → priority

Llama → explanation
```

Critical rules must be executable and testable.

---

# 17. Configuration Rules

Move configurable values out of business logic where practical.

Examples:

```text
ROBOFLOW_CONFIDENCE_THRESHOLD
API_TIMEOUT
RETRY_COUNT
SEVERITY_THRESHOLDS
COST_TABLE_VERSION
MODEL_NAME
```

Do not scatter these values throughout the codebase.

---

# 18. Secrets

NEVER:

- hard-code API keys
- commit API keys
- put secrets in frontend code
- print secrets in logs
- send secrets to LLMs
- put secrets in emails
- commit `.env`

Use environment variables/secrets.

---

# 19. API Integration Rules

Every external API must have:

- timeout
- error handling
- response validation
- controlled retry
- useful logging
- safe fallback where appropriate

External services:

```text
Roboflow
NVIDIA/Nemotron
Llama provider
Supabase
Email provider
```

A failed external API must never cause the system to fabricate a result.

---

# 20. Retry Rules

Do not retry indefinitely.

Default:

```text
Retry once for transient external failures.
```

Then:

```text
Fail safely.
Record failure.
Preserve report.
Allow retry/manual review.
```

---

# 21. Partial Success

The system must support partial success.

Example:

```text
Roboflow = SUCCESS
Nemotron = FAILURE
Risk = SUCCESS
Cost = SUCCESS
Llama = FAILURE
Email = SUCCESS
```

Do not label the entire pipeline as successful.

Store component status.

---

# 22. Image Validation Rules

Before AI inference:

Check:

- file type
- file size
- image readability
- minimum resolution
- image integrity

Reject:

- corrupted images
- blank images
- unsupported formats
- unusably low-resolution images

For poor but usable images:

```text
Accept
+
image_quality_warning = true
```

---

# 23. Roboflow Rules

Roboflow is authoritative for pothole detection in the MVP.

Use the deployed Roboflow API.

Do not:

- locally host another YOLO model unnecessarily
- invent detection
- let Llama override detection
- add a second detection provider without justification

Segmentation is optional.

If unsupported:

```text
Continue with detection.
```

---

# 24. No-Pothole Case

If detection confidence is below the configured threshold:

```text
Do not generate fake severity.
Do not generate fake cost.
Do not call the report "verified."
```

Use:

```text
Possible Pothole
Manual Review Required
```

where appropriate.

---

# 25. Nemotron Rules

Nemotron must provide visual evidence.

It must use categories such as:

```text
small
medium
large

shallow
moderate
deep

visible damage
water visible
hazard visible
```

Do not require fake precision.

---

# 26. Depth Rules

A normal RGB image does not reliably provide exact physical depth.

Therefore:

BAD:

```text
Depth = 14.2 cm
```

GOOD:

```text
Apparent depth = deep

Physical depth cannot be confirmed from RGB imagery.
```

---

# 27. Citizen Claims

Treat citizen-entered information as:

```text
citizen_reported
```

not automatically as:

```text
verified
```

Example:

Citizen:

```text
"Vehicles nearly crash here every day."
```

Report:

```text
Citizen-reported high hazard perception.
```

Do not convert it into verified accident statistics.

---

# 28. Severity Rules

Severity must be deterministic.

Python owns:

```text
severity_score
severity_level
```

The LLM cannot override them.

The configured scoring rules are the source of truth.

---

# 29. Priority Rules

Priority must be deterministic.

Default:

```text
CRITICAL → P0
HIGH     → P1
MODERATE → P2
LOW      → P3
```

Additional configured hazard signals may elevate priority.

---

# 30. Recommendation Rules

Use simple transparent rules.

```text
LOW:
Routine monitoring / maintenance review.

MODERATE:
Schedule routine pothole repair.

HIGH:
Prioritize field inspection and pothole repair.

CRITICAL:
Urgent site inspection and immediate safety-focused
maintenance action.
```

If water is visible:

```text
Add drainage inspection recommendation.
```

Never claim final engineering approval.

---

# 31. Cost Rules

Cost MUST come from configured reference data.

Never:

```text
LLM guesses price
```

Use:

```text
severity
+
size
+
repair category
+
configured reference table
→
cost range
```

Every cost must be labeled:

```text
Preliminary AI-assisted estimate
```

If reference data is unavailable:

```text
Cost estimate unavailable.
```

Never invent a number.

---

# 32. Report Generation Rules

Llama is the report writer.

It receives:

```text
Roboflow evidence
+
Nemotron evidence
+
Python severity
+
Python priority
+
Python recommendation
+
Python cost
+
citizen description
+
location
```

It generates:

1. Summary
2. Detection
3. Visual assessment
4. Severity/priority
5. Recommendation
6. Cost
7. Limitations

It must preserve authoritative values exactly.

---

# 33. Admin Email Rules

After successful processing:

Send an automated admin email.

Include:

- report ID
- pothole image
- detection confidence
- location
- severity
- risk score
- priority
- recommendation
- preliminary cost
- citizen description
- full report link

If email fails:

```text
Do not delete report.
Set email status = FAILED.
Preserve dashboard access.
```

---

# 34. Database Rules

The database is the system of record.

Store:

- report
- evidence
- calculated results
- model status
- versions
- timestamps
- email status

Use:

```text
report_id
```

as the processing identity.

Avoid duplicate processing and duplicate email delivery.

---

# 35. Idempotency

Processing the same report twice must not accidentally create:

- duplicate report records
- duplicate emails
- duplicate AI results

Before processing:

```text
Check report status.
```

If already successfully processed:

```text
Do not repeat unless explicitly requested.
```

---

# 36. Security Rules

The agent must verify before declaring the application ready:

- secrets are not committed
- API keys are server-side
- uploaded files are validated
- admin endpoints are protected
- storage access is controlled
- HTTPS is used in deployment
- private credentials are not exposed

---

# 37. Deployability — 15% Judge Score

Deployability is a first-class requirement.

Every implementation should consider:

```text
Can this run in the deployed environment?
```

Do not create code that works only locally unless it is explicitly a local development utility.

Before declaring a feature complete:

```text
Local test
   ↓
Production build
   ↓
Deployment
   ↓
Smoke test
```

---

# 38. Continuity — 15% Judge Score

The project must remain usable if:

- an AI API temporarily fails
- email fails
- a deployment restarts
- a user refreshes
- a processing request partially fails

The database must preserve important report state.

Avoid architecture where one temporary failure destroys the entire report.

---

# 39. Working Progress — 25% Judge Score

The agent must prioritize visible working increments.

Preferred development order:

```text
1. Backend health
2. Database/storage
3. Citizen submission
4. Roboflow
5. Nemotron
6. Risk engine
7. Cost engine
8. Report generation
9. Admin dashboard
10. Email
11. Deployment
12. Demo hardening
```

Do not spend hours polishing a UI before the backend pipeline works.

---

# 40. Problem Impact — 30% Judge Score

Every major feature must answer:

> "How does this help solve the pothole reporting problem?"

High-value features:

```text
Fast citizen reporting
Clear evidence
Location
AI detection
Risk prioritization
Actionable recommendation
Cost visibility
Automatic admin notification
```

Low-value features during MVP:

```text
decorative animations
complex profiles
gamification
unnecessary analytics
unrelated AI features
```

Prioritize features that make the real-world workflow better.

---

# 41. Technical Execution — 20% Judge Score

The agent should make the architecture easy to explain.

A judge should understand:

```text
Why Roboflow?
Why Nemotron?
Why Python?
Why Llama?
Why Supabase?
Why FastAPI?
```

The answer must be based on responsibility, not hype.

---

# 42. Meaningful AI Rule

AI must provide actual value.

Meaningful:

```text
Roboflow → detects pothole

Nemotron → interprets visual condition

Llama → turns structured evidence into report
```

Not meaningful:

```text
LLM → adds "Hello" to dashboard
```

Do not claim AI capability that the implementation does not actually provide.

---

# 43. Collaboration & Learning — 10% Judge Score

The agent must keep the code understandable to the team.

When introducing a non-obvious change:

Explain:

```text
What changed
Why it changed
How it works
How to test it
What can fail
```

Do not create opaque code that only the AI understands.

Prefer small modules with clear names.

---

# 44. Documentation Rules

Maintain enough documentation for the team to explain:

```text
Architecture
API flow
AI model responsibilities
Environment variables
Database schema
Run instructions
Deployment instructions
Failure behavior
Demo flow
```

Do not spend excessive time documenting trivial code during the hackathon.

---

# 45. Testing Rules

At minimum test:

### Happy path

```text
Valid pothole image
→ successful report
```

### Bad image

```text
Invalid image
→ safe rejection
```

### No pothole

```text
No detection
→ review required
```

### Low confidence

```text
Low confidence
→ uncertainty
```

### AI failure

```text
Nemotron failure
→ partial success
```

### Cost failure

```text
No rate
→ no fabricated cost
```

### Email failure

```text
Email failure
→ report preserved
```

### Duplicate processing

```text
Same report
→ no duplicate processing
```

---

# 46. Demo Reliability Rule

Before the final demo:

Run at least:

```text
5–10 representative images
```

Verify:

```text
Detection
Visual analysis
Severity
Priority
Cost
Report
Database
Dashboard
Email
```

Do not demo an untested feature.

---

# 47. Demo Mode Rule

A demo must use the same real pipeline whenever possible.

Do not create fake AI output that looks real.

If a mock is absolutely necessary for an unavailable external dependency:

```text
Clearly isolate it.
Clearly label it.
Do not present mock output as real inference.
```

---

# 48. Time Management Rules

During the 24-hour hackathon:

## Hour 0–2

Foundation.

## Hour 2–5

Citizen UI.

## Hour 5–8

Roboflow.

## Hour 8–11

Nemotron.

## Hour 11–13

Risk engine.

## Hour 13–15

Cost engine.

## Hour 15–18

Admin dashboard.

## Hour 18–20

Email.

## Hour 20–22

Full integration.

## Hour 22–24

Testing, deployment, demo hardening.

After approximately Hour 20:

```text
NO MAJOR NEW FEATURES.
```

Prioritize:

```text
FIX
TEST
DEPLOY
VERIFY
DEMO
```

---

# 49. Stop Conditions

The agent must stop adding functionality when:

```text
Citizen can submit
AND
Roboflow works
AND
Nemotron works
AND
Risk works
AND
Cost works
AND
Report works
AND
Database works
AND
Dashboard works
AND
Email works
AND
Production deployment works
```

At this point:

```text
Freeze features.
```

Focus on reliability.

---

# 50. Edge Case Matrix

| Situation | Agent behavior |
|---|---|
| Invalid image | Reject |
| Blank image | Reject |
| Low-quality image | Accept with warning |
| No pothole | Review required |
| Low detection confidence | Review required |
| Multiple potholes | Record count; use configured MVP handling |
| Water visible | Add drainage inspection recommendation |
| Exact depth unavailable | Say unavailable |
| Citizen claims exact depth | Mark citizen-reported |
| Nemotron fails | Partial success |
| Roboflow fails | Safe failure; no fake detection |
| Llama fails | Structured report remains available |
| Cost data missing | No cost estimate |
| Email fails | Store report; email status failed |
| Duplicate submission | Warn / preserve unless merge rule exists |
| Missing road name | Continue if coordinates valid |
| Missing location | Reject if location is mandatory |
| API timeout | Retry once, then fail safely |
| Database failure | Do not claim success |
| Secret detected in code | Stop and remove immediately |

---

# 51. Decision Tree

For every implementation decision:

```text
Does it improve the core pothole workflow?
          |
         YES
          ↓
Does it improve judge-visible working progress?
          |
         YES
          ↓
Does it provide real technical/AI value?
          |
         YES
          ↓
Can it be deployed reliably within the deadline?
          |
         YES
          ↓
Can the team understand and demonstrate it?
          |
         YES
          ↓
             BUILD
```

If any answer is:

```text
NO
```

then:

```text
DEFER
```

unless it is required for security, reliability, or an explicit MVP acceptance criterion.

---

# 52. Architecture Protection Rule

Never allow a feature to introduce unnecessary architectural complexity.

Current MVP architecture:

```text
React/Vite
    ↓
FastAPI
    ↓
Supabase
    ↓
Roboflow
    ↓
Nemotron
    ↓
Python Engines
    ↓
Llama
    ↓
Dashboard + Email
```

Do not introduce additional infrastructure unless there is a clear requirement.

---

# 53. Final Pre-Commit Checklist

Before committing a significant change:

```text
[ ] Does it support the MVP?
[ ] Does it improve problem impact?
[ ] Does it improve working progress?
[ ] Is AI usage meaningful?
[ ] Is it deployable?
[ ] Can the team explain it?
[ ] Is it tested?
[ ] Does it preserve existing functionality?
[ ] Are secrets protected?
[ ] Are edge cases handled?
[ ] Is failure behavior safe?
[ ] Does it avoid scope creep?
```

---

# 54. Final Pre-Demo Checklist

```text
[ ] Citizen can submit report
[ ] Image validation works
[ ] Location works
[ ] Roboflow works
[ ] Nemotron works
[ ] Severity works
[ ] Priority works
[ ] Cost works
[ ] Llama report works
[ ] Database stores report
[ ] Admin dashboard works
[ ] Admin email arrives
[ ] Image appears in email
[ ] Production deployment works
[ ] No secrets exposed
[ ] Failure paths tested
[ ] Demo images prepared
[ ] Team understands architecture
[ ] Team can explain every AI component
```

---

# 55. Golden Rules

The AI agent must always remember:

```text
1. BUILD THE SPINE, NOT THE CITY.

2. WORKING DEMO > EXTRA FEATURES.

3. REAL AI VALUE > AI HYPE.

4. EVIDENCE > ASSUMPTION.

5. DETERMINISTIC CALCULATION > LLM GUESS.

6. UNCERTAINTY > FALSE CONFIDENCE.

7. SIMPLE RELIABLE ARCHITECTURE > COMPLEX FRAGILE ARCHITECTURE.

8. DEPLOYABLE CODE > LOCAL-ONLY CODE.

9. TEAM UNDERSTANDING > AI-ONLY UNDERSTANDING.

10. NEVER SACRIFICE THE CORE DEMO FOR SCOPE CREEP.

11. NEVER INVENT DATA.

12. NEVER EXPOSE SECRETS.

13. AFTER THE CORE WORKS, STOP ADDING FEATURES.

14. EVERY ACTION MUST SUPPORT THE HACKATHON SCORE.

15. THE AGENT ASSISTS THE TEAM; IT DOES NOT OVERRIDE THE
    PRODUCT SCOPE OR HUMAN ENGINEERING AUTHORITY.
```

---

# 56. Final Definition of Done

CivoAI is considered MVP-complete only when the following
real-world workflow works end-to-end:

```text
Citizen
   ↓
Upload pothole image
   ↓
Provide location
   ↓
Submit
   ↓
Image validation
   ↓
Roboflow detection
   ↓
Nemotron visual analysis
   ↓
Python severity + priority
   ↓
Python preliminary cost
   ↓
Llama report
   ↓
Database
   ↓
Admin dashboard
   ↓
Admin email + pothole image
```

The system must complete this workflow without:

- fabricated results
- exposed secrets
- silent failures
- unexplained AI decisions
- unnecessary architecture
- uncontrolled scope expansion

The AI agent's job is to make this workflow **reliable, explainable,
deployable, and judge-demonstrable**.

---

# END OF RULES
