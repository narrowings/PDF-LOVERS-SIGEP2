import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import { jthApi } from '../services/api';
import { getApiError } from '../utils/apiError';
import HojaDeVidaDetalleJTH from '../components/jth/HojaDeVidaDetalleJTH';

interface HvResumen {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  activo: boolean;
  hojaDeVida: {
    id: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    updatedAt: string;
    formacionAcademica: { id: string; tituloObtenido: string; institucion: string; verificadoEdFormal: boolean }[];
    experienciaLaboral: { id: string; nombreEntidad: string; cargo: string; verificado: boolean }[];
    experienciaDocente: { id: string; institucion: string; nivelAcademico: string; verificado: boolean }[];
  } | null;
}

export default function GestionHojasDeVidaPage() {
  const [lista, setLista] = useState<HvResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jthApi.listarHojas();
      setLista(res.data as HvResumen[]);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const filtrados = lista.filter(u => {
    const q = busqueda.toLowerCase();
    return (
      u.numeroDocumento.includes(q) ||
      u.correo.toLowerCase().includes(q) ||
      (u.hojaDeVida
        ? `${u.hojaDeVida.primerNombre} ${u.hojaDeVida.primerApellido}`.toLowerCase().includes(q)
        : false)
    );
  });

  const pendientesBadge = (hv: HvResumen['hojaDeVida']) => {
    if (!hv) return 0;
    return (
      hv.formacionAcademica.filter(f => !f.verificadoEdFormal).length +
      hv.experienciaLaboral.filter(e => !e.verificado).length +
      hv.experienciaDocente.filter(e => !e.verificado).length
    );
  };

  if (seleccionado) {
    return (
      <Layout>
        <button
          onClick={() => { setSeleccionado(null); void cargar(); }}
          className="text-xs text-primary-600 hover:underline mb-4 flex items-center gap-1"
        >
          ← Volver al listado
        </button>
        <HojaDeVidaDetalleJTH usuarioId={seleccionado} onUpdated={cargar} />
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-primary-700 mb-5">
        Validación de Hojas de Vida
      </h1>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, documento o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">Servidor</th>
                <th className="px-4 py-3 text-left font-medium">Documento</th>
                <th className="px-4 py-3 text-left font-medium">Correo</th>
                <th className="px-4 py-3 text-left font-medium">HV</th>
                <th className="px-4 py-3 text-left font-medium">Pendientes</th>
                <th className="px-4 py-3 text-left font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-400 text-sm">
                    No se encontraron servidores.
                  </td>
                </tr>
              )}
              {filtrados.map(u => {
                const nombre = u.hojaDeVida
                  ? `${u.hojaDeVida.primerNombre} ${u.hojaDeVida.primerApellido}`
                  : '—';
                const pendientes = pendientesBadge(u.hojaDeVida);
                return (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3 font-medium text-neutral-800">{nombre}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {u.tipoDocumento.replace(/_/g, ' ')} {u.numeroDocumento}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{u.correo}</td>
                    <td className="px-4 py-3">
                      {u.hojaDeVida ? (
                        <span className="badge-active">Diligenciada</span>
                      ) : (
                        <span className="badge-inactive">Sin HV</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.hojaDeVida && pendientes > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          {pendientes} sin validar
                        </span>
                      ) : u.hojaDeVida ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          Todo validado ✓
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.hojaDeVida && (
                        <button
                          onClick={() => setSeleccionado(u.id)}
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          Ver y validar →
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
