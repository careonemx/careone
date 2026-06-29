package com.careone.api.core.tipocita;

public record TipoCitaRecord(Long id, String nombre, Integer duracionDefault, boolean activo) {
    public static TipoCitaRecord from(TipoCita t) {
        return new TipoCitaRecord(t.getId(), t.getNombre(), t.getDuracionDefault(), t.isActivo());
    }
}
