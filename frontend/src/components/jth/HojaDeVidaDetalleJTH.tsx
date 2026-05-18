import { useState, useEffect, useCallback } from 'react';
import Spinner from '../shared/Spinner';
import Alert from '../shared/Alert';
import DocumentPreviewModal from '../shared/DocumentPreviewModal';
import { jthApi } from '../../services/api';
import { getApiError } from '../../utils/apiError';

interface Props {
  usuarioId: string;
  onUpdated: () => void;
}

interface VerifyBtnProps {
  verificado: boolean;
  onToggle: (v: boolean) => Promise<void>;
  loading: boolean;
}

function VerifyBtn({ verificado, onToggle, loading }: VerifyBtnProps) {
  return (
    <button
      disabled={loading}
      onClick={() => onToggle(!verificado)}
      className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
        verificado
          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-amber-100 text-amber-700 hover:bg-green-50 hover:text-green-700'
      }`}
      title={verificado ? 'Clic para levantar validación' : 'Clic para validar'}
    >
      {loading ? '...' : verificado ? '✓ Validado' : 'Validar'}
    </button>
  );
}

export default function HojaDeVidaDetalleJTH({ usuarioId, onUpdated }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jthApi.getHojaCompleta(usuarioId);
      setData(res.data as Record<string, unknown>);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => { void cargar(); }, [cargar]);

  const toggle = async (
    tipo: 'formacion' | 'experiencia' | 'docente',
    id: string,
    verificado: boolean,
  ) => {
    setBusyId(id);
    try {
      await jthApi.verificar(tipo, id, verificado);
      setSuccess(verificado ? 'Registro validado' : 'Validación levantada');
      await cargar();
      onUpdated();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner />;
  if (!data) return <Alert type="error" message="No se pudo cargar la hoja de vida." />;

  const hv = data['hojaDeVida'] as Record<string, unknown> | null;
  if (!hv) return <Alert type="warning" message="Este servidor aún no ha diligenciado su hoja de vida." />;

  const dd = hv['datosDemograficos'] as Record<string, unknown> | undefined;
  const dc = hv['datosContacto'] as Record<string, unknown> | undefined;
  const fa = (hv['formacionAcademica'] as Record<string, unknown>[]) ?? [];
  const el = (hv['experienciaLaboral'] as Record<string, unknown>[]) ?? [];
  const ed = (hv['experienciaDocente'] as Record<string, unknown>[]) ?? [];

  const nombre = [hv['primerNombre'], hv['segundoNombre'], hv['primerApellido'], hv['segundoApellido']]
    .filter(Boolean).join(' ');

  const preview = (url: string, title: string) => { setPreviewUrl(url); setPreviewTitle(title); };

  const sectionTitle = (t: string) => (
    <h3 className="section-title mt-5">{t}</h3>
  );

  const infoRow = (label: string, val: unknown) => (
    <div key={label} className="flex gap-1 text-sm">
      <span className="text-neutral-500 min-w-[160px] shrink-0">{label}:</span>
      <span className="text-neutral-800 font-medium">{String(val ?? '—')}</span>
    </div>
  );

  return (
    <div>
      {error && <div className="mb-3"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      {/* Header */}
      <div className="card p-5 mb-4">
        <h2 className="text-lg font-semibold text-primary-700 mb-1">{nombre}</h2>
        <p className="text-xs text-neutral-500">
          {String(data['tipoDocumento'] ?? '').replace(/_/g, ' ')} {String(data['numeroDocumento'] ?? '')} · {String(data['correo'] ?? '')}
        </p>
      </div>

      <div className="card p-5">
        {/* Datos personales */}
        {sectionTitle('I. Datos Personales')}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 mb-2">
          {infoRow('Género', hv['genero'])}
          {infoRow('Fecha nacimiento', hv['fechaNacimiento'] ? new Date(hv['fechaNacimiento'] as string).toLocaleDateString('es-CO') : '—')}
          {infoRow('Persona Exp. Polít.', hv['esPersonaExpPolit'] ? 'Sí' : 'No')}
          {dd && infoRow('Departamento', dd['departamento'])}
          {dd && infoRow('Municipio', dd['municipio'])}
          {dd && infoRow('Tipo zona', dd['tipoZona'])}
          {dd && infoRow('Dirección', dd['direccion'])}
          {dc && infoRow('Celular', dc['telefonoCelular'])}
          {dc && infoRow('Correo personal', dc['correoPersonal'])}
        </div>

        {/* Formación académica */}
        {sectionTitle('II. Formación Académica')}
        {fa.length === 0 && <p className="text-sm text-neutral-400 mb-3">Sin registros.</p>}
        <div className="flex flex-col gap-3 mb-2">
          {fa.map(f => (
            <div key={String(f['id'])} className="border border-neutral-200 rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="flex-1 text-sm">
                <p className="font-medium text-neutral-800">{String(f['tituloObtenido'])}</p>
                <p className="text-neutral-500">{String(f['institucion'])} · {String(f['nivelAcademico'])}</p>
                <p className="text-neutral-400 text-xs mt-0.5">
                  Estado: {String(f['estadoEstudio'])}
                  {f['fechaGrado'] ? ` · Grado: ${new Date(f['fechaGrado'] as string).toLocaleDateString('es-CO')}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {f['documentoUrl'] ? (
                  <button
                    onClick={() => preview(String(f['documentoUrl']), String(f['tituloObtenido']))}
                    className="text-primary-600 text-base" title="Ver soporte"
                  >👁</button>
                ) : null}
                <VerifyBtn
                  verificado={Boolean(f['verificadoEdFormal'])}
                  loading={busyId === String(f['id'])}
                  onToggle={(v) => toggle('formacion', String(f['id']), v)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Experiencia laboral */}
        {sectionTitle('III. Experiencia Laboral')}
        {el.length === 0 && <p className="text-sm text-neutral-400 mb-3">Sin registros.</p>}
        <div className="flex flex-col gap-3 mb-2">
          {el.map(e => (
            <div key={String(e['id'])} className="border border-neutral-200 rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="flex-1 text-sm">
                <p className="font-medium text-neutral-800">{String(e['cargo'])}</p>
                <p className="text-neutral-500">{String(e['nombreEntidad'])} · {String(e['tipoInstitucion'])}</p>
                <p className="text-neutral-400 text-xs mt-0.5">
                  Ingreso: {new Date(e['fechaIngreso'] as string).toLocaleDateString('es-CO')}
                  {e['trabajoActual'] ? ' · Trabajo actual' : e['fechaRetiro'] ? ` · Retiro: ${new Date(e['fechaRetiro'] as string).toLocaleDateString('es-CO')}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {e['documentoUrl'] ? (
                  <button
                    onClick={() => preview(String(e['documentoUrl']), `${String(e['cargo'])} — ${String(e['nombreEntidad'])}`)}
                    className="text-primary-600 text-base" title="Ver soporte"
                  >👁</button>
                ) : null}
                <VerifyBtn
                  verificado={Boolean(e['verificado'])}
                  loading={busyId === String(e['id'])}
                  onToggle={(v) => toggle('experiencia', String(e['id']), v)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Experiencia docente */}
        {sectionTitle('IV. Experiencia Laboral Docente')}
        {ed.length === 0 && <p className="text-sm text-neutral-400 mb-3">Sin registros.</p>}
        <div className="flex flex-col gap-3">
          {ed.map(e => (
            <div key={String(e['id'])} className="border border-neutral-200 rounded-lg p-3 flex items-start justify-between gap-3">
              <div className="flex-1 text-sm">
                <p className="font-medium text-neutral-800">{String(e['institucion'])}</p>
                <p className="text-neutral-500">{String(e['nivelAcademico'])}{e['materiaImpartida'] ? ` · ${String(e['materiaImpartida'])}` : ''}</p>
                <p className="text-neutral-400 text-xs mt-0.5">
                  Ingreso: {new Date(e['fechaIngreso'] as string).toLocaleDateString('es-CO')}
                  {e['trabajoActual'] ? ' · Actual' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {e['documentoUrl'] ? (
                  <button
                    onClick={() => preview(String(e['documentoUrl']), `${String(e['institucion'])} — ${String(e['nivelAcademico'])}`)}
                    className="text-primary-600 text-base" title="Ver soporte"
                  >👁</button>
                ) : null}
                <VerifyBtn
                  verificado={Boolean(e['verificado'])}
                  loading={busyId === String(e['id'])}
                  onToggle={(v) => toggle('docente', String(e['id']), v)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewUrl && (
        <DocumentPreviewModal
          url={previewUrl}
          title={previewTitle}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}
