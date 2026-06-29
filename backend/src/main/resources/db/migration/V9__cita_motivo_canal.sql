-- ============================================================================
-- CareOne - V9: campos adicionales de cita segun spec v1.0.
--   s_motivo            -> motivo libre de la cita
--   e_canal_confirmacion-> EMAIL / WHATSAPP (solo dato, sin envio)
-- ============================================================================
ALTER TABLE tbl_cita ADD COLUMN s_motivo VARCHAR(400);
ALTER TABLE tbl_cita ADD COLUMN e_canal_confirmacion VARCHAR(20);
