import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props { children: ReactNode; }

const NAV_ITEMS = [
  { path: '/dashboard',             label: 'Inicio',                roles: ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO'] },
  { path: '/hoja-de-vida',          label: 'Mi Hoja de Vida',       roles: ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO'] },
  { path: '/gestion-usuarios',      label: 'Gestión de Usuarios',   roles: ['JEFE_TALENTO_HUMANO'] },
  { path: '/gestion-hojas-de-vida', label: 'Validar Hojas de Vida', roles: ['JEFE_TALENTO_HUMANO'] },
  { path: '/cambiar-password',      label: 'Cambiar Contraseña',    roles: ['SERVIDOR_PUBLICO', 'JEFE_TALENTO_HUMANO'] },
];

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const visible = NAV_ITEMS.filter(i => user && i.roles.includes(user.rol));

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-primary-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-bold text-lg tracking-tight leading-none">
              <span className="text-white">sigep</span>
              <span className="text-accent-400 font-extrabold">II</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-primary-500" />
            <span className="hidden sm:block text-xs text-primary-200 font-medium uppercase tracking-widest">
              Función Pública
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Punto 10: mostrar correo en lugar del ID interno */}
            {user?.correo && (
              <span className="hidden md:block text-xs text-primary-200">{user.correo}</span>
            )}
            <span className="hidden sm:block text-xs bg-primary-600 rounded px-2 py-0.5">
              {user?.rol === 'JEFE_TALENTO_HUMANO' ? 'Jefe T.H.' : 'Servidor Público'}
            </span>
            <button onClick={handleLogout} disabled={loggingOut}
              className="text-xs text-primary-200 hover:text-white transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-primary-800 border-b border-primary-900">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {visible.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`text-xs font-medium px-4 py-3 whitespace-nowrap transition-colors ${
                  active ? 'text-white border-b-2 border-accent-400' : 'text-primary-300 hover:text-white'
                }`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>

      <footer className="bg-primary-900 text-primary-400 text-xs text-center py-3">
        SIGEP II — Sistema de Gestión de Empleo Público · Departamento Administrativo de la Función Pública
      </footer>
    </div>
  );
}