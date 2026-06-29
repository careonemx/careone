import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard de rutas. Si no hay sesion, redirige al login indicado.
 * Si se pasan `roles`, exige que el usuario tenga al menos uno.
 */
export default function ProtectedRoute({ children, roles, loginPath = '/login' }) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
