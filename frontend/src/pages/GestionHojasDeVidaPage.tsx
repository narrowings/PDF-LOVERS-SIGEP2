import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import HojaDeVidaDetalleJTH from '../components/jth/HojaDeVidaDetalleJTH';
import { jthApi } from '../services/api';
import { getApiError } from '../utils/apiError';

interface HvResumen {
  id: string; tipoDocumento: string; numeroDocumento: string; correo: string; activo: boolean;
  hojaDeVida: {
    id: string; primerNombre: string; primerApellido: string; updatedAt: string;
    formacionAcademica: { verificadoEdFormal: boolean }[];
    experienciaLaboral: { verificado: boolean }[];
    experienciaDocente: { verificado: boolean }[];
  } | null;
}

function pendientes(hv: HvResumen['hojaDeVida']): number {
  if (!hv) return 0;
  return hv.formacionAcademica.filter(f => !f.verificadoEdFormal).length
    + hv.experienciaLaboral.filter(e => !e.verificado).length
    + hv.experienciaDocente.filter(e => !e.verificado).length;
}

export default function GestionHojasDeVidaPage() {
  const [lista, setLista]           = useState<HvResumen[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [seleccionado, setSelected] = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try { const r = await jthApi.listarHojas(); setLista(r.data as HvResumen[]); }
    catch (e) { setError(getApiError(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const filtrados = lista.filter(u => {
    const q = busqueda.toLowerCase();
    return u.numeroDocumento.includes(q)
      || u.correo.toLowerCase().includes(q)
      || (u.hojaDeVida ? `${u.hojaDeVida.primerNombre} ${u.hojaDeVida.primerApellido}`.toLowerCase().includes(q) : false);
  });

  if (seleccionado) {
    return (
      <Layout>
        <button onClick={() => { setSelected(null); void cargar(); }}
          className="text-xs text-primary-600 hover:underline mb-4 flex items-center gap-1">
          ← Volver al listado
        </button>
        <HojaDeVidaDetalleJTH usuarioId={seleccionado} onUpdated={cargar} />
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-primary-700 mb-5">Validación de Hojas de Vida</h1>

      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

      <input type="text" placeholder="Buscar por nombre, documento o correo..."
        value={busqueda} onChange={e => setBusqueda(e.target.value)}
        className="input-field max-w-sm mb-4" />

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['Servidor','Documento','Correo','HV','Pendientes','Acción'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-400">Sin resultados.</td></tr>
              )}
              {filtrados.map(u => {
                const nombre = u.hojaDeVida
                  ? `${u.hojaDeVida.primerNombre} ${u.hojaDeVida.primerApellido}` : '—';
                const pend = pendientes(u.hojaDeVida);
                return (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3 font-medium text-neutral-800">{nombre}</td>
                    <td className="px-4 py-3 text-neutral-500">{u.tipoDocumento.replace(/_/g,' ')} {u.numeroDocumento}</td>
                    <td className="px-4 py-3 text-neutral-500">{u.correo}</td>
                    <td className="px-4 py-3">
                      {u.hojaDeVida
                        ? <span className="badge-active">Diligenciada</span>
                        : <span className="badge-inactive">Sin HV</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.hojaDeVida && pend > 0
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">{pend} pendiente{pend !== 1 ? 's' : ''}</span>
                        : u.hojaDeVida
                          ? <span className="badge-active">Todo validado ✓</span>
                          : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.hojaDeVida && (
                        <button onClick={() => setSelected(u.id)}
                          className="text-xs text-primary-600 hover:underline font-medium">
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