import api from './api';

/** Matriz de permisos configurable (ADMIN_CLINICA). Espeja /permisos. */
export const permisoService = {
  async obtenerMatriz() {
    const { data } = await api.get('/permisos/matriz');
    return data.data;
  },
  async cambiar({ rolId, permisoId, permitido }) {
    const { data } = await api.put('/permisos', { rolId, permisoId, permitido });
    return data;
  },
};

export default permisoService;
