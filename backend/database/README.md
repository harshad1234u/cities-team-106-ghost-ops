# CivoAI Database Architecture

This directory contains the database schema migrations for the CivoAI platform.

## Current Architecture (Phase 3)

The CivoAI database is built on Supabase (PostgreSQL) and uses a 4-table core application architecture to enforce strict separation of evidence and analysis.

### Core Tables

1. **`users`**
   - Stores application-level user profiles (`citizen`, `engineer`, `admin`).
   - Relates to Supabase Auth (`auth.users`) for secure authentication.
   - Passwords and OAuth secrets are NOT stored here.

2. **`citizen_reports`**
   - Stores *only* citizen-submitted pothole evidence (image, location, perceived danger, etc.).
   - Temporarily allows `user_id` to be NULL until frontend authentication is fully integrated.
   - Contains a unique, human-readable `report_id` (e.g., `CIV-2026-000124`).

3. **`engineer_reports`**
   - Stores *only* engineer-submitted / field-observed pothole information (measurements, road category, engineering observations, urgency).
   - Requires an authenticated engineer (`user_id` NOT NULL).

4. **`ai_reports`**
   - Stores *only* AI-generated analysis (Roboflow detection, Nemotron reasoning, calculated severity, priority, repair recommendations).
   - Enforces an **Exactly-One Source Constraint**: An AI report must belong to either a `citizen_report_id` or an `engineer_report_id`, but never both or neither.

### Relationships

```text
Supabase Auth
     │
 auth.users
     │
     ▼
   users
     │
     ├───────────────┐
     ▼               ▼
citizen_reports  engineer_reports
     │               │
     └───────┬───────┘
             ▼
         ai_reports
```

### Security & RLS
- **Strict Row Level Security (RLS)** is enforced on all tables.
- **Service Role**: The FastAPI backend uses the Supabase service-role key for backend operations. This key bypasses RLS and must NEVER be exposed to the frontend.
- **Client Policies**: Citizens can only read/update their own reports.

### Storage
- Uses the `pothole-images` Supabase Storage bucket.
- Citizen images are stored in: `citizen-reports/{report_id}/original.<ext>`.
- Engineer images are stored in: `engineer-reports/{report_id}/original.<ext>`.
- Images are retrieved via securely generated signed URLs.

## Migrations

Run migrations sequentially in your Supabase SQL Editor.

- `schema_v3_migration.sql`: The primary 4-table architecture migration. Wait to run this until explicitly instructed during Phase 3 deployment.
