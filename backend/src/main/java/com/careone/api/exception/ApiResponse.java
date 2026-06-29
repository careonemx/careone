package com.careone.api.exception;

import java.util.List;
import java.util.Map;

/**
 * Envoltorio uniforme de respuesta de la API: {@code { data, message, errors }}.
 * No exponer NUNCA stack traces ni detalles internos en {@code message}.
 *
 * <p>{@code errors} es un mapa campo -> mensaje, presente solo en errores de
 * validacion para que el frontend pueda resaltar cada campo concreto.
 */
public record ApiResponse<T>(T data, String message, Map<String, String> errors) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, null);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(data, message, null);
    }

    public static ApiResponse<Void> message(String message) {
        return new ApiResponse<>(null, message, null);
    }

    public static ApiResponse<Void> validationError(String message, Map<String, String> errors) {
        return new ApiResponse<>(null, message, errors);
    }

    /** Util para listar todas las claves de error (logging interno, sin PII). */
    public List<String> camposConError() {
        return errors == null ? List.of() : List.copyOf(errors.keySet());
    }
}
