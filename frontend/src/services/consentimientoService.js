import api from './api';

/** Consentimientos de un paciente. Espeja core/consentimiento. */
export const consentimientoService = {
  async listar(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/consentimientos`);
    return data.data;
  },
  async crear(pacienteId, payload) {
    const { data } = await api.post(`/pacientes/${pacienteId}/consentimientos`, payload);
    return data.data;
  },
  async subirArchivo(pacienteId, id, file) {
    const fd = new FormData();
    fd.append('archivo', file);
    const { data } = await api.post(`/pacientes/${pacienteId}/consentimientos/${id}/archivo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  async firmarDigital(pacienteId, id) {
    const { data } = await api.patch(`/pacientes/${pacienteId}/consentimientos/${id}/firmar-digital`);
    return data.data;
  },
  urlArchivo(pacienteId, id) {
    // Para abrir el PDF en una pestana nueva (el token va por header en descargas via fetch;
    // aqui usamos la ruta directa que el backend sirve con Content-Disposition inline).
    return `/api/pacientes/${pacienteId}/consentimientos/${id}/archivo`;
  },
};

export const TIPOS_CONSENTIMIENTO = [
  { value: 'GENERAL', label: 'Consentimiento general' },
  { value: 'CIRUGIA', label: 'Cirugia' },
  { value: 'IMPLANTES', label: 'Implantes' },
  { value: 'ORTODONCIA', label: 'Ortodoncia' },
  { value: 'ENDODONCIA', label: 'Endodoncia' },
];

export const ESTADO_LABEL = {
  PENDIENTE: 'Pendiente',
  FIRMADO_DIGITAL: 'Firmado digital',
  FIRMADO_FISICO: 'Firmado fisico',
};

export default consentimientoService;
