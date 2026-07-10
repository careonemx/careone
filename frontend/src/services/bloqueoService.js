import api from './api';

/** Servicio de bloqueos de horario. Espeja core/bloqueo del backend. */
export const bloqueoService = {
  async rango(desde, hasta) {
    const { data } = await api.get('/bloqueos/rango', { params: { desde, hasta } });
    return data.data; // List<BloqueoHorarioRecord>
  },
  async crear(payload) {
    const { data } = await api.post('/bloqueos', payload);
    return data.data;
  },
  async eliminar(id) {
    const { data } = await api.delete(`/bloqueos/${id}`);
    return data;
  },
};

export default bloqueoService;
