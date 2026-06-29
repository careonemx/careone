-- ============================================================================
-- CareOne - V4: cita. Tenant-aware. Estados con ciclo de vida; anti-solape por
-- doctor se valida en backend. Monto opcional. WhatsApp: solo estructura.
-- ============================================================================
CREATE TABLE tbl_cita (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_paciente_id   BIGINT       NOT NULL,
    fn_doctor_id     BIGINT       NOT NULL,
    s_tratamiento    VARCHAR(200) NOT NULL,
    d_fecha          DATE         NOT NULL,
    t_hora_inicio    TIME         NOT NULL,
    t_hora_fin       TIME         NOT NULL,
    n_duracion_min   INTEGER      NOT NULL DEFAULT 45,
    e_estado         VARCHAR(20)  NOT NULL DEFAULT 'SIN_CONFIRMAR',
    n_monto          NUMERIC(12,2),
    b_primera_vez    BOOLEAN      NOT NULL DEFAULT FALSE,
    -- WhatsApp: solo estructura (sin logica de envio)
    b_recordatorio_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
    s_notas          VARCHAR(600),
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_cita_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_cita_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT fk_cita_doctor   FOREIGN KEY (fn_doctor_id)   REFERENCES tbl_doctor (pn_id)
);
CREATE INDEX ix_cita_tenant       ON tbl_cita (fn_tenant_id);
CREATE INDEX ix_cita_doctor_fecha ON tbl_cita (fn_doctor_id, d_fecha);
CREATE INDEX ix_cita_fecha_estado ON tbl_cita (fn_tenant_id, d_fecha, e_estado);
CREATE INDEX ix_cita_paciente     ON tbl_cita (fn_paciente_id);
