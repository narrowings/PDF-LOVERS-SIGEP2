interface Props {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function DocumentPreviewModal({ url, title = 'Documento', onClose }: Props) {
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png)$/i.test(url);
  // Build absolute URL for the file
  const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl flex flex-col w-full max-w-3xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-800 text-sm truncate">{title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={absoluteUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary-600 hover:underline"
            >
              Descargar
            </a>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-800 font-bold text-lg leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-2 bg-neutral-100 min-h-[400px]">
          {isPdf ? (
            <iframe
              src={absoluteUrl}
              title={title}
              className="w-full h-full min-h-[500px] rounded border border-neutral-200 bg-white"
            />
          ) : isImage ? (
            <img
              src={absoluteUrl}
              alt={title}
              className="max-w-full max-h-[600px] mx-auto block rounded shadow"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <span className="text-4xl">📄</span>
              <p className="text-sm text-neutral-600">Vista previa no disponible para este tipo de archivo.</p>
              <a
                href={absoluteUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm"
              >
                Abrir archivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}