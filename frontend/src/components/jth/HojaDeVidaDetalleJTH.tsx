import { useState, useEffect, useCallback } from 'react';
import Spinner from '../shared/Spinner';
import Alert from '../shared/Alert';
import { jthApi } from '../../services/api';
import { getApiError } from '../../utils/apiError';

interface Props { usuarioId: string; onUpdated: () => void; }

function InlineDoc({ url }: { url?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!url) return <span className="text-neutral-300 text-xs italic">Sin soporte</span>;
  const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf');
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="text-xs text-primary-600 hover:underline">
        {open ? 'Ocultar soporte' : '👁 Ver soporte'}
      </button>
      {open && (
        <div className="mt-2 border border-neutral-200 rounded overflow-hidden bg-neutral-50">
          {isPdf
            ? <iframe src={url} title="soporte" className="w-full h-72" />
            : <img src={url} alt="soporte" className="max-h-72 object-contain mx-auto block p-1" />}
          <div className="px-2 py-1 border-t border-neutral-100 text-right">
            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">Abrir en nueva pestaña</a>
          </div>
        </div>
      )}
    </div>
  );
}

function VerifyToggle({ verificado, verificadoEn, onToggle, busy }: {
  verificado: boolean; verificadoEn?: string; onToggle: (v: boolean) => void; busy: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <button disabled={busy} onClick={() => onToggle(!verificado)}
        className={`text-xs font-medium px-3 py-1 rounded transition-colors ${verificado
          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
          : 'bg-amber-100 text-amber-700 hover:bg-green-50 hover:text-green-700'}`}>
        {busy ? '...' : verificado ? '✓ Validado — clic para levantar' : 'Validar'}
      </button>
      {verificado && verificadoEn && (
        <span className="text-xs text-neutral-400">
          {new Date(verificadoEn).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })}
        </span>
      )}
    </div>
  );
}

export default function HojaDeVidaDetalleJTH({ usuarioId, onUpdated }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId]   = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { const r = await jthApi.getHojaCompleta(usuarioId); setData(r.data as Record<string, unknown>); }
    catch (e) { setError(getApiError(e)); }
    finally { setLoading(false); }
  }, [usuarioId]);

  useEffect(() => { void cargar(); }, [cargar]);

  const toggle = async (tipo: 'formacion' | 'experiencia' | 'docente', id: string, v: boolean) => {
    setBusyId(id);
    try {
      await jthApi.verificar(tipo, id, v);
      setSuccess(v ? 'Registro validado correctamente.' : 'Validación levantada.');
      await cargar(); onUpdated();
    } catch (e) { setError(getApiError(e)); }
    finally { setBusyId(null); }
  };

  if (loading) return <Spinner />;
  if (!data)   return <Alert type="error" message="No se pudo cargar la hoja de vida." />;

  const hv = data['hojaDeVida'] as Record<string, unknown> | null;
  if (!hv)     return <Alert type="warning" message="Este servidor aún no ha diligenciado su hoja de vida." />;

  const dd = hv['datosDemograficos'] as Record<string, unknown> | undefined;
  const dc = hv['datosContacto']     as Record<string, unknown> | undefined;
  const fa = (hv['formacionAcademica']  as Record<string, unknown>[]) ?? [];
  const el = (hv['experienciaLaboral']  as Record<string, unknown>[]) ?? [];
  const ed = (hv['experienciaDocente']  as Record<string, unknown>[]) ?? [];

  const nombre = [hv['primerNombre'], hv['segundoNombre'], hv['primerApellido'], hv['segundoApellido']]
    .filter(Boolean).join(' ');
  const fmt = (v: unknown) => v ? new Date(v as string).toLocaleDateString('es-CO') : '—';
  const val = (v: unknown) => String(v ?? '—');

  const Field = ({ label, value }: { label: string; value: unknown }) => (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm text-neutral-800 font-medium">{String(value ?? '—')}</span>
    </div>
  );

  const SectionTitle = ({ t }: { t: string }) => (
    <h3 className="text-xs font-semibold text-primary-700 uppercase tracking-wide mt-5 mb-3 pb-1 border-b border-neutral-200">{t}</h3>
  );

  return (
    <div>
      {error   && <div className="mb-3"><Alert type="error"   message={error}   onClose={() => setError('')}   /></div>}
      {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      {/* Header */}
      <div className="card p-4 mb-4">
        <h2 className="text-base font-semibold text-primary-700">{nombre}</h2>
        <p className="text-xs text-neutral-500">
          {val(data['tipoDocumento']).replace(/_/g,' ')} {val(data['numeroDocumento'])} · {val(data['correo'])}
        </p>
      </div>

      {/* ── I. Datos Personales ──────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <SectionTitle t="I. Datos Personales" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <Field label="Género"           value={hv['genero']} />
          <Field label="Fecha nacimiento" value={fmt(hv['fechaNacimiento'])} />
          <Field label="Exp. Políticamente" value={hv['esPersonaExpPolit'] ? 'Sí' : 'No'} />
          {dd && <><Field label="Departamento" value={dd['departamento']} /><Field label="Municipio" value={dd['municipio']} /><Field label="Tipo zona" value={dd['tipoZona']} /></>}
          {dd && <Field label="Dirección" value={dd['direccion']} />}
          {dc && <><Field label="Celular" value={dc['telefonoCelular']} /><Field label="Correo personal" value={dc['correoPersonal']} /></>}
        </div>
        {hv['documentoUrl'] && (
          <div>
            <p className="text-xs text-neutral-500 mb-1">Documento de identidad adjunto:</p>
            <InlineDoc url={hv['documentoUrl'] as string} />
          </div>
        )}
      </div>

      {/* ── II. Formación ────────────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <SectionTitle t="II. Formación Académica" />
        {fa.length === 0 && <p className="text-sm text-neutral-400">Sin registros.</p>}
        <div className="flex flex-col gap-4">
          {fa.map(f => (
            <div key={val(f['id'])} className="border border-neutral-200 rounded-lg overflow-hidden">
              {/* Split row */}
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                {/* Left: datos */}
                <div className="p-3 flex flex-col gap-2">
                  <p className="font-medium text-sm text-neutral-800">{val(f['tituloObtenido'])}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Institución"  value={f['institucion']} />
                    <Field label="Nivel"         value={f['nivelAcademico']} />
                    <Field label="Estado"        value={f['estadoEstudio']} />
                    <Field label="Fecha grado"   value={fmt(f['fechaGrado'])} />
                    <Field label="País"          value={f['pais']} />
                    {f['areaConocimiento'] && <Field label="Área" value={f['areaConocimiento']} />}
                  </div>
                  <div className="mt-2">
                    <VerifyToggle verificado={Boolean(f['verificadoEdFormal'])} verificadoEn={f['verificadoEn'] as string}
                      busy={busyId === val(f['id'])} onToggle={v => toggle('formacion', val(f['id']), v)} />
                  </div>
                </div>
                {/* Right: soporte */}
                <div className="p-3 bg-neutral-50">
                  <p className="text-xs text-neutral-400 mb-2">Soporte adjunto</p>
                  <InlineDoc url={f['documentoUrl'] as string | null} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── III. Experiencia Laboral ─────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <SectionTitle t="III. Experiencia Laboral" />
        {el.length === 0 && <p className="text-sm text-neutral-400">Sin registros.</p>}
        <div className="flex flex-col gap-4">
          {el.map(e => (
            <div key={val(e['id'])} className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                <div className="p-3 flex flex-col gap-2">
                  <p className="font-medium text-sm text-neutral-800">{val(e['cargo'])}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Entidad"       value={e['nombreEntidad']} />
                    <Field label="Tipo"          value={e['tipoInstitucion']} />
                    <Field label="Ingreso"       value={fmt(e['fechaIngreso'])} />
                    <Field label="Retiro"        value={e['trabajoActual'] ? 'Actual' : fmt(e['fechaRetiro'])} />
                    {e['motivoRetiro'] && <Field label="Motivo retiro" value={e['motivoRetiro']} />}
                    {e['jornadaLaboral'] && <Field label="Jornada" value={e['jornadaLaboral']} />}
                  </div>
                  {e['funcionesCargo'] && (
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-400">Funciones</span>
                      <span className="text-xs text-neutral-700 whitespace-pre-wrap">{val(e['funcionesCargo'])}</span>
                    </div>
                  )}
                  <div className="mt-2">
                    <VerifyToggle verificado={Boolean(e['verificado'])} verificadoEn={e['verificadoEn'] as string}
                      busy={busyId === val(e['id'])} onToggle={v => toggle('experiencia', val(e['id']), v)} />
                  </div>
                </div>
                <div className="p-3 bg-neutral-50">
                  <p className="text-xs text-neutral-400 mb-2">Soporte adjunto</p>
                  <InlineDoc url={e['documentoUrl'] as string | null} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── IV. Experiencia Docente ──────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <SectionTitle t="IV. Experiencia Laboral Docente" />
        {ed.length === 0 && <p className="text-sm text-neutral-400">Sin registros.</p>}
        <div className="flex flex-col gap-4">
          {ed.map(e => (
            <div key={val(e['id'])} className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                <div className="p-3 flex flex-col gap-2">
                  <p className="font-medium text-sm text-neutral-800">{val(e['institucion'])}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Nivel"   value={e['nivelAcademico']} />
                    <Field label="Materia" value={e['materiaImpartida'] ?? '—'} />
                    <Field label="Ingreso" value={fmt(e['fechaIngreso'])} />
                    <Field label="Estado"  value={e['trabajoActual'] ? 'Actual' : fmt(e['fechaRetiro'])} />
                  </div>
                  <div className="mt-2">
                    <VerifyToggle verificado={Boolean(e['verificado'])} verificadoEn={e['verificadoEn'] as string}
                      busy={busyId === val(e['id'])} onToggle={v => toggle('docente', val(e['id']), v)} />
                  </div>
                </div>
                <div className="p-3 bg-neutral-50">
                  <p className="text-xs text-neutral-400 mb-2">Soporte adjunto</p>
                  <InlineDoc url={e['documentoUrl'] as string | null} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}