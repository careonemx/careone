package com.careone.api.security.auth;

import java.util.List;

/**
 * Respuesta de login/refresh. Incluye datos minimos del usuario para que el
 * front pinte la UI (nombre, roles). NO incluye password ni datos sensibles.
 */
public record JwtResponse(
        String accessToken,
        String refreshToken,
        Long usuarioId,
        String nombre,
        String email,
        List<String> roles,
        Long tenantId
) {
}
