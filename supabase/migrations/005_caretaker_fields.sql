-- ============================================================
-- Migración 005 — Datos del puestero por apiario
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE apiaries
  ADD COLUMN IF NOT EXISTS caretaker_name  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS caretaker_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS field_name      VARCHAR(255);
