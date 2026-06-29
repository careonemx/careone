import api from './api';

/** Servicio de especialidades. Espeja core/especialidad del backend. */
export const especialidadService = {
  async listarTodas() {
    const { data } = await api.get('/especialidades');
    return data.data;
  },

  async listarActivas() {
    const { data } = await api.get('/especialidades/activas');
    return data.data;
  },

  async crear(payload) {
    const { data } = await api.post('/especialidades', payload);
    return data.data;
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`/especialidades/${id}`, payload);
    return data.data;
  },
};

export default especialidadService;
