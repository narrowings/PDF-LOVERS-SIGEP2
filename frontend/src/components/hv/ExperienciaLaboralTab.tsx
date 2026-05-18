import { useState } from 'react';
import Alert from '../shared/Alert';
import ConfirmModal from '../shared/ConfirmModal';
import FormField from '../shared/FormField';
import FileUpload from '../shared/FileUpload';
import DocumentPreviewModal from '../shared/DocumentPreviewModal';
import { hvApi } from '../../services/api';
import { getApiError } from '../../utils/apiError';

interface Item {
  id: string;
  nombreEntidad: string;
  cargo: string;
  tipoInstitucion: string;
  fechaIngreso: string;
  fechaRetiro?: string;
  trabajoActual: boolean;
  documentoUrl?: string;
}
interface Props { items: Record<string, unknown>[]; onSaved: () => void; }

const emptyForm = {
  tipoInstitucion: 'PUBLICA', nombreEntidad: '', pais: 'COLOMBIA',
  departamento: '', municipio: '', tipoZona: 'URBANA', direccion: '',
  cargo: '', areaConocimiento: '', funcionesCargo: '',
  trabajoActual: false, fechaIngreso: '', fechaRetiro: '',
  motivoRetiro: '', jornadaLaboral: 'TIEMPO_COMPLETO', horasMes: '',
  documentoUrl: '',
};

export default function ExperienciaLaboralTab({ items, onSaved }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditId(item['id'] as string);
    setForm({
      tipoInstitucion: (item['tipoInstitucion'] as string) ?? 'PUBLICA',
      nombreEntidad: (item['nombreEntidad'] as string) ?? '',
      pais: (item['pais'] as string) ?? 'COLOMBIA',
      departamento: (item['departamento'] as string) ?? '',
      municipio: (item['municipio'] as string) ?? '',
      tipoZona: (item['tipoZona'] as string) ?? 'URBANA',
      direccion: (item['direccion'] as string) ?? '',
      cargo: (item['cargo'] as string) ?? '',
      areaConocimiento: (item['areaConocimiento'] as string) ?? '',
      funcionesCargo: (item['funcionesCargo'] as string) ?? '',
      trabajoActual: Boolean(item['trabajoActual']),
      fechaIngreso: ((item['fechaIngreso'] as string) ?? '').slice(0, 10),
      fechaRetiro: ((item['fechaRetiro'] as string) ?? '').slice(0, 10),
      motivoRetiro: (item['motivoRetiro'] as string) ?? '',
      jornadaLaboral: (item['jornadaLaboral'] as string) ?? 'TIEMPO_COMPLETO',
      horasMes: String(item['horasMes'] ?? ''),
      documentoUrl: (item['documentoUrl'] as string) ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        horasMes: form.horasMes ? parseInt(form.horasMes) : undefined,
        fechaRetiro: form.trabajoActual ? undefined : (form.fechaRetiro || undefined),
        documentoUrl: form.documentoUrl || undefined,
      };
      if (editId) await hvApi.updateExperiencia(editId, payload);
      else await hvApi.createExperiencia(payload);
      setSuccess('Experiencia guardada');
      resetForm(); onSaved();
    } catch (err) { setError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await hvApi.deleteExperiencia(deleteId);
      setSuccess('Registro eliminado');
      setDeleteId(null); onSaved();
    } catch (err) { setError(getApiError(err)); }
    finally { setDeleting(false); }
  };

  const handlePreview = (item: Item) => {
    if (item.documentoUrl) {
      setPreviewTitle(`${item.cargo} — ${item.nombreEntidad}`);
      setPreviewUrl(item.documentoUrl);
    }
  };

  return (
    <div>
      {error && <div className="mb-3"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title mb-0 border-0 pb-0">Experiencia Laboral</h3>
        <button className="btn-primary text-xs" onClick={() => { resetForm(); setShowForm(true); }}>+ Agregar Nuevo</button>
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto mb-5 rounded border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-2 text-left font-medium">Entidad</th>
                <th className="px-3 py-2 text-left font-medium">Cargo</th>
                <th className="px-3 py-2 text-left font-medium">Tipo</th>
                <th className="px-3 py-2 text-left font-medium">Ingreso</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Doc.</th>
                <th className="px-3 py-2 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(items as unknown as Item[]).map(item => (
                <tr key={item.id} className="table-row">
                  <td className="px-3 py-2">{item.nombreEntidad}</td>
                  <td className="px-3 py-2">{item.cargo}</td>
                  <td className="px-3 py-2 text-neutral-500">{item.tipoInstitucion}</td>
                  <td className="px-3 py-2 text-neutral-500">{new Date(item.fechaIngreso).toLocaleDateString('es-CO')}</td>
                  <td className="px-3 py-2">
                    {item.trabajoActual ? <span className="badge-active">Actual</span> : <span className="badge-inactive">Retirado</span>}
                  </td>
                  <td className="px-3 py-2">
                    {item.documentoUrl ? (
                      <button
                        onClick={() => handlePreview(item)}
                        className="text-primary-600 hover:text-primary-800 text-base"
                        title="Ver documento"
                      >
                        👁
                      </button>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <button onClick={() => handleEdit(item as unknown as Record<string, unknown>)} className="text-xs text-primary-600 hover:underline">Editar</button>
                    <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
          <h4 className="text-sm font-semibold text-primary-700 mb-4">{editId ? 'Editar' : 'Agregar'} Experiencia Laboral</h4>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Tipo de Institución" required>
              <select value={form.tipoInstitucion} onChange={e => setForm(f => ({ ...f, tipoInstitucion: e.target.value }))} className="input-field">
                <option value="PUBLICA">Pública</option>
                <option value="PRIVADA">Privada</option>
                <option value="MIXTA">Mixta</option>
              </select>
            </FormField>
            <FormField label="Nombre de la Entidad" required>
              <input type="text" value={form.nombreEntidad} onChange={e => setForm(f => ({ ...f, nombreEntidad: e.target.value }))} className="input-field" required />
            </FormField>
            <FormField label="Cargo" required>
              <input type="text" value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} className="input-field" required />
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
                <option value="URBANA">Urbana</option>
                <option value="RURAL">Rural</option>
              </select>
            </FormField>
            <FormField label="Dirección">
              <input type="text" value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Jornada Laboral">
              <select value={form.jornadaLaboral} onChange={e => setForm(f => ({ ...f, jornadaLaboral: e.target.value }))} className="input-field">
                <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                <option value="MEDIO_TIEMPO">Medio Tiempo</option>
                <option value="HORAS">Por Horas</option>
              </select>
            </FormField>
            <FormField label="Fecha de Ingreso" required>
              <input type="date" value={form.fechaIngreso} onChange={e => setForm(f => ({ ...f, fechaIngreso: e.target.value }))} className="input-field" required />
            </FormField>
            {!form.trabajoActual && (
              <>
                <FormField label="Fecha de Retiro">
                  <input type="date" value={form.fechaRetiro} onChange={e => setForm(f => ({ ...f, fechaRetiro: e.target.value }))} className="input-field" />
                </FormField>
                <FormField label="Motivo de Retiro">
                  <input type="text" value={form.motivoRetiro} onChange={e => setForm(f => ({ ...f, motivoRetiro: e.target.value }))} className="input-field" />
                </FormField>
              </>
            )}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input type="checkbox" checked={form.trabajoActual} onChange={e => setForm(f => ({ ...f, trabajoActual: e.target.checked }))} className="rounded" />
                Trabajo actual
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <FormField label="Funciones del Cargo">
                <textarea rows={3} value={form.funcionesCargo} onChange={e => setForm(f => ({ ...f, funcionesCargo: e.target.value }))} className="input-field resize-none" />
              </FormField>
            </div>
            {/* HU-013: Document attachment */}
            <div className="sm:col-span-2 lg:col-span-3">
              <FormField label="Certificado laboral (PDF/JPG · máx. 2 MB)">
                <FileUpload
                  currentUrl={form.documentoUrl || null}
                  onUploaded={(url) => setForm(f => ({ ...f, documentoUrl: url }))}
                  accept=".pdf,.jpg,.jpeg"
                  maxMB={2}
                  label="Seleccionar certificado"
                />
              </FormField>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary text-xs">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title="Eliminar Experiencia"
          message="¿Está seguro de eliminar este registro de experiencia laboral?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}

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