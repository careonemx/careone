package com.careone.api.core.consentimiento;

import com.careone.api.util.enums.TipoConsentimiento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearConsentimientoRequest(
        @NotNull(message = "El tipo de consentimiento es obligatorio.")
        TipoConsentimiento tipo,
        @Size(max = 400) String notas
) {
}
