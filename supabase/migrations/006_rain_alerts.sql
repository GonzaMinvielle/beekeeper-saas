-- ============================================================
-- Migración 006 — Tabla rain_alerts para alertas predictivas de lluvia
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS rain_alerts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id      uuid NOT NULL REFERENCES apiaries(id) ON DELETE CASCADE,
  alerted_at     timestamptz NOT NULL DEFAULT now(),
  forecast_time  timestamptz NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rain_alerts_apiary_alerted
  ON rain_alerts (apiary_id, alerted_at DESC);

ALTER TABLE rain_alerts ENABLE ROW LEVEL SECURITY;

-- Solo lectura desde la app (inserts se hacen desde cron con service_role)
CREATE POLICY "rain_alerts_read" ON rain_alerts
  FOR SELECT USING (
    apiary_id IN (
      SELECT a.id FROM apiaries a
      WHERE a.organization_id IN (
        SELECT organization_id FROM org_members WHERE user_id = auth.uid()
      )
    )
  );
