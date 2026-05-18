import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Alert from '../components/shared/Alert';
import FormField from '../components/shared/FormField';
import Spinner from '../components/shared/Spinner';
import { usuarioApi } from '../services/api';
import { getApiError } from '../utils/apiError';

interface Usuario {
  id: string; tipoDocumento: string; numeroDocumento: string;
  correo: string; rol: string; activo: boolean;
  fechaFinRol: string | null; createdAt: string;
}

const TIPOS_DOC = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TARJETA_IDENTIDAD', label: 'Tarjeta de Identidad' },
];

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Crear form state
  const [crearForm, setCrearForm] = useState({ tipoDocumento: 'CEDULA_CIUDADANIA', numeroDocumento: '', correo: '' });
  const [crearLoading, setCrearLoading] = useState(false);

  // Inhabilitar state
  const [inhabilitarId, setInhabilitarId] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [inhabilitarLoading, setInhabilitarLoading] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usuarioApi.listar();
      setUsuarios(res.data as Usuario[]);
    } catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void cargarUsuarios(); }, [cargarUsuarios]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setCrearLoading(true);
    try {
      await usuarioApi.crear(crearForm);
      setSuccess('Usuario creado. La contraseña temporal es: [número de documento]Sigep2!');
      setCrearForm({ tipoDocumento: 'CEDULA_CIUDADANIA', numeroDocumento: '', correo: '' });
      await cargarUsuarios();
    } catch (err) { setError(getApiError(err)); }
    finally { setCrearLoading(false); }
  };

  const handleInhabilitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inhabilitarId || !fechaFin) return;
    setError(''); setSuccess(''); setInhabilitarLoading(true);
    try {
      await usuarioApi.inhabilitar(inhabilitarId, { fechaFin });
      setSuccess('Rol inhabilitado correctamente');
      setInhabilitarId(''); setFechaFin('');
      await cargarUsuarios();
    } catch (err) { setError(getApiError(err)); }
    finally { setInhabilitarLoading(false); }
  };

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-primary-700 mb-6">Gestión de Usuarios</h1>
      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Crear usuario */}
        <div className="card p-5">
          <h2 className="section-title">Crear Usuario Inicial (HU-004)</h2>
          <form onSubmit={handleCrear} className="space-y-3">
            <FormField label="Tipo de Documento" required>
              <select value={crearForm.tipoDocumento}
                onChange={e => setCrearForm(f => ({ ...f, tipoDocumento: e.target.value }))}
                className="input-field">
                {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Número de Identificación" required>
              <input type="text" inputMode="numeric" placeholder="Número de documento"
                value={crearForm.numeroDocumento}
                onChange={e => setCrearForm(f => ({ ...f, numeroDocumento: e.target.value }))}
                className="input-field" required />
            </FormField>
            <FormField label="Correo Electrónico" required>
              <input type="email" placeholder="correo@entidad.gov.co"
                value={crearForm.correo}
                onChange={e => setCrearForm(f => ({ ...f, correo: e.target.value }))}
                className="input-field" required />
            </FormField>
            <button type="submit" disabled={crearLoading} className="btn-primary w-full text-sm">
              {crearLoading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* Inhabilitar rol */}
        <div className="card p-5">
          <h2 className="section-title">Inhabilitar Rol (HU-005)</h2>
          <form onSubmit={handleInhabilitar} className="space-y-3">
            <FormField label="Seleccionar Servidor" required>
              <select value={inhabilitarId}
                onChange={e => setInhabilitarId(e.target.value)}
                className="input-field" required>
                <option value="">-- Seleccione un usuario --</option>
                {usuarios.filter(u => u.activo).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.numeroDocumento} — {u.correo}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Fecha de Fin de Rol" required>
              <input type="date" value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className="input-field" required />
            </FormField>
            <button type="submit" disabled={inhabilitarLoading || !inhabilitarId} className="btn-danger w-full text-sm">
              {inhabilitarLoading ? 'Inhabilitando...' : 'Inhabilitar Acceso'}
            </button>
          </form>
        </div>
      </div>

      {/* Tabla usuarios */}
      <div className="card overflow-hidden">
        <h2 className="px-5 py-3 section-title border-0 mb-0 bg-neutral-50 border-b border-neutral-200 rounded-t-lg">
          Servidores Públicos Registrados
        </h2>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left font-medium">Documento</th>
                  <th className="px-4 py-3 text-left font-medium">Correo</th>
                  <th className="px-4 py-3 text-left font-medium">Rol</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha Fin</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3 text-neutral-700">{u.tipoDocumento.replace(/_/g, ' ')} {u.numeroDocumento}</td>
                    <td className="px-4 py-3 text-neutral-600">{u.correo}</td>
                    <td className="px-4 py-3 text-neutral-600">{u.rol.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      {u.activo ? <span className="badge-active">Activo</span> : <span className="badge-inactive">Inactivo</span>}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {u.fechaFinRol ? new Date(u.fechaFinRol).toLocaleDateString('es-CO') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
