import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const isJTH = user?.rol === 'JEFE_TALENTO_HUMANO';

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-primary-700">
          Bienvenido al Sistema de Gestión de Empleo Público
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {isJTH ? 'Jefe de Talento Humano' : 'Servidor Público'} — Seleccione una opción.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashCard title="Mi Hoja de Vida"
          description="Registre y actualice sus datos personales, formación académica y experiencia laboral."
          to="/hoja-de-vida" icon="📋" />
        <DashCard title="Cambiar Contraseña"
          description="Actualice su contraseña de acceso al sistema."
          to="/cambiar-password" icon="🔒" />
        {isJTH && (
          <>
            <DashCard title="Gestión de Usuarios"
              description="Cree usuarios para nuevos servidores públicos y administre accesos."
              to="/gestion-usuarios" icon="👥" />
            <DashCard title="Validar Hojas de Vida"
              description="Revise y valide la información registrada por los servidores públicos."
              to="/gestion-hojas-de-vida" icon="✅" />
          </>
        )}
      </div>
    </Layout>
  );
}

function DashCard({ title, description, to, icon }: {
  title: string; description: string; to: string; icon: string;
}) {
  return (
    <Link to={to}
      className="card p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary-300 transition-all group">
      <div className="text-3xl">{icon}</div>
      <div>
        <h2 className="font-semibold text-primary-700 group-hover:text-primary-600 text-sm">{title}</h2>
        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <span className="text-xs text-primary-500 font-medium mt-auto">Ir →</span>
    </Link>
  );
}
