import axios from 'axios';

// baseURL se lee de VITE_API_URL:
//  - local:  http://localhost:8080/api  (o lo que defina el .env de Vite)
//  - prod:   /api  (el reverse proxy enruta /api -> backend)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// ===== Manejo de tokens (en memoria + localStorage) =====
const ACCESS_KEY = 'careone_access_token';
const REFRESH_KEY = 'careone_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ===== Interceptor de request: adjunta el access token =====
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Interceptor de response: refresh automatico en 401 =====
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
};

/**
 * Cierra la sesion: limpia tokens y redirige al login. Evita que la app se quede
 * "colgada" cuando el refresh token tambien expiro. No redirige si ya esta en login.
 */
function cerrarSesion() {
  tokenStore.clear();
  localStorage.removeItem('careone_user');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Solo intentamos refresh una vez por request y nunca para el propio endpoint de refresh.
    if (status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      const refresh = tokenStore.getRefresh();
      if (!refresh) {
        cerrarSesion();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: refresh });
        const newAccess = data?.data?.accessToken || data?.accessToken;
        const newRefresh = data?.data?.refreshToken || data?.refreshToken;
        tokenStore.set(newAccess, newRefresh);
        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        cerrarSesion();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
