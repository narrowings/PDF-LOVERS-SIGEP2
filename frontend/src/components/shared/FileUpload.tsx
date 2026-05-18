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
  accept = '.pdf,.jpg,.jpeg',
  maxMB = 2,
  label = 'Seleccionar archivo',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxMB * 1024 * 1024) {
      setError(`El archivo no debe superar ${maxMB} MB`);
      return;
    }

    const allowed = accept.split(',').map(a => a.trim().replace('.', ''));
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!allowed.includes(ext)) {
      setError(`Solo se permiten: ${accept}`);
      return;
    }

    setError('');
    setUploading(true);
    setFileName(file.name);

    try {
      const res = await uploadApi.uploadDocumento(file);
      onUploaded(res.data.url);
    } catch (err) {
      setError(getApiError(err));
      setFileName('');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const displayName = fileName || (currentUrl ? currentUrl.split('/').pop() : '');

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-xs py-1 px-3"
        >
          {uploading ? 'Subiendo...' : label}
        </button>

        {displayName && (
          <span className="text-xs text-neutral-500 truncate max-w-[200px]" title={displayName}>
            📎 {displayName}
          </span>
        )}

        {currentUrl && !uploading && (
          <button
            type="button"
            onClick={() => window.open(currentUrl, '_blank')}
            className="text-xs text-primary-600 hover:underline"
            title="Ver documento adjunto"
          >
            👁 Ver documento
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-neutral-400">Formatos: PDF, JPG · Máx. {maxMB} MB</p>
    </div>
  );
}