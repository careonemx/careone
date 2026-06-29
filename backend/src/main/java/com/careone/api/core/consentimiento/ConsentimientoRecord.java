package com.careone.api.core.consentimiento;

import com.careone.api.util.enums.EstadoConsentimiento;
import com.careone.api.util.enums.TipoConsentimiento;
import java.time.Instant;

public record ConsentimientoRecord(
        Long id,
        Long pacienteId,
        TipoConsentimiento tipo,
        EstadoConsentimiento estado,
        String archivoNombre,
        boolean tieneArchivo,
        Instant firmadoEn,
        String notas
) {
    public static ConsentimientoRecord from(Consentimiento c) {
        return new ConsentimientoRecord(
                c.getId(), c.getPacienteId(), c.getTipo(), c.getEstado(),
                c.getArchivoNombre(), c.getArchivoRuta() != null,
                c.getFirmadoEn(), c.getNotas());
    }
}
