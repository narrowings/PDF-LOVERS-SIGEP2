interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card p-6 max-w-sm w-full mx-4 shadow-lg">
        <h3 className="font-semibold text-neutral-800 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary text-sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-danger text-sm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
