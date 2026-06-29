package com.careone.api.core.facturacion;

public record DatosFiscalesRecord(
        boolean requiereFactura, String rfc, String razonSocial,
        String regimenFiscal, String usoCfdi, String cpFiscal, String emailFactura
) {
    public static DatosFiscalesRecord from(DatosFiscales d) {
        return new DatosFiscalesRecord(d.isRequiereFactura(), d.getRfc(), d.getRazonSocial(),
                d.getRegimenFiscal(), d.getUsoCfdi(), d.getCpFiscal(), d.getEmailFactura());
    }
    public static DatosFiscalesRecord vacio() {
        return new DatosFiscalesRecord(false, null, null, null, null, null, null);
    }
}
