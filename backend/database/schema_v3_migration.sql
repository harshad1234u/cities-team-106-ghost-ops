-- ========================================================
-- CivoAI Phase 3 Schema Migration (4-Table Architecture)
-- Run in Supabase SQL Editor AFTER Phase 1 & 2 schema
-- ========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SEQUENCE & RPC FOR REPORT IDs
-- ==========================================
CREATE SEQUENCE IF NOT EXISTS public.civoai_report_seq;

CREATE OR REPLACE FUNCTION public.generate_civoai_report_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_val INTEGER;
    year_str TEXT;
BEGIN
    next_val := nextval('public.civoai_report_seq');
    year_str := to_char(CURRENT_DATE, 'YYYY');
    RETURN 'CIV-' || year_str || '-' || lpad(next_val::text, 6, '0');
END;
$$;

-- ==========================================
-- 1. users
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL,
    auth_provider TEXT,
    google_sub TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. citizen_reports
-- ==========================================
CREATE TABLE IF NOT EXISTS public.citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT UNIQUE NOT NULL,
    user_id UUID NULL, -- Temporarily nullable until auth is fully enforced
    
    image_path TEXT NOT NULL,
    
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    road_name TEXT,
    landmark TEXT,
    
    noticed_at TIMESTAMPTZ,
    
    perceived_danger BOOLEAN,
    water_present BOOLEAN,
    traffic_level TEXT,
    
    description TEXT,
    
    status TEXT NOT NULL DEFAULT 'NEW',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_citizen_reports_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- ==========================================
-- 3. engineer_reports
-- ==========================================
CREATE TABLE IF NOT EXISTS public.engineer_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    
    image_path TEXT,
    
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    road_name TEXT,
    landmark TEXT,
    
    road_category TEXT,
    road_environment TEXT,
    
    pothole_number INTEGER,
    
    approx_length DOUBLE PRECISION,
    approx_width DOUBLE PRECISION,
    apparent_depth DOUBLE PRECISION,
    
    surrounding_damage TEXT,
    
    water_drainage TEXT,
    
    traffic_level TEXT,
    
    safety_risk TEXT,
    nearby_risk_location TEXT,
    
    engineering_observation TEXT,
    
    urgency TEXT,
    
    status TEXT NOT NULL DEFAULT 'DRAFT',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_engineer_reports_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT
);

-- ==========================================
-- 4. ai_reports
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    citizen_report_id UUID NULL,
    engineer_report_id UUID NULL,
    
    roboflow_detection JSONB,
    roboflow_segmentation JSONB,
    
    vision_analysis JSONB,
    nemotron_analysis JSONB,
    
    pothole_detected BOOLEAN,
    confidence DOUBLE PRECISION,
    
    severity TEXT,
    priority TEXT,
    
    risk_factors JSONB,
    
    repair_recommendation TEXT,
    estimated_cost JSONB,
    
    ai_summary TEXT,
    uncertainties JSONB,
    
    model_name TEXT,
    model_version TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_ai_citizen_report FOREIGN KEY (citizen_report_id) REFERENCES public.citizen_reports(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ai_engineer_report FOREIGN KEY (engineer_report_id) REFERENCES public.engineer_reports(id) ON DELETE RESTRICT,
    
    -- Exactly-One AI Source Constraint
    CONSTRAINT chk_ai_source CHECK (
        (citizen_report_id IS NOT NULL AND engineer_report_id IS NULL)
        OR
        (citizen_report_id IS NULL AND engineer_report_id IS NOT NULL)
    )
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_citizen_reports_user_id ON public.citizen_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_created_at ON public.citizen_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON public.citizen_reports(status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_report_id ON public.citizen_reports(report_id);

CREATE INDEX IF NOT EXISTS idx_engineer_reports_user_id ON public.engineer_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_engineer_reports_created_at ON public.engineer_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_engineer_reports_status ON public.engineer_reports(status);
CREATE INDEX IF NOT EXISTS idx_engineer_reports_report_id ON public.engineer_reports(report_id);

CREATE INDEX IF NOT EXISTS idx_ai_reports_citizen ON public.ai_reports(citizen_report_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_engineer ON public.ai_reports(engineer_report_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON public.ai_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_reports_severity ON public.ai_reports(severity);
CREATE INDEX IF NOT EXISTS idx_ai_reports_priority ON public.ai_reports(priority);

-- ==========================================
-- TIMESTAMP TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_citizen_reports_updated_at ON public.citizen_reports;
CREATE TRIGGER update_citizen_reports_updated_at BEFORE UPDATE ON public.citizen_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_engineer_reports_updated_at ON public.engineer_reports;
CREATE TRIGGER update_engineer_reports_updated_at BEFORE UPDATE ON public.engineer_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_reports_updated_at ON public.ai_reports;
CREATE TRIGGER update_ai_reports_updated_at BEFORE UPDATE ON public.ai_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS on all application tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- users policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- citizen_reports policies
-- Removed "Anyone can insert citizen report" permissive policy because FastAPI inserts via Service Role.
DROP POLICY IF EXISTS "Anyone can insert citizen report" ON public.citizen_reports;
DROP POLICY IF EXISTS "Citizens can read own reports" ON public.citizen_reports;
CREATE POLICY "Citizens can read own reports" ON public.citizen_reports FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Citizens can update own reports" ON public.citizen_reports;
CREATE POLICY "Citizens can update own reports" ON public.citizen_reports FOR UPDATE USING (auth.uid() = user_id);

-- engineer_reports policies
DROP POLICY IF EXISTS "Engineers can read own reports" ON public.engineer_reports;
CREATE POLICY "Engineers can read own reports" ON public.engineer_reports FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Engineers can insert own reports" ON public.engineer_reports;
CREATE POLICY "Engineers can insert own reports" ON public.engineer_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Engineers can update own reports" ON public.engineer_reports;
CREATE POLICY "Engineers can update own reports" ON public.engineer_reports FOR UPDATE USING (auth.uid() = user_id);

-- ai_reports policies
DROP POLICY IF EXISTS "Users can read AI reports for their citizen reports" ON public.ai_reports;
CREATE POLICY "Users can read AI reports for their citizen reports" ON public.ai_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.citizen_reports cr WHERE cr.id = ai_reports.citizen_report_id AND cr.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can read AI reports for their engineer reports" ON public.ai_reports;
CREATE POLICY "Users can read AI reports for their engineer reports" ON public.ai_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.engineer_reports er WHERE er.id = ai_reports.engineer_report_id AND er.user_id = auth.uid())
);
