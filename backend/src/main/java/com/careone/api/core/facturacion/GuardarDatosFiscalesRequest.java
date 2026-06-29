package com.careone.api.core.facturacion;

import com.careone.api.util.Validaciones;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GuardarDatosFiscalesRequest(
        Boolean requiereFactura,
        @Pattern(regexp = Validaciones.RFC + "|^$", message = Validaciones.MSG_RFC)
        @Size(max = 20) String rfc,
        @Size(max = 200) String razonSocial,
        @Size(max = 100) String regimenFiscal,
        @Size(max = 100) String usoCfdi,
        @Pattern(regexp = "^[0-9]{0,5}$", message = "El codigo postal debe tener 5 digitos.")
        @Size(max = 10) String cpFiscal,
        @Email(message = Validaciones.MSG_EMAIL) @Size(max = 160) String emailFactura
) {
}
