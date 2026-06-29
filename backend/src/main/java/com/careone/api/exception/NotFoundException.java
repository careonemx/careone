package com.careone.api.exception;

/** El recurso no existe (o no es visible para el tenant actual). */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
