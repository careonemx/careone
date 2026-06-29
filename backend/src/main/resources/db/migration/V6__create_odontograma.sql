-- ============================================================================
-- CareOne - V6: odontograma (notacion FDI). Un registro por diente con estado.
-- Solo aplica a especialidad Odontologia. Tenant-aware.
-- ============================================================================
CREATE TABLE tbl_odontograma_diente (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_paciente_id   BIGINT       NOT NULL,
    n_fdi            INTEGER      NOT NULL,           -- numero FDI del diente (11..48)
    e_estado         VARCHAR(20)  NOT NULL DEFAULT 'NORMAL', -- NORMAL/RESTAURADO/CARIES/AUSENTE
    b_brackets       BOOLEAN      NOT NULL DEFAULT FALSE,
    s_nota           VARCHAR(200),
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_odon_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_odon_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT uq_odon_paciente_fdi UNIQUE (fn_paciente_id, n_fdi)
);
CREATE INDEX ix_odon_tenant   ON tbl_odontograma_diente (fn_tenant_id);
CREATE INDEX ix_odon_paciente ON tbl_odontograma_diente (fn_paciente_id);
