package com.careone.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Respuesta para peticiones NO autenticadas (sin token, o token invalido/expirado)
 * a endpoints protegidos. Devuelve {@code 401 Unauthorized} (no el 403 por defecto
 * de Spring) para que el frontend distinga:
 *  - 401 = "no estas autenticado" -> intentar refresh y, si falla, ir al login;
 *  - 403 = "autenticado pero sin permiso" -> error real de autorizacion.
 *
 * Sin esto, un access token expirado producia 403 y el interceptor del frontend
 * (que solo reacciona a 401) dejaba al usuario "colgado" sin refrescar ni cerrar sesion.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    // Mismo envoltorio { data, message, errors } que el resto de la API.
    private static final String BODY =
            "{\"data\":null,\"message\":\"Tu sesion expiro o no has iniciado sesion.\",\"errors\":null}";

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(BODY);
    }
}
