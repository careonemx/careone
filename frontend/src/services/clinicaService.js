import api from './api';

/** Servicio de clinicas (panel SUPERADMIN). Espeja core/clinica del backend. */
export const clinicaService = {
  async listar({ q = '', page = 0, size = 20 } = {}) {
    const { data } = await api.get('/clinicas', { params: { q, page, size } });
    return data.data; // Page<ClinicaRecord>
  },

  async obtener(id) {
    const { data } = await api.get(`/clinicas/${id}`);
    return data.data;
  },

  async crear(payload) {
    const { data } = await api.post('/clinicas', payload);
    return data.data;
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/clinicas/${id}`, payload);
    return data.data;
  },

  async cambiarEstado(id, activo) {
    const { data } = await api.patch(`/clinicas/${id}/estado`, { activo });
    return data.data;
  },
};

export default clinicaService;
