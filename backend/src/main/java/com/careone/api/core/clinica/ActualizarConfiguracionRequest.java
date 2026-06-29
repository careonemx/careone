package com.careone.api.core.clinica;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

/**
 * El ADMIN_CLINICA edita los datos y el horario de SU clinica.
 * El horario (apertura/cierre) alimenta el calculo de slots de la Agenda (Fase 6).
 * WhatsApp: solo estructura (sin logica todavia).
 */
public record ActualizarConfiguracionRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 160) String nombre,

        @Size(max = 20) String rfc,
        @Size(max = 30) String telefono,
        @Email(message = "El email no es valido.") @Size(max = 160) String email,
        @Size(max = 400) String direccion,

        @NotNull(message = "La hora de apertura es obligatoria.")
        LocalTime horaApertura,
        @NotNull(message = "La hora de cierre es obligatoria.")
        LocalTime horaCierre,

        @Size(max = 30) String whatsappNumero,
        Boolean whatsappActivo
) {
}
