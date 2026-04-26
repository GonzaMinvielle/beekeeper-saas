-- Migration 011: Honey supers tracking per hive

CREATE TYPE removal_reason AS ENUM ('harvest', 'other');

CREATE TABLE IF NOT EXISTS hive_supers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES organizations(id),
  hive_id         uuid NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
  placed_at       date NOT NULL,
  removed_at      date,
  removal_reason  removal_reason,
  harvest_id      uuid REFERENCES harvests(id) ON DELETE SET NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT removed_reason_requires_date
    CHECK (removal_reason IS NULL OR removed_at IS NOT NULL)
);

ALTER TABLE hive_supers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_manage_hive_supers"
  ON hive_supers
  FOR ALL
  USING  (org_id IN (SELECT get_user_org_ids()))
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

CREATE INDEX IF NOT EXISTS idx_hive_supers_hive_removed
  ON hive_supers(hive_id, removed_at);

CREATE INDEX IF NOT EXISTS idx_hive_supers_org_id
  ON hive_supers(org_id);
