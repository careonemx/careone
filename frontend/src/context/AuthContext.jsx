import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import { tokenStore } from '../services/api';

const AuthContext = createContext(null);

const USER_KEY = 'careone_user';

function loadStoredUser() {
  if (!tokenStore.getAccess()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const login = useCallback(async (email, password) => {
    const jwt = await authService.login(email, password);
    const u = {
      usuarioId: jwt.usuarioId,
      nombre: jwt.nombre,
      email: jwt.email,
      roles: jwt.roles || [],
      tenantId: jwt.tenantId,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role) => !!user?.roles?.includes(role),
    [user]
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout, hasRole }),
    [user, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

export default AuthContext;
