import api from './api';

/** Servicio de citas / agenda. Espeja core/cita del backend. */
export const citaService = {
  async agendaDelDia(fecha) {
    const { data } = await api.get('/citas/agenda', { params: { fecha } });
    return data.data; // AgendaDiaRecord
  },
  async rango(desde, hasta) {
    const { data } = await api.get('/citas/rango', { params: { desde, hasta } });
    return data.data; // List<CitaRecord>
  },
  async crear(payload) {
    const { data } = await api.post('/citas', payload);
    return data.data;
  },
  async cambiarEstado(id, estado) {
    const { data } = await api.patch(`/citas/${id}/estado`, null, { params: { estado } });
    return data.data;
  },
  async reagendar(id, { fecha, horaInicio, duracionMin }) {
    const { data } = await api.patch(`/citas/${id}/reagendar`, null, {
      params: { fecha, horaInicio, duracionMin },
    });
    return data.data;
  },
};

export default citaService;
