-- ============================================================
-- Migración 008 — display_name en org_members para mostrar en foro
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Agregar columna display_name a org_members
ALTER TABLE org_members
  ADD COLUMN IF NOT EXISTS display_name text;

-- Poblar display_name con el email del usuario para registros existentes
UPDATE org_members om
SET display_name = (
  SELECT split_part(u.email, '@', 1)
  FROM auth.users u
  WHERE u.id = om.user_id
)
WHERE display_name IS NULL;

-- Función que auto-rellena display_name al insertar un nuevo miembro
CREATE OR REPLACE FUNCTION set_member_display_name()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.display_name IS NULL THEN
    SELECT split_part(u.email, '@', 1)
    INTO NEW.display_name
    FROM auth.users u
    WHERE u.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_display_name ON org_members;
CREATE TRIGGER trg_member_display_name
  BEFORE INSERT ON org_members
  FOR EACH ROW EXECUTE FUNCTION set_member_display_name();
