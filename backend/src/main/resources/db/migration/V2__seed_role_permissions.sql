-- ============================================================================
-- CareOne - V2: matriz BASE de permisos por rol (tbl_rol_permiso, fn_tenant_id NULL).
-- Reglas por defecto del sistema. Cada clinica puede sobreescribir con overrides.
-- ============================================================================

-- ADMIN_CLINICA: todo dentro de su clinica.
INSERT INTO tbl_rol_permiso (fn_rol_id, fn_permiso_id, fn_tenant_id, b_permitido)
SELECT r.pn_id, p.pn_id, NULL, TRUE
FROM tbl_rol r CROSS JOIN tbl_permiso p
WHERE r.e_nombre = 'ADMIN_CLINICA';

-- DOCTOR
INSERT INTO tbl_rol_permiso (fn_rol_id, fn_permiso_id, fn_tenant_id, b_permitido)
SELECT r.pn_id, p.pn_id, NULL, TRUE
FROM tbl_rol r
JOIN tbl_permiso p ON p.s_codigo IN (
    'CITA_VER','CITA_CREAR','CITA_CONFIRMAR','CITA_CANCELAR','CITA_NO_ASISTIO','CITA_FINALIZAR',
    'PAGO_REGISTRAR','PAGO_VER_SALDO','PACIENTE_VER','PACIENTE_EDITAR',
    'EXPEDIENTE_VER','ALERTA_MEDICA_VER'
)
WHERE r.e_nombre = 'DOCTOR';

-- RECEPCIONISTA
INSERT INTO tbl_rol_permiso (fn_rol_id, fn_permiso_id, fn_tenant_id, b_permitido)
SELECT r.pn_id, p.pn_id, NULL, TRUE
FROM tbl_rol r
JOIN tbl_permiso p ON p.s_codigo IN (
    'CITA_VER','CITA_CREAR','CITA_CONFIRMAR','CITA_CANCELAR','CITA_NO_ASISTIO',
    'PAGO_REGISTRAR','PAGO_VER_SALDO','PACIENTE_VER','PACIENTE_EDITAR','EXPEDIENTE_BASICO'
)
WHERE r.e_nombre = 'RECEPCIONISTA';

-- AYUDANTE
INSERT INTO tbl_rol_permiso (fn_rol_id, fn_permiso_id, fn_tenant_id, b_permitido)
SELECT r.pn_id, p.pn_id, NULL, TRUE
FROM tbl_rol r
JOIN tbl_permiso p ON p.s_codigo IN ('CITA_VER','PACIENTE_VER','EXPEDIENTE_BASICO')
WHERE r.e_nombre = 'AYUDANTE';
