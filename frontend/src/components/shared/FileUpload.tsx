import { useRef, useState } from 'react';
import { uploadApi } from '../../services/api';
import { getApiError } from '../../utils/apiError';

interface Props {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  accept?: string;
  maxMB?: number;
  label?: string;
}

export default function FileUpload({
  currentUrl,
  onUploaded,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxMB = 2,
  label = 'Adjuntar documento',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const displayUrl = currentUrl ?? null;
  const fileName = displayUrl
    ? decodeURIComponent(displayUrl.split('/').pop()?.split('?')[0] ?? 'documento')
    : null;
  const isPdf = fileName?.toLowerCase().endsWith('.pdf');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxMB * 1024 * 1024) {
      setError(`El archivo no debe superar ${maxMB} MB`); return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!allowed.includes(ext)) {
      setError('Solo se permiten archivos PDF, JPG o PNG'); return;
    }

    setError('');
    setUploading(true);
    try {
      const res = await uploadApi.uploadDocumento(file);
      onUploaded(res.data.url);
      setPreviewOpen(false);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-xs py-1 px-3">
          {uploading ? 'Subiendo...' : label}
        </button>

        {displayUrl && (
          <>
            <span className="text-xs text-neutral-500 truncate max-w-[180px]" title={fileName ?? ''}>
              📎 {fileName}
            </span>
            <button type="button"
              onClick={() => setPreviewOpen(o => !o)}
              className="text-xs text-primary-600 hover:underline">
              {previewOpen ? 'Ocultar' : '👁 Ver documento'}
            </button>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-neutral-400">PDF, JPG o PNG · Máx. {maxMB} MB</p>

      {/* Inline preview — punto 7 */}
      {previewOpen && displayUrl && (
        <div className="mt-2 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
          {isPdf ? (
            <iframe
              src={displayUrl}
              title="Vista previa"
              className="w-full h-80"
              style={{ minHeight: 320 }}
            />
          ) : (
            <img
              src={displayUrl}
              alt="Vista previa"
              className="max-w-full max-h-80 mx-auto block object-contain p-2"
            />
          )}
          <div className="flex justify-end px-3 py-2 border-t border-neutral-100 gap-2">
            <a href={displayUrl} target="_blank" rel="noreferrer"
              className="text-xs text-primary-600 hover:underline">
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      )}
    </div>
  );
}