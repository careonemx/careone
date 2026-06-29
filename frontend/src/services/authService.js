import api, { tokenStore } from './api';

/**
 * Servicio de autenticacion. Espeja security/auth del backend.
 * Las respuestas del backend vienen envueltas en { data, message }.
 */
export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    const jwt = data.data;
    tokenStore.set(jwt.accessToken, jwt.refreshToken);
    return jwt;
  },

  logout() {
    tokenStore.clear();
  },

  isAuthenticated() {
    return !!tokenStore.getAccess();
  },
};

export default authService;
