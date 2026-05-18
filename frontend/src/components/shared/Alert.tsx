interface Props {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const styles = {
  error:   'bg-red-50 border-red-300 text-red-700',
  success: 'bg-green-50 border-green-300 text-green-700',
  warning: 'bg-amber-50 border-amber-300 text-amber-700',
  info:    'bg-blue-50 border-blue-300 text-blue-700',
};

export default function Alert({ type, message, onClose }: Props) {
  return (
    <div className={`flex items-start gap-2 border rounded px-3 py-2.5 text-sm ${styles[type]}`} role="alert">
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 font-bold opacity-60 hover:opacity-100" aria-label="Cerrar">
          ×
        </button>
      )}
    </div>
  );
}
