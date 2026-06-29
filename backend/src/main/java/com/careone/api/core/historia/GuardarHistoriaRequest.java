package com.careone.api.core.historia;

import jakarta.validation.constraints.Size;
import java.util.Map;

/** Entrada para guardar la historia clinica. Mapas clave->boolean. */
public record GuardarHistoriaRequest(
        Map<String, Boolean> condiciones,
        Map<String, Boolean> antecedentes,
        @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres.")
        String observaciones
) {
}
