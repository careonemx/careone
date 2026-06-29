import api from './api';

/** Pantalla Inicio. Espeja core/inicio del backend. */
export const inicioService = {
  async resumen(fecha) {
    const { data } = await api.get('/inicio/resumen', { params: fecha ? { fecha } : {} });
    return data.data; // InicioRecord
  },
};

export default inicioService;
