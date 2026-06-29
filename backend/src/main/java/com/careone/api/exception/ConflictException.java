package com.careone.api.exception;

/** Conflicto de datos (p. ej. email ya registrado, solape de cita). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
