package com.careone.api.core.pago;

import com.careone.api.util.enums.MetodoPago;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PagoRecord(
        Long id, Long pacienteId, Long tratamientoId, Long citaId,
        BigDecimal monto, MetodoPago metodo, String concepto, LocalDate fecha
) {
    public static PagoRecord from(Pago p) {
        return new PagoRecord(
                p.getId(), p.getPaciente().getId(),
                p.getTratamiento() != null ? p.getTratamiento().getId() : null,
                p.getCitaId(), p.getMonto(), p.getMetodo(), p.getConcepto(), p.getFecha());
    }
}
