-- CareOne - V13: duracion predeterminada de cita por clinica.
-- El agendamiento rapido ya no pide duracion; usa este valor (30 min por defecto).
-- Configurable por el ADMIN_CLINICA desde Configuracion.
ALTER TABLE tbl_clinica
    ADD COLUMN n_duracion_cita_def INTEGER NOT NULL DEFAULT 30;
