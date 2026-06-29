package com.careone.api.core.historia;

public record GinecoRecord(
        int gestas, int partos, int abortos,
        String tiempoGestacion, String metodoPlanificacion
) {
    public static GinecoRecord from(GinecoObstetrico g) {
        return new GinecoRecord(g.getGestas(), g.getPartos(), g.getAbortos(),
                g.getTiempoGestacion(), g.getMetodoPlanificacion());
    }
    public static GinecoRecord vacia() {
        return new GinecoRecord(0, 0, 0, null, null);
    }
}
