-- ============================================================================
-- CareOne - V5: tratamiento (plan con progreso de sesiones y monto) + pago.
-- Tenant-aware. El saldo se deriva (total - sum(pagos)).
-- ============================================================================
CREATE TABLE tbl_tratamiento (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_paciente_id   BIGINT       NOT NULL,
    fn_doctor_id     BIGINT,
    s_nombre         VARCHAR(200) NOT NULL,
    n_total          NUMERIC(12,2) NOT NULL DEFAULT 0,
    n_sesiones_total INTEGER      NOT NULL DEFAULT 1,
    n_sesiones_hechas INTEGER     NOT NULL DEFAULT 0,
    e_estado         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',  -- ACTIVO/FINALIZADO
    d_inicio         DATE,
    s_notas          VARCHAR(600),
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_trat_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_trat_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT fk_trat_doctor   FOREIGN KEY (fn_doctor_id)   REFERENCES tbl_doctor (pn_id)
);
CREATE INDEX ix_trat_tenant   ON tbl_tratamiento (fn_tenant_id);
CREATE INDEX ix_trat_paciente ON tbl_tratamiento (fn_paciente_id);

CREATE TABLE tbl_pago (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_paciente_id   BIGINT       NOT NULL,
    fn_tratamiento_id BIGINT,
    fn_cita_id       BIGINT,
    n_monto          NUMERIC(12,2) NOT NULL,
    e_metodo         VARCHAR(20)  NOT NULL DEFAULT 'EFECTIVO', -- EFECTIVO/TARJETA/TRANSFERENCIA
    s_concepto       VARCHAR(200),
    d_fecha          DATE         NOT NULL DEFAULT CURRENT_DATE,
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_pago_tenant      FOREIGN KEY (fn_tenant_id)      REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_pago_paciente    FOREIGN KEY (fn_paciente_id)    REFERENCES tbl_paciente (pn_id),
    CONSTRAINT fk_pago_tratamiento FOREIGN KEY (fn_tratamiento_id) REFERENCES tbl_tratamiento (pn_id),
    CONSTRAINT fk_pago_cita        FOREIGN KEY (fn_cita_id)        REFERENCES tbl_cita (pn_id)
);
CREATE INDEX ix_pago_tenant   ON tbl_pago (fn_tenant_id);
CREATE INDEX ix_pago_paciente ON tbl_pago (fn_paciente_id);
CREATE INDEX ix_pago_fecha    ON tbl_pago (fn_tenant_id, d_fecha);
