package com.careone.api.util;

/**
 * Patrones y mensajes de validacion reutilizables en los DTOs de entrada.
 * Mantener los mensajes claros y especificos (en espanol).
 */
public final class Validaciones {

    private Validaciones() {
    }

    // ---- Patrones (regex) ----
    /** Telefono: 7 a 15 digitos, opcional + inicial, espacios o guiones. */
    public static final String TELEFONO = "^[+]?[0-9\\s-]{7,20}$";
    /** RFC mexicano (persona fisica o moral). */
    public static final String RFC = "^([A-ZÑ&]{3,4})\\d{6}([A-Z0-9]{3})$";
    /** Tipo de sangre: A, B, AB, O con + o -. */
    public static final String TIPO_SANGRE = "^(A|B|AB|O)[+-]$";
    /** Solo letras, espacios y acentos (nombres). */
    public static final String SOLO_LETRAS = "^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s.'-]+$";

    // ---- Mensajes ----
    public static final String MSG_TELEFONO = "El telefono solo puede contener numeros (7 a 15 digitos).";
    public static final String MSG_RFC = "El RFC no tiene un formato valido (ej. XAXX010101000).";
    public static final String MSG_TIPO_SANGRE = "El tipo de sangre debe ser A+, A-, B+, B-, AB+, AB-, O+ u O-.";
    public static final String MSG_EMAIL = "El email no tiene un formato valido (ej. nombre@dominio.com).";
    public static final String MSG_SOLO_LETRAS = "Solo se permiten letras.";
}
