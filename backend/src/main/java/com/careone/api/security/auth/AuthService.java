package com.careone.api.security.auth;

import com.careone.api.core.usuario.Usuario;
import com.careone.api.core.usuario.UsuarioRepository;
import com.careone.api.security.CareOneUserDetails;
import com.careone.api.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import java.time.Instant;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public JwtResponse login(LoginRequest req) {
        // Mensaje generico SIEMPRE: no revelar si el email existe.
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new BadCredentialsException("credenciales"));

        if (!usuario.isActivo() || !passwordEncoder.matches(req.password(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("credenciales");
        }

        usuario.setUltimoAcceso(Instant.now());
        return buildResponse(usuario);
    }

    @Transactional(readOnly = true)
    public JwtResponse refresh(RefreshRequest req) {
        Claims claims;
        try {
            claims = tokenProvider.parse(req.refreshToken());
        } catch (Exception e) {
            throw new BadCredentialsException("refresh invalido");
        }
        if (!tokenProvider.isRefreshToken(claims)) {
            throw new BadCredentialsException("token no es de refresh");
        }
        Long usuarioId = tokenProvider.getUsuarioId(claims);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .filter(Usuario::isActivo)
                .orElseThrow(() -> new BadCredentialsException("usuario invalido"));
        return buildResponse(usuario);
    }

    private JwtResponse buildResponse(Usuario usuario) {
        CareOneUserDetails details = new CareOneUserDetails(usuario);
        String access = tokenProvider.generateAccessToken(details);
        String refresh = tokenProvider.generateRefreshToken(details);
        var roles = usuario.getRoles().stream().map(r -> r.getNombre().name()).toList();
        return new JwtResponse(
                access, refresh,
                usuario.getId(), usuario.getNombre(), usuario.getEmail(),
                roles, usuario.getTenantId());
    }
}
