-- hive_id debe ser nullable para inspecciones a nivel apiario
ALTER TABLE inspections ALTER COLUMN hive_id DROP NOT NULL;
