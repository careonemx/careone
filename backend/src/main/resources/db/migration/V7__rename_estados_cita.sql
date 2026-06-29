-- ============================================================================
-- CareOne - V7: alinear estados de cita a la spec v1.0.
--   SIN_CONFIRMAR -> AGENDADA
--   FINALIZADA    -> COMPLETADA
-- Se conservan CANCELADA y NO_ASISTIO. EN_CONSULTA se mantiene (Plan Pro).
-- ============================================================================
UPDATE tbl_cita SET e_estado = 'AGENDADA'   WHERE e_estado = 'SIN_CONFIRMAR';
UPDATE tbl_cita SET e_estado = 'COMPLETADA' WHERE e_estado = 'FINALIZADA';

-- El default de la columna tambien cambia a AGENDADA.
ALTER TABLE tbl_cita ALTER COLUMN e_estado SET DEFAULT 'AGENDADA';
