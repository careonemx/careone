package com.careone.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

/**
 * Genera y valida JWT (access + refresh). El access token incluye el
 * {@code tenant_id} y los roles; de ahi se deriva el aislamiento por tenant.
 */
@Component
public class JwtTokenProvider {

    private static final String CLAIM_TENANT = "tenant_id";
    private static final String CLAIM_ROLES = "roles";
    private static final String CLAIM_TYPE = "typ";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final JwtProperties props;
    private final SecretKey key;

    public JwtTokenProvider(JwtProperties props) {
        this.props = props;
        // El secret viene en Base64; debe tener >= 32 bytes para HS256.
        this.key = Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(props.secret()));
    }

    public String generateAccessToken(CareOneUserDetails user) {
        Instant now = Instant.now();
        List<String> roles = user.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList();
        return Jwts.builder()
                .issuer(props.issuer())
                .subject(String.valueOf(user.getUsuarioId()))
                .claim(CLAIM_TYPE, TYPE_ACCESS)
                .claim(CLAIM_TENANT, user.getTenantId())
                .claim(CLAIM_ROLES, roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(props.accessTokenTtlSeconds())))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(CareOneUserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(props.issuer())
                .subject(String.valueOf(user.getUsuarioId()))
                .claim(CLAIM_TYPE, TYPE_REFRESH)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(props.refreshTokenTtlSeconds())))
                .signWith(key)
                .compact();
    }

    /** Valida firma y expiracion; devuelve los claims o lanza JwtException. */
    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(props.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAccessToken(Claims claims) {
        return TYPE_ACCESS.equals(claims.get(CLAIM_TYPE, String.class));
    }

    public boolean isRefreshToken(Claims claims) {
        return TYPE_REFRESH.equals(claims.get(CLAIM_TYPE, String.class));
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUsuarioId(Claims claims) {
        return Long.valueOf(claims.getSubject());
    }
}
