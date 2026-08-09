-- CivoAI Phase 4 — Soft Delete Migration
-- Run in Supabase SQL Editor after v3 migration

ALTER TABLE public.citizen_reports
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS deleted_by UUID NULL,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS deletion_note TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_citizen_reports_is_deleted ON public.citizen_reports(is_deleted);
