-- Migration 012: Manual rainfall records per apiary

CREATE TABLE IF NOT EXISTS rainfall_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES organizations(id),
  apiary_id    uuid NOT NULL REFERENCES apiaries(id) ON DELETE CASCADE,
  date         date NOT NULL,
  mm_recorded  decimal(6,2) NOT NULL CHECK (mm_recorded >= 0),
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_rainfall_per_apiary_date UNIQUE (apiary_id, date)
);

ALTER TABLE rainfall_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_manage_rainfall_records"
  ON rainfall_records
  FOR ALL
  USING  (org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

CREATE INDEX IF NOT EXISTS idx_rainfall_apiary_date
  ON rainfall_records(apiary_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_rainfall_org_id
  ON rainfall_records(org_id);
