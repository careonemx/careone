package com.careone.api.util.enums;

/** Estado de un consentimiento. */
public enum EstadoConsentimiento {
    PENDIENTE,
    FIRMADO_DIGITAL,  // firma en iPad (UI futura)
    FIRMADO_FISICO    // PDF escaneado subido
}
