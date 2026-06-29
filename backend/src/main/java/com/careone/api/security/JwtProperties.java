package com.careone.api.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades de JWT (prefijo careone.security.jwt en application.properties).
 */
@ConfigurationProperties(prefix = "careone.security.jwt")
public record JwtProperties(
        String secret,
        long accessTokenTtlSeconds,
        long refreshTokenTtlSeconds,
        String issuer
) {
}
