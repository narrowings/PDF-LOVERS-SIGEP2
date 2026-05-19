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
  primerNombre?: string;  segundoNombre?: string;
  primerApellido?: string; segundoApellido?: string;
  fechaNacimiento?: string; genero?: string;
  tipoDocumento?: string; numeroDocumento?: string;
  esPersonaExpPolit?: boolean; documentoUrl?: string;
  datosDemograficos?: Record<string, unknown>;
  datosContacto?: Record<string, unknown>;
  formacionAcademica?: unknown[];
  experienciaLaboral?: unknown[];
  experienciaDocente?: unknown[];
}

async function generarPDF(data: HojaDeVidaData, accion: 'imprimir' | 'descargar') {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'), import('html2canvas'),
  ]);

  const dd = data.datosDemograficos as Record<string, unknown> | undefined;
  const dc = data.datosContacto    as Record<string, unknown> | undefined;
  const fa = (data.formacionAcademica ?? []) as Record<string, unknown>[];
  const el = (data.experienciaLaboral ?? []) as Record<string, unknown>[];
  const ed = (data.experienciaDocente ?? []) as Record<string, unknown>[];

  const fullName = [data.primerNombre, data.segundoNombre, data.primerApellido, data.segundoApellido]
    .filter(Boolean).join(' ');
  const fmt = (v: unknown) => v ? new Date(v as string).toLocaleDateString('es-CO') : '—';
  const val = (v: unknown) => String(v ?? '—');

  const infoTable = (rows: [string, string][]) =>
    `<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:4px;">
      ${rows.map(([l, v]) => `<tr>
        <td style="padding:3px 10px 3px 0;color:#6b7280;white-space:nowrap;min-width:170px;vertical-align:top;">${l}</td>
        <td style="padding:3px 0;color:#111827;font-weight:500;">${v}</td>
      </tr>`).join('')}
    </table>`;

  const dataTable = (headers: string[], rows: string[][]) =>
    rows.length === 0
      ? '<p style="font-size:11px;color:#9ca3af;margin:0;">Sin registros.</p>'
      : `<table style="width:100%;border-collapse:collapse;font-size:10px;">
          <thead><tr style="background:#1e3a6e;color:#fff;">
            ${headers.map(h => `<th style="padding:4px 6px;text-align:left;">${h}</th>`).join('')}
          </tr></thead>
          <tbody>${rows.map((r, i) =>
            `<tr style="background:${i%2===0?'#f9fafb':'#fff'};">
              ${r.map(c => `<td style="padding:4px 6px;vertical-align:top;">${c}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>`;

  const section = (title: string, content: string) =>
    `<div style="margin-top:18px;">
      <h3 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
        color:#1e3a6e;border-bottom:1.5px solid #1e3a6e;padding-bottom:3px;margin:0 0 8px;">${title}</h3>
      ${content}
    </div>`;

  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;font-family:Arial,sans-serif;font-size:12px;color:#111827;background:#fff;padding:32px;box-sizing:border-box;';

  div.innerHTML = `
    <div style="text-align:center;border-bottom:2px solid #1e3a6e;padding-bottom:12px;margin-bottom:4px;">
      <h1 style="font-size:15px;font-weight:700;color:#1e3a6e;text-transform:uppercase;margin:0;">
        Hoja de Vida del Servidor Público</h1>
      <p style="font-size:10px;color:#6b7280;margin:4px 0 0;">
        SIGEP II · Generado: ${new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>

    ${section('I. Datos Personales', infoTable([
      ['Nombre completo',         fullName],
      ['Tipo de documento',       val(data.tipoDocumento)?.replace(/_/g,' ')],
      ['Número de identificación',val(data.numeroDocumento)],
      ['Fecha de nacimiento',     fmt(data.fechaNacimiento)],
      ['Género',                  val(data.genero)],
      ['Persona Exp. Políticamente', data.esPersonaExpPolit ? 'Sí' : 'No'],
      ['País',                    val(dd?.['pais']) || 'COLOMBIA'],
      ['Departamento',            val(dd?.['departamento'])],
      ['Municipio',               val(dd?.['municipio'])],
      ['Tipo de zona',            val(dd?.['tipoZona'])],
      ['Dirección',               val(dd?.['direccion'])],
      ['Complemento',             val(dd?.['complemento'])],
      ['Teléfono fijo',           val(dc?.['telefonoFijo'])],
      ['Teléfono celular',        val(dc?.['telefonoCelular'])],
      ['Correo personal',         val(dc?.['correoPersonal'])],
    ]))}

    ${section('II. Formación Académica', dataTable(
      ['Institución','Título','Nivel','Programa','Estado','Fecha Grado','País','Validado'],
      fa.map(f => [
        val(f['institucion']), val(f['tituloObtenido']), val(f['nivelAcademico']),
        val(f['programaAcademico']), val(f['estadoEstudio']), fmt(f['fechaGrado']),
        val(f['pais']), f['verificadoEdFormal'] ? '✓ Validado' : 'Pendiente JTH',
      ])
    ))}

    ${section('III. Experiencia Laboral', dataTable(
      ['Entidad','Cargo','Tipo','Jornada','Ingreso','Retiro','Municipio','Validado'],
      el.map(e => [
        val(e['nombreEntidad']), val(e['cargo']), val(e['tipoInstitucion']),
        val(e['jornadaLaboral']), fmt(e['fechaIngreso']),
        e['trabajoActual'] ? 'Actual' : fmt(e['fechaRetiro']),
        val(e['municipio']), e['verificado'] ? '✓ Validado' : 'Pendiente JTH',
      ])
    ))}

    ${section('IV. Experiencia Laboral Docente', dataTable(
      ['Institución','Nivel','Materia','Ingreso','Retiro','Validado'],
      ed.map(e => [
        val(e['institucion']), val(e['nivelAcademico']), val(e['materiaImpartida']),
        fmt(e['fechaIngreso']), e['trabajoActual'] ? 'Actual' : fmt(e['fechaRetiro']),
        e['verificado'] ? '✓ Validado' : 'Pendiente JTH',
      ])
    ))}

    <div style="margin-top:32px;border-top:1px solid #d1d5db;padding-top:10px;text-align:center;font-size:10px;color:#9ca3af;">
      Documento generado electrónicamente — SIGEP II · Departamento Administrativo de la Función Pública · Colombia
    </div>`;

  document.body.appendChild(div);
  const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  document.body.removeChild(div);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const iw = pw;
  const ih = (canvas.height * iw) / canvas.width;

  let y = 0;
  while (y < ih) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -y, iw, ih);
    y += ph;
  }

  if (accion === 'descargar') {
    pdf.save('hoja-de-vida.pdf');
  } else {
    const blob = pdf.output('blob');
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank');
    if (win) { win.focus(); setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 800); }
  }
}

export default function HojaDeVidaPage() {
  const [activeTab,   setActiveTab]  = useState('personal');
  const [data,        setData]       = useState<HojaDeVidaData | null>(null);
  const [loading,     setLoading]    = useState(true);
  const [generating,  setGenerating] = useState(false);
  const [error,       setError]      = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try { const r = await hvApi.getHojaDeVida(); setData(r.data as HojaDeVidaData); }
    catch (err) {
      const msg = getApiError(err);
      if (!msg.includes('no encontrado')) setError(msg);
      setData({});
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const handlePDF = async (accion: 'imprimir' | 'descargar') => {
    if (!data) return;
    setGenerating(true);
    try { await generarPDF(data, accion); }
    catch { setError('No se pudo generar el PDF. Verifique que jsPDF y html2canvas estén instalados.'); }
    finally { setGenerating(false); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-primary-700">Mi Hoja de Vida</h1>
        {data && !loading && (
          <div className="flex gap-2">
            <button onClick={() => handlePDF('imprimir')} disabled={generating}
              className="btn-secondary text-xs">
              🖨 {generating ? '...' : 'Imprimir'}
            </button>
            <button onClick={() => handlePDF('descargar')} disabled={generating}
              className="btn-primary text-xs">
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
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="card p-5">
          {activeTab === 'personal'    && <DatosPersonalesTab    data={data ?? {}} onSaved={() => void cargar()} />}
          {activeTab === 'educacion'   && <FormacionAcademicaTab items={(data?.formacionAcademica ?? []) as Record<string,unknown>[]} onSaved={() => void cargar()} />}
          {activeTab === 'experiencia' && <ExperienciaLaboralTab items={(data?.experienciaLaboral  ?? []) as Record<string,unknown>[]} onSaved={() => void cargar()} />}
          {activeTab === 'docente'     && <ExperienciaDocenteTab items={(data?.experienciaDocente  ?? []) as Record<string,unknown>[]} onSaved={() => void cargar()} />}
        </div>
      )}
    </Layout>
  );
}