package com.careone.api.core.tratamiento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TratamientoRecord(
        Long id, Long pacienteId, String nombre, BigDecimal total,
        BigDecimal pagado, BigDecimal pendiente,
        int sesionesTotal, int sesionesHechas, String estado,
        LocalDate inicio, String notas, Long doctorId, String doctorNombre
) {
    public static TratamientoRecord from(Tratamiento t, BigDecimal pagado) {
        BigDecimal pend = t.getTotal().subtract(pagado != null ? pagado : BigDecimal.ZERO);
        return new TratamientoRecord(
                t.getId(), t.getPaciente().getId(), t.getNombre(), t.getTotal(),
                pagado, pend, t.getSesionesTotal(), t.getSesionesHechas(), t.getEstado(),
                t.getInicio(), t.getNotas(),
                t.getDoctor() != null ? t.getDoctor().getId() : null,
                t.getDoctor() != null ? t.getDoctor().getUsuario().getNombre() : null);
    }
}
