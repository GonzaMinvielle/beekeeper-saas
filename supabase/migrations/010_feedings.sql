-- Migration 010: Feeding history
-- Creates feedings table for tracking hive/apiary-level food supply

CREATE TABLE IF NOT EXISTS feedings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES organizations(id),
  hive_id     uuid REFERENCES hives(id) ON DELETE SET NULL,
  apiary_id   uuid REFERENCES apiaries(id) ON DELETE SET NULL,
  food_type   varchar NOT NULL
    CHECK (food_type IN ('azucar', 'jarabe', 'candy', 'proteico', 'polen', 'otro')),
  quantity_kg decimal(8,2) NOT NULL CHECK (quantity_kg > 0),
  date        date NOT NULL,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_manage_feedings"
  ON feedings
  FOR ALL
  USING  (org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedings_hive_id    ON feedings(hive_id);
CREATE INDEX IF NOT EXISTS idx_feedings_apiary_id  ON feedings(apiary_id);
CREATE INDEX IF NOT EXISTS idx_feedings_date       ON feedings(date DESC);
CREATE INDEX IF NOT EXISTS idx_feedings_org_id     ON feedings(org_id);
