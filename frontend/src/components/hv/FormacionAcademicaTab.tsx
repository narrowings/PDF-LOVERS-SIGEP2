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
  nivelAcademico: string;
  tituloObtenido: string;
  institucion: string;
  estadoEstudio: string;
  fechaGrado?: string;
  verificadoEdFormal?: boolean;
  documentoUrl?: string;
}
interface Props { items: Record<string, unknown>[]; onSaved: () => void; }

const emptyForm = {
  nivelAcademico: 'PREGRADO', nivelFormacion: '', areaConocimiento: '', pais: 'COLOMBIA',
  institucion: '', programaAcademico: '', tituloObtenido: '',
  semestresAprobados: '', estadoEstudio: 'FINALIZADO',
  fechaTerminacion: '', fechaGrado: '', estudiosExterior: false,
  documentoUrl: '',
};

export default function FormacionAcademicaTab({ items, onSaved }: Props) {
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
      nivelAcademico: (item['nivelAcademico'] as string) ?? 'PREGRADO',
      nivelFormacion: (item['nivelFormacion'] as string) ?? '',
      areaConocimiento: (item['areaConocimiento'] as string) ?? '',
      pais: (item['pais'] as string) ?? 'COLOMBIA',
      institucion: (item['institucion'] as string) ?? '',
      programaAcademico: (item['programaAcademico'] as string) ?? '',
      tituloObtenido: (item['tituloObtenido'] as string) ?? '',
      semestresAprobados: String(item['semestresAprobados'] ?? ''),
      estadoEstudio: (item['estadoEstudio'] as string) ?? 'FINALIZADO',
      fechaTerminacion: ((item['fechaTerminacion'] as string) ?? '').slice(0, 10),
      fechaGrado: ((item['fechaGrado'] as string) ?? '').slice(0, 10),
      estudiosExterior: Boolean(item['estudiosExterior']),
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
        semestresAprobados: form.semestresAprobados ? parseInt(form.semestresAprobados) : undefined,
        fechaTerminacion: form.fechaTerminacion || undefined,
        fechaGrado: form.fechaGrado || undefined,
        documentoUrl: form.documentoUrl || undefined,
      };
      if (editId) await hvApi.updateFormacion(editId, payload);
      else await hvApi.createFormacion(payload);
      setSuccess('Formación académica guardada');
      resetForm(); onSaved();
    } catch (err) { setError(getApiError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await hvApi.deleteFormacion(deleteId);
      setSuccess('Registro eliminado');
      setDeleteId(null); onSaved();
    } catch (err) { setError(getApiError(err)); }
    finally { setDeleting(false); }
  };

  const handlePreview = (item: Item) => {
    if (item.documentoUrl) {
      setPreviewTitle(`${item.tituloObtenido} — ${item.institucion}`);
      setPreviewUrl(item.documentoUrl);
    }
  };

  return (
    <div>
      {error && <div className="mb-3"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
      {success && <div className="mb-3"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title mb-0 border-0 pb-0">Formación Académica</h3>
        <button className="btn-primary text-xs" onClick={() => { resetForm(); setShowForm(true); }}>
          + Agregar Nuevo
        </button>
      </div>

      {/* Tabla */}
      {items.length > 0 && (
        <div className="overflow-x-auto mb-5 rounded border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-3 py-2 text-left font-medium">Institución</th>
                <th className="px-3 py-2 text-left font-medium">Título</th>
                <th className="px-3 py-2 text-left font-medium">Nivel</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Doc.</th>
                <th className="px-3 py-2 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(items as unknown as Item[]).map(item => (
                <tr key={item.id} className="table-row">
                  <td className="px-3 py-2">{item.institucion}</td>
                  <td className="px-3 py-2">{item.tituloObtenido}</td>
                  <td className="px-3 py-2 text-neutral-500">{item.nivelAcademico}</td>
                  <td className="px-3 py-2">
                    <span className={item.estadoEstudio === 'FINALIZADO' ? 'badge-active' : 'badge-inactive'}>
                      {item.estadoEstudio === 'FINALIZADO' ? 'Finalizado' : 'En Proceso'}
                    </span>
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
                      <span className="text-neutral-300 text-base">—</span>
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

      {/* Form */}
      {showForm && (
        <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50">
          <h4 className="text-sm font-semibold text-primary-700 mb-4">{editId ? 'Editar' : 'Agregar'} Formación Académica</h4>
          <form onSubmit={handleSave} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField label="Nivel Académico" required>
              <select value={form.nivelAcademico} onChange={e => setForm(f => ({ ...f, nivelAcademico: e.target.value }))} className="input-field">
                {['BACHILLERATO','TECNICO','TECNOLOGO','PREGRADO','POSTGRADO','MAESTRIA','DOCTORADO','POSTDOCTORADO'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </FormField>
            <FormField label="Institución" required>
              <input type="text" value={form.institucion} onChange={e => setForm(f => ({ ...f, institucion: e.target.value }))} className="input-field" required />
            </FormField>
            <FormField label="Título Obtenido" required>
              <input type="text" value={form.tituloObtenido} onChange={e => setForm(f => ({ ...f, tituloObtenido: e.target.value }))} className="input-field" required />
            </FormField>
            <FormField label="Programa Académico">
              <input type="text" value={form.programaAcademico} onChange={e => setForm(f => ({ ...f, programaAcademico: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Área de Conocimiento">
              <input type="text" value={form.areaConocimiento} onChange={e => setForm(f => ({ ...f, areaConocimiento: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="País">
              <input type="text" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Estado del Estudio" required>
              <select value={form.estadoEstudio} onChange={e => setForm(f => ({ ...f, estadoEstudio: e.target.value }))} className="input-field">
                <option value="FINALIZADO">Finalizado</option>
                <option value="EN_PROCESO">En Proceso</option>
              </select>
            </FormField>
            <FormField label="Fecha Terminación Materias">
              <input type="date" value={form.fechaTerminacion} onChange={e => setForm(f => ({ ...f, fechaTerminacion: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Fecha de Grado">
              <input type="date" value={form.fechaGrado} onChange={e => setForm(f => ({ ...f, fechaGrado: e.target.value }))} className="input-field" />
            </FormField>
            <FormField label="Semestres Aprobados">
              <input type="number" min={0} max={20} value={form.semestresAprobados} onChange={e => setForm(f => ({ ...f, semestresAprobados: e.target.value }))} className="input-field" />
            </FormField>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer mt-5">
                <input type="checkbox" checked={form.estudiosExterior} onChange={e => setForm(f => ({ ...f, estudiosExterior: e.target.checked }))} className="rounded" />
                Estudios en el exterior
              </label>
            </div>
            {/* HU-013: Document attachment */}
            <div className="sm:col-span-2 lg:col-span-3">
              <FormField label="Documento de soporte (PDF/JPG · máx. 2 MB)">
                <FileUpload
                  currentUrl={form.documentoUrl || null}
                  onUploaded={(url) => setForm(f => ({ ...f, documentoUrl: url }))}
                  accept=".pdf,.jpg,.jpeg"
                  maxMB={2}
                  label="Seleccionar archivo"
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
          title="Eliminar Formación"
          message="¿Está seguro de eliminar este registro de formación académica?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}

      {/* HU-014: Document preview modal */}
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