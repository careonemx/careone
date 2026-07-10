-- CareOne - V14: bloqueo de horario. Reserva un espacio de tiempo SIN crear una
-- cita (no genera paciente, expediente ni recordatorios). Se muestra como bloque
-- gris en la agenda y no se puede agendar encima.
CREATE TABLE tbl_bloqueo_horario (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_doctor_id     BIGINT,                        -- opcional: bloqueo de un doctor o general
    d_fecha          DATE         NOT NULL,
    t_hora_inicio    TIME         NOT NULL,
    t_hora_fin       TIME         NOT NULL,
    s_motivo         VARCHAR(200),                  -- Comida, Vacaciones, Junta, etc. (opcional)
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_bloqueo_tenant FOREIGN KEY (fn_tenant_id) REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_bloqueo_doctor FOREIGN KEY (fn_doctor_id) REFERENCES tbl_doctor (pn_id),
    CONSTRAINT ck_bloqueo_horas  CHECK (t_hora_fin > t_hora_inicio)
);
CREATE INDEX ix_bloqueo_tenant_fecha ON tbl_bloqueo_horario (fn_tenant_id, d_fecha);
