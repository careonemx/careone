package com.careone.api.exception;

/**
 * Mensajes genericos al cliente. Deliberadamente vagos: no filtran detalles
 * internos ni revelan si un email existe (evita enumeracion de usuarios).
 */
public final class MessageConstants {

    private MessageConstants() {
    }

    public static final String CREDENCIALES_INVALIDAS = "Credenciales invalidas.";
    public static final String SESION_EXPIRADA = "La sesion expiro. Inicia sesion de nuevo.";
    public static final String NO_AUTORIZADO = "No tienes permiso para realizar esta accion.";
    public static final String RECURSO_NO_ENCONTRADO = "El recurso solicitado no existe.";
    public static final String DATOS_INVALIDOS = "Los datos enviados no son validos.";
    public static final String CONFLICTO = "La operacion no se puede completar por un conflicto de datos.";
    public static final String DEMASIADAS_PETICIONES = "Demasiados intentos. Espera un momento e intenta de nuevo.";
    public static final String ERROR_INTERNO = "Ocurrio un error. Intenta de nuevo mas tarde.";
}
