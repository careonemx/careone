package com.careone.api.core.paciente;

import com.careone.api.util.enums.Sexo;
import java.time.LocalDate;

/** DTO de salida de paciente. */
public record PacienteRecord(
        Long id,
        String nombre,
        String apellidos,
        String telefono,
        String email,
        LocalDate fechaNacimiento,
        Sexo sexo,
        String ocupacion,
        String tipoSangre,
        String direccion,
        String alergias,
        String notas,
        String emergenciaNombre,
        String emergenciaParentesco,
        String emergenciaTelefono,
        Long doctorId,
        boolean activo
) {
    public static PacienteRecord from(Paciente p) {
        return new PacienteRecord(
                p.getId(), p.getNombre(), p.getApellidos(), p.getTelefono(), p.getEmail(),
                p.getFechaNacimiento(), p.getSexo(), p.getOcupacion(), p.getTipoSangre(),
                p.getDireccion(), p.getAlergias(), p.getNotas(),
                p.getEmergenciaNombre(), p.getEmergenciaParentesco(), p.getEmergenciaTelefono(),
                p.getDoctor() != null ? p.getDoctor().getId() : null,
                p.isActivo());
    }
}
