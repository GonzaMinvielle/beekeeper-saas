-- Migration 009: Two-level inspections
-- Adds apiary-level inspection support to existing inspections table
-- and creates apiary_inspection_details for per-hive notes within an apiary inspection

-- ── 1. Extend inspections table ────────────────────────────────────────────

ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS inspection_level varchar DEFAULT 'hive'
    CHECK (inspection_level IN ('hive', 'apiary')),
  ADD COLUMN IF NOT EXISTS apiary_id uuid REFERENCES apiaries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS general_notes text,
  ADD COLUMN IF NOT EXISTS weather_conditions varchar
    CHECK (weather_conditions IN ('soleado', 'nublado', 'lluvioso', 'viento') OR weather_conditions IS NULL),
  ADD COLUMN IF NOT EXISTS flowering_status varchar
    CHECK (flowering_status IN ('activa', 'escasa', 'nula') OR flowering_status IS NULL);

-- ── 2. Create apiary_inspection_details ────────────────────────────────────

CREATE TABLE IF NOT EXISTS apiary_inspection_details (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  hive_id      uuid NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  observation  text,
  requires_attention boolean NOT NULL DEFAULT false,
  priority     varchar NOT NULL DEFAULT 'low'
    CHECK (priority IN ('low', 'medium', 'high')),
  org_id       uuid NOT NULL REFERENCES organizations(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE apiary_inspection_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_manage_apiary_inspection_details"
  ON apiary_inspection_details
  FOR ALL
  USING  (org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Index for fast lookup of details per inspection
CREATE INDEX IF NOT EXISTS idx_apiary_inspection_details_inspection_id
  ON apiary_inspection_details(inspection_id);

-- Index for fast lookup of apiary inspections that mention a hive
CREATE INDEX IF NOT EXISTS idx_apiary_inspection_details_hive_id
  ON apiary_inspection_details(hive_id);

-- Index on inspections for apiary-level filtering
CREATE INDEX IF NOT EXISTS idx_inspections_apiary_id
  ON inspections(apiary_id);
