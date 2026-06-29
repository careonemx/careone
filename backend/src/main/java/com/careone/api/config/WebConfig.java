package com.careone.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuracion MVC. CORS se define en SecurityConfig (cadena de seguridad).
 * Reservado para formatters, interceptors, etc. de fases futuras.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
