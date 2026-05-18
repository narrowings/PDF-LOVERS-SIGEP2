import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../shared/Spinner';

interface Props {
  requiredRole?: 'SERVIDOR_PUBLICO' | 'JEFE_TALENTO_HUMANO';
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <Spinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.rol !== requiredRole) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
