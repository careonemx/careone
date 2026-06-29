package com.careone.api.core.odontograma;

public record DienteRecord(int fdi, String estado, boolean brackets, String nota) {
    public static DienteRecord from(OdontogramaDiente d) {
        return new DienteRecord(d.getFdi(), d.getEstado(), d.isBrackets(), d.getNota());
    }
}
