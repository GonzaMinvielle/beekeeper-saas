-- ============================================================
-- Migración 007 — Insertar Loque Americana en disease_library (si no existe)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

INSERT INTO disease_library (name, description, symptoms, treatment, severity)
SELECT
  'Loque Americana',
  'Enfermedad bacteriana grave causada por Paenibacillus larvae que afecta la cría. Altamente contagiosa; sus esporas pueden sobrevivir décadas en el material apícola.',
  'Cría hundida y oscura, olor característico a cola o pegamento. Escama adherida al alvéolo, difícil de desprender. Prueba del palillo: la masa necrótica se estira más de 10 mm.',
  'No tiene cura. Quemar el material afectado. Notificar a la autoridad sanitaria. Notificación obligatoria en la mayoría de jurisdicciones.',
  'high'
WHERE NOT EXISTS (
  SELECT 1 FROM disease_library
  WHERE lower(name) = lower('Loque Americana')
);
