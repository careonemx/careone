package com.careone.api.security;

import com.careone.api.tenant.TenantContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Valida el access token en cada request. Si es valido:
 *  - pone la autenticacion (con roles) en el SecurityContext;
 *  - pone el tenant_id en el {@link TenantContext} (capa 1 del aislamiento).
 *
 * Limpia el TenantContext SIEMPRE al terminar el request (evita fugas en el pool
 * de hilos).
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String CLAIM_TENANT = "tenant_id";
    private static final String CLAIM_ROLES = "roles";

    private final JwtTokenProvider tokenProvider;

    public JwtAuthFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (token != null) {
                authenticate(token, request);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
            SecurityContextHolder.clearContext();
        }
    }

    private void authenticate(String token, HttpServletRequest request) {
        try {
            Claims claims = tokenProvider.parse(token);
            if (!tokenProvider.isAccessToken(claims)) {
                return; // un refresh token no autentica peticiones normales
            }

            @SuppressWarnings("unchecked")
            List<String> roles = claims.get(CLAIM_ROLES, List.class);
            var authorities = roles == null ? List.<SimpleGrantedAuthority>of()
                    : roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();

            Long usuarioId = tokenProvider.getUsuarioId(claims);
            Long tenantId = claims.get(CLAIM_TENANT, Long.class);

            var authentication = new UsernamePasswordAuthenticationToken(usuarioId, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Capa 1: el tenant del token alimenta el contexto de aislamiento.
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
            }
        } catch (Exception e) {
            // Token invalido/expirado -> request sigue sin autenticar (401 lo da la cadena).
            SecurityContextHolder.clearContext();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
