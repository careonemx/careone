package com.careone.api.core.historia;

public record HigieneRecord(
        Integer cepilladosDia, String tipoCepillo, boolean usaHilo, boolean usaEnjuague
) {
    public static HigieneRecord from(HigieneBucal h) {
        return new HigieneRecord(h.getCepilladosDia(), h.getTipoCepillo(), h.isUsaHilo(), h.isUsaEnjuague());
    }
    public static HigieneRecord vacia() {
        return new HigieneRecord(null, null, false, false);
    }
}
