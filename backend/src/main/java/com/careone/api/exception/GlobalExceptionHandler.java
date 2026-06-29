package com.careone.api.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Manejador global de errores. Devuelve SIEMPRE mensajes claros pero seguros al
 * cliente (sin stack traces ni detalles internos) con el codigo HTTP correcto.
 * Los detalles reales solo van al log de servidor, sin PII.
 *
 * Mapa de codigos:
 *   400 Bad Request  -> validacion, tipo de parametro, body ilegible
 *   401 Unauthorized -> credenciales invalidas / no autenticado
 *   403 Forbidden    -> autenticado pero sin permiso
 *   404 Not Found    -> recurso inexistente o de otro tenant
 *   405 Method Not Allowed
 *   409 Conflict     -> reglas de negocio / duplicados / integridad
 *   413 Payload Too Large -> archivo muy grande
 *   500 Internal     -> error no controlado
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---- 401 ----
    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ApiResponse<Void>> handleAuth(Exception ex) {
        return status(HttpStatus.UNAUTHORIZED, MessageConstants.CREDENCIALES_INVALIDAS);
    }

    // ---- 403 ----
    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(Exception ex) {
        return status(HttpStatus.FORBIDDEN, MessageConstants.NO_AUTORIZADO);
    }

    // ---- 404 ----
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException ex) {
        // Usa el mensaje especifico si lo hay (controlado por nosotros), si no el generico.
        String msg = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage() : MessageConstants.RECURSO_NO_ENCONTRADO;
        return status(HttpStatus.NOT_FOUND, msg);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoHandler(NoHandlerFoundException ex) {
        return status(HttpStatus.NOT_FOUND, "La ruta solicitada no existe.");
    }

    // ---- 409 ----
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
        return status(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleIntegrity(DataIntegrityViolationException ex) {
        log.warn("Violacion de integridad: {}", ex.getMostSpecificCause().getMessage());
        return status(HttpStatus.CONFLICT, MessageConstants.CONFLICTO);
    }

    // ---- 400 ----
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        String resumen = errores.isEmpty()
                ? MessageConstants.DATOS_INVALIDOS
                : "Revisa estos campos: " + String.join(", ", errores.keySet()) + ".";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.validationError(resumen, errores));
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(jakarta.validation.ConstraintViolationException ex) {
        return status(HttpStatus.BAD_REQUEST, MessageConstants.DATOS_INVALIDOS);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(HttpMessageNotReadableException ex) {
        return status(HttpStatus.BAD_REQUEST, "El formato de los datos enviados no es valido.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return status(HttpStatus.BAD_REQUEST,
                "El parametro '" + ex.getName() + "' tiene un formato no valido.");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex) {
        return status(HttpStatus.BAD_REQUEST, "Falta el parametro obligatorio '" + ex.getParameterName() + "'.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArg(IllegalArgumentException ex) {
        return status(HttpStatus.BAD_REQUEST, MessageConstants.DATOS_INVALIDOS);
    }

    // ---- 405 ----
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethod(HttpRequestMethodNotSupportedException ex) {
        return status(HttpStatus.METHOD_NOT_ALLOWED, "El metodo HTTP no esta permitido en esta ruta.");
    }

    // ---- 413 ----
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleUploadSize(MaxUploadSizeExceededException ex) {
        return status(HttpStatus.CONTENT_TOO_LARGE, "El archivo es demasiado grande (maximo 10 MB).");
    }

    // ---- 500 ----
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Error no controlado: {}", ex.getClass().getSimpleName(), ex);
        return status(HttpStatus.INTERNAL_SERVER_ERROR, MessageConstants.ERROR_INTERNO);
    }

    private ResponseEntity<ApiResponse<Void>> status(HttpStatus s, String msg) {
        return ResponseEntity.status(s).body(ApiResponse.message(msg));
    }
}
