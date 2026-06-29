package com.careone.api.core.facturacion;

import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantEntityListener;
import com.careone.api.util.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;

/**
 * Datos fiscales del paciente (Facturacion CFDI). 1:1 con paciente. Tenant-aware.
 * SOLO captura de datos; el timbrado/emision de facturas es fase futura.
 */
@Entity
@Table(name = "tbl_datos_fiscales")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(TenantEntityListener.class)
@Filter(name = "tenantFilter", condition = "fn_tenant_id = :tenantId")
public class DatosFiscales extends Auditable implements TenantAware {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pn_id")
    private Long id;

    @Column(name = "fn_tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "fn_paciente_id", nullable = false)
    private Long pacienteId;

    @Column(name = "b_requiere_factura", nullable = false)
    private boolean requiereFactura = false;

    @Column(name = "s_rfc", length = 20) private String rfc;
    @Column(name = "s_razon_social", length = 200) private String razonSocial;
    @Column(name = "s_regimen_fiscal", length = 100) private String regimenFiscal;
    @Column(name = "s_uso_cfdi", length = 100) private String usoCfdi;
    @Column(name = "s_cp_fiscal", length = 10) private String cpFiscal;
    @Column(name = "s_email_factura", length = 160) private String emailFactura;
}
