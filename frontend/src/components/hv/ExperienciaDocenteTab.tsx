import { useState } from 'react';
import Alert from '../shared/Alert';
import ConfirmModal from '../shared/ConfirmModal';
import FormField from '../shared/FormField';
import FileUpload from '../shared/FileUpload';
import { hvApi } from '../../services/api';
import { getApiError } from '../../utils/apiError';

interface Item {
  id: string; institucion: string; nivelAcademico: string; fechaIngreso: string;
  trabajoActual: boolean; materiaImpartida?: string;
  verificado?: boolean; verificadoEn?: string; documentoUrl?: string;
}
interface Props { items: Record<string, unknown>[]; onSaved: () => void; }

const emptyForm = {
  tipoInstitucion: 'PUBLICA', institucion: '', pais: 'COLOMBIA',
  departamento: '', municipio: '', nivelAcademico: 'PREGRADO',
  tipoZona: 'URBANA', direccion: '', trabajoActual: false,
  fechaIngreso: '', fechaRetiro: '', motivoRetiro: '',
  jornadaLaboral: 'TIEMPO_COMPLETO', telefono: '', materiaImpartida: '',
  documentoUrl: '',
};

export default function ExperienciaDocenteTab({ items, onSaved }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditId(item['id'] as string);
    setForm({
      tipoInstitucion: (item['tipoInstitucion'] as string) ?? 'PUBLICA',
      institucion:     (item['institucion']     as string) ?? '',
      pais:            (item['pais']            as string) ?? 'COLOMBIA',
      departamento:    (item['departamento']    as string) ?? '',
      municipio:       (item['municipio']       as string) ?? '',
      nivelAcademico:  (item['nivelAcademico']  as string) ?? 'PREGRADO',
      tipoZona:        (item['tipoZona']        as string) ?? 'URBANA',
      direccion:       (item['direccion']       as string) ?? '',
      trabajoActual:   Boolean(item['trabajoActual']),
      fechaIngreso:    ((item['fechaIngreso']   as string) ?? '').slice(0, 10),
      fechaRetiro:     ((item['fechaRetiro']    as string) ?? '').slice(0, 10),
      motivoRetiro:    (item['motivoRetiro']    as string) ?? '',
      jornadaLaboral:  (item['jornadaLaboral']  as string) ?? 'TIEMPO_COMPLETO',
      telefono:        (item['telefono']        as string) ?? '',
      materiaImpartida:(item['materiaImpartida']as string) ?? '',
      documentoUrl:    (item['documentoUrl']    as string) ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        fechaRetiro:      form.trabajoActual ? undefined : (form.fechaRetiro || undefined),
        telefono:         form.telefono         || undefined,
        materiaImpartida: form.materiaImpartida || undefined,
        documentoUrl:     form.documentoUrl     || undefined,
      };
      if (editId) await hvApi.updateDocente(editId, payload);
      else        await hvApi.createDocente(payload);
      setSuccess('Experiencia docente guardada. Pendiente de validación por el JTH.');
      resetForm(); onSaved();
    } catch (err) { setError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setDeleting(true);
    try { await hvApi.deleteDocente(deleteId); setSuccess('Registro eliminado'); setDeleteId(null); onSaved(); }
    catch (err) { setError(getApiError(err)); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      {error   && <div className="mb-3"><Alert type="error"   message={error}   onClose={() => setError('')}   /></div>}
      {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title mb-0 border-0 pb-0">Experiencia Laboral Docente</h3>
        <button className="btn-primary text-xs" onClick={() => { resetForm(); setShowForm(true); }}>+ Agregar</button>
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto mb-5 rounded border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['Institución','Nivel','Materia','Ingreso','Estado','Soporte','Validación','Acciones'].map(h =>
                  <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(items as unknown as Item[]).map(item => (
                <tr key={item.id} className="table-row">
                  <td className="px-3 py-2">{item.institucion}</td>
                  <td className="px-3 py-2 text-neutral-500">{item.nivelAcademico}</td>
                  <td className="px-3 py-2 text-neutral-500">{item.materiaImpartida ?? '—'}</td>
                  <td className="px-3 py-2 text-neutral-500">{new Date(item.fechaIngreso).toLocaleDateString('es-CO')}</td>
                  <td className="px-3 py-2">{item.trabajoActual ? <span className="badge-active">Actual</span> : <span className="badge-inactive">Finalizado</span>}</td>
                  <td className="px-3 py-2">{item.documentoUrl ? <span className="text-green-600 text-xs">✓ Adjunto</span> : <span className="text-neutral-300 text-xs">—</span>}</td>
                  <td className="px-3 py-2">
                    {item.verificado
                      ? <span className="badge-active">✓ Validado{item.verificadoEn ? ` ${new Date(item.verificadoEn).toLocaleDateString('es-CO')}` : ''}</span>
                      : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Pendiente JTH</span>}
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    {!item.verificado && <button onClick={() => handleEdit(item as unknown as Record<string, unknown>)} className="text-xs text-primary-600 hover:underline">Editar</button>}
                    {!item.verificado && <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>}
                    {item.verificado  && <span className="text-xs text-neutral-400 italic">Bloqueado</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
          <h4 className="text-sm font-semibold text-primary-700 mb-4">{editId ? 'Editar' : 'Agregar'} Experiencia Docente</h4>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Tipo de Institución" required>
              <select value={form.tipoInstitucion} onChange={e => setForm(f => ({ ...f, tipoInstitucion: e.target.value }))} className="input-field">
                <option value="PUBLICA">Pública</option><option value="PRIVADA">Privada</option><option value="MIXTA">Mixta</option>
              </select>
            </FormField>
            <FormField label="Institución Educativa" required>
              <input type="text" value={form.institucion} onChange={e => setForm(f => ({ ...f, institucion: e.target.value }))} className="input-field" required />
            </FormField>
            <FormField label="Nivel Académico" required>
              <select value={form.nivelAcademico} onChange={e => setForm(f => ({ ...f, nivelAcademico: e.target.value }))} className="input-field">
                {['BACHILLERATO','TECNICO','TECNOLOGO','PREGRADO','POSTGRADO','MAESTRIA','DOCTORADO'].map(n =>
                  <option key={n} value={n}>{n}</option>)}
              </select>
            </FormField>
            <FormField label="País">
              <input type="text" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Departamento">
              <input type="text" value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Municipio">
              <input type="text" value={form.municipio} onChange={e => setForm(f => ({ ...f, municipio: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Tipo de Zona">
              <select value={form.tipoZona} onChange={e => setForm(f => ({ ...f, tipoZona: e.target.value }))} className="input-field">
                <option value="URBANA">Urbana</option><option value="RURAL">Rural</option>
              </select>
            </FormField>
            <FormField label="Dirección">
              <input type="text" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Teléfono">
              <input type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Materia Impartida">
              <input type="text" value={form.materiaImpartida} onChange={e => setForm(f => ({ ...f, materiaImpartida: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Jornada Laboral">
              <select value={form.jornadaLaboral} onChange={e => setForm(f => ({ ...f, jornadaLaboral: e.target.value }))} className="input-field">
                <option value="TIEMPO_COMPLETO">Tiempo Completo</option><option value="MEDIO_TIEMPO">Medio Tiempo</option><option value="HORAS">Por Horas</option>
              </select>
            </FormField>
            <FormField label="Fecha de Ingreso" required>
              <input type="date" value={form.fechaIngreso} onChange={e => setForm(f => ({ ...f, fechaIngreso: e.target.value }))} className="input-field" required />
            </FormField>
            {!form.trabajoActual && <>
              <FormField label="Fecha de Retiro">
                <input type="date" value={form.fechaRetiro} onChange={e => setForm(f => ({ ...f, fechaRetiro: e.target.value }))} className="input-field" />
              </FormField>
              <FormField label="Motivo de Retiro">
                <input type="text" value={form.motivoRetiro} onChange={e => setForm(f => ({ ...f, motivoRetiro: e.target.value }))} className="input-field" />
              </FormField>
            </>}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input type="checkbox" checked={form.trabajoActual} onChange={e => setForm(f => ({ ...f, trabajoActual: e.target.checked }))} className="rounded" />
                Trabajo actual
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <FormField label="Certificado docente — PDF, JPG o PNG · máx. 2 MB">
                <FileUpload currentUrl={form.documentoUrl || null} onUploaded={url => setForm(f => ({ ...f, documentoUrl: url }))} accept=".pdf,.jpg,.jpeg,.png" maxMB={2} label="Adjuntar certificado" />
              </FormField>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary text-xs">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      {deleteId && <ConfirmModal title="Eliminar Experiencia Docente" message="¿Está seguro de eliminar este registro?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />}
    </div>
  );
}