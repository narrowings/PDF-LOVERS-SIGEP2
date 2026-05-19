import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RecuperarPasswordPage from './pages/RecuperarPasswordPage';
import DashboardPage from './pages/DashboardPage';
import HojaDeVidaPage from './pages/HojaDeVidaPage';
import CambiarPasswordPage from './pages/CambiarPasswordPage';
import GestionUsuariosPage from './pages/GestionUsuariosPage';
import GestionHojasDeVidaPage from './pages/GestionHojasDeVidaPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"       element={<DashboardPage />} />
            <Route path="/hoja-de-vida"    element={<HojaDeVidaPage />} />
            <Route path="/cambiar-password"element={<CambiarPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="JEFE_TALENTO_HUMANO" />}>
            <Route path="/gestion-usuarios"       element={<GestionUsuariosPage />} />
            <Route path="/gestion-hojas-de-vida"  element={<GestionHojasDeVidaPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}