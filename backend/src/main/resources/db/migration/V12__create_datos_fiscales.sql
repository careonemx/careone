-- ============================================================================
-- CareOne - V12: datos fiscales del paciente (Facturacion CFDI).
-- SOLO ESTRUCTURA. Sin timbrado, sin PAC, sin logica. Maqueta para fase futura.
-- Los datos fiscales solo se capturan cuando el paciente solicita factura.
-- ============================================================================
CREATE TABLE tbl_datos_fiscales (
    pn_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fn_tenant_id     BIGINT       NOT NULL,
    fn_paciente_id   BIGINT       NOT NULL,
    b_requiere_factura BOOLEAN    NOT NULL DEFAULT FALSE,
    s_rfc            VARCHAR(20),
    s_razon_social   VARCHAR(200),
    s_regimen_fiscal VARCHAR(100),
    s_uso_cfdi       VARCHAR(100),
    s_cp_fiscal      VARCHAR(10),
    s_email_factura  VARCHAR(160),
    d_creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    d_actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_fiscal_tenant   FOREIGN KEY (fn_tenant_id)   REFERENCES tbl_clinica (pn_id),
    CONSTRAINT fk_fiscal_paciente FOREIGN KEY (fn_paciente_id) REFERENCES tbl_paciente (pn_id),
    CONSTRAINT uq_fiscal_paciente UNIQUE (fn_paciente_id)
);
CREATE INDEX ix_fiscal_tenant ON tbl_datos_fiscales (fn_tenant_id);
