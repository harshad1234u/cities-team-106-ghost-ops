-- ========================================================
-- CivoAI Phase 2 Schema Migration
-- Run in Supabase SQL Editor AFTER Phase 1 schema
-- ========================================================

-- Add missing PRD columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_id TEXT UNIQUE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS road_name TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS citizen_danger BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS water_visible BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS repair_recommendation TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS estimated_cost JSONB;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update default status to match PRD
ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'NEW';

-- Index for report_id lookups
CREATE INDEX IF NOT EXISTS idx_reports_report_id ON reports(report_id);
