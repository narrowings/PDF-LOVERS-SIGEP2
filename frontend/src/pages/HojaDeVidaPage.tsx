import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';
import DatosPersonalesTab from '../components/hv/DatosPersonalesTab';
import FormacionAcademicaTab from '../components/hv/FormacionAcademicaTab';
import ExperienciaLaboralTab from '../components/hv/ExperienciaLaboralTab';
import ExperienciaDocenteTab from '../components/hv/ExperienciaDocenteTab';
import { hvApi } from '../services/api';
import { getApiError } from '../utils/apiError';

const TABS = [
  { id: 'personal',    label: 'Datos Personales' },
  { id: 'educacion',   label: 'Educación' },
  { id: 'experiencia', label: 'Experiencia Laboral' },
  { id: 'docente',     label: 'Exp. Docente' },
];

export interface HojaDeVidaData {
  id?: string;
  primerNombre?: string; segundoNombre?: string;
  primerApellido?: string; segundoApellido?: string;
  fechaNacimiento?: string; genero?: string;
  esPersonaExpPolit?: boolean;
  datosDemograficos?: Record<string, unknown>;
  datosContacto?: Record<string, unknown>;
  formacionAcademica?: unknown[];
  experienciaLaboral?: unknown[];
  experienciaDocente?: unknown[];
}

// ── HU-015: PDF via html2canvas + jsPDF (loaded dynamically) ─────────────────
async function generarPDF(data: HojaDeVidaData, accion: 'imprimir' | 'descargar') {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const dd = data.datosDemograficos as Record<string, unknown> | undefined;
  const dc = data.datosContacto as Record<string, unknown> | undefined;
  const fa = (data.formacionAcademica ?? []) as Record<string, unknown>[];
  const el = (data.experienciaLaboral ?? []) as Record<string, unknown>[];
  const ed = (data.experienciaDocente ?? []) as Record<string, unknown>[];
  const fullName = [data.primerNombre, data.segundoNombre, data.primerApellido, data.segundoApellido].filter(Boolean).join(' ');

  // Build a hidden div with print-ready HTML
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff;padding:32px;box-sizing:border-box;';

  const section = (title: string, rows: [string, string][]) => `
    <div style="margin-top:18px;">
      <h3 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1e3a6e;
          border-bottom:1.5px solid #1e3a6e;padding-bottom:3px;margin:0 0 8px;">${title}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        ${rows.map(([l, v]) => `<tr>
          <td style="padding:3px 10px 3px 0;color:#6b7280;white-space:nowrap;min-width:150px;">${l}</td>
          <td style="padding:3px 0;color:#111;font-weight:500;">${v || '—'}</td>
        </tr>`).join('')}
      </table>
    </div>`;

  const tableSection = (title: string, headers: string[], rows: string[][]) => `
    <div style="margin-top:18px;">
      <h3 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#1e3a6e;
          border-bottom:1.5px solid #1e3a6e;padding-bottom:3px;margin:0 0 8px;">${title}</h3>
      ${rows.length === 0 ? '<p style="font-size:11px;color:#9ca3af;">Sin registros.</p>' : `
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <thead><tr style="background:#1e3a6e;color:#fff;">
          ${headers.map(h => `<th style="padding:4px 6px;text-align:left;font-weight:600;">${h}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${rows.map((r, i) => `<tr style="background:${i%2===0?'#f9fafb':'#fff'};">
            ${r.map(c => `<td style="padding:4px 6px;">${c}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>`}
    </div>`;

  const fmt = (d: unknown) => d ? new Date(d as string).toLocaleDateString('es-CO') : '—';

  container.innerHTML = `
    <div style="text-align:center;border-bottom:2px solid #1e3a6e;padding-bottom:12px;margin-bottom:4px;">
      <h1 style="font-size:15px;font-weight:700;color:#1e3a6e;text-transform:uppercase;margin:0;">
        Hoja de Vida del Servidor Público</h1>
      <p style="font-size:10px;color:#6b7280;margin:4px 0 0;">SIGEP II · ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
    ${section('I. Datos Personales', [
      ['Nombre completo', fullName],
      ['Fecha nacimiento', fmt(data.fechaNacimiento)],
      ['Género', String(data.genero ?? '')],
      ['Departamento', String(dd?.departamento ?? '')],
      ['Municipio', String(dd?.municipio ?? '')],
      ['Tipo de zona', String(dd?.tipoZona ?? '')],
      ['Dirección', String(dd?.direccion ?? '')],
      ['Teléfono celular', String(dc?.telefonoCelular ?? '')],
      ['Correo personal', String(dc?.correoPersonal ?? '')],
      ['Persona Exp. Políticamente', data.esPersonaExpPolit ? 'Sí' : 'No'],
    ])}
    ${tableSection('II. Formación Académica',
      ['Institución','Título','Nivel','Estado','Fecha Grado','Validado'],
      fa.map(f => [String(f['institucion']),String(f['tituloObtenido']),String(f['nivelAcademico']),String(f['estadoEstudio']),fmt(f['fechaGrado']),f['verificadoEdFormal']?'✓':'Pendiente'])
    )}
    ${tableSection('III. Experiencia Laboral',
      ['Entidad','Cargo','Tipo','Ingreso','Retiro','Validado'],
      el.map(e => [String(e['nombreEntidad']),String(e['cargo']),String(e['tipoInstitucion']),fmt(e['fechaIngreso']),e['trabajoActual']?'Actual':fmt(e['fechaRetiro']),e['verificado']?'✓':'Pendiente'])
    )}
    ${tableSection('IV. Experiencia Docente',
      ['Institución','Nivel','Materia','Ingreso','Validado'],
      ed.map(e => [String(e['institucion']),String(e['nivelAcademico']),String(e['materiaImpartida']??''),fmt(e['fechaIngreso']),e['verificado']?'✓':'Pendiente'])
    )}
    <div style="margin-top:28px;border-top:1px solid #d1d5db;padding-top:10px;text-align:center;font-size:10px;color:#9ca3af;">
      Documento generado electrónicamente — SIGEP II · Departamento Administrativo de la Función Pública
    </div>`;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let y = 0;
  while (y < imgH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -y, imgW, imgH);
    y += pageH;
  }

  if (accion === 'descargar') {
    pdf.save('hoja-de-vida.pdf');
  } else {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) { win.focus(); setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 800); }
  }
}

export default function HojaDeVidaPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [data, setData] = useState<HojaDeVidaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hvApi.getHojaDeVida();
      setData(res.data as HojaDeVidaData);
    } catch (err) {
      const msg = getApiError(err);
      if (!msg.includes('no encontrado')) setError(msg);
      setData({});
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const onSaved = () => { void cargar(); };

  const handlePDF = async (accion: 'imprimir' | 'descargar') => {
    if (!data) return;
    setGenerating(true);
    try { await generarPDF(data, accion); }
    catch { setError('No se pudo generar el PDF. Intente de nuevo.'); }
    finally { setGenerating(false); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-primary-700">Mi Hoja de Vida</h1>
        {data && !loading && (
          <div className="flex gap-2">
            <button onClick={() => handlePDF('imprimir')} disabled={generating}
              className="btn-secondary text-xs flex items-center gap-1">
              🖨 {generating ? '...' : 'Imprimir'}
            </button>
            <button onClick={() => handlePDF('descargar')} disabled={generating}
              className="btn-primary text-xs flex items-center gap-1">
              ⬇ {generating ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-400 mb-5">
        Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
      </p>

      {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

      <div className="flex gap-1 mb-5 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-medium px-4 py-2 rounded whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="card p-5">
          {activeTab === 'personal'    && <DatosPersonalesTab data={data ?? {}} onSaved={onSaved} />}
          {activeTab === 'educacion'   && <FormacionAcademicaTab items={(data?.formacionAcademica ?? []) as Record<string, unknown>[]} onSaved={onSaved} />}
          {activeTab === 'experiencia' && <ExperienciaLaboralTab items={(data?.experienciaLaboral ?? []) as Record<string, unknown>[]} onSaved={onSaved} />}
          {activeTab === 'docente'     && <ExperienciaDocenteTab items={(data?.experienciaDocente ?? []) as Record<string, unknown>[]} onSaved={onSaved} />}
        </div>
      )}
    </Layout>
  );
}
