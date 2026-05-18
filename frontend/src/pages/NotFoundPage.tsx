import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-primary-800 flex flex-col items-center justify-center text-white">
      <p className="text-7xl font-bold text-accent-400 mb-4">404</p>
      <h1 className="text-2xl font-semibold mb-2">Página no encontrada</h1>
      <p className="text-primary-300 mb-8 text-sm">La ruta que busca no existe en el sistema.</p>
      <Link to="/dashboard" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded text-sm transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}
