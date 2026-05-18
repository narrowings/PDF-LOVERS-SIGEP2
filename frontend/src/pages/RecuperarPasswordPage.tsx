import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../services/api';
import Alert from '../components/shared/Alert';
import FormField from '../components/shared/FormField';
import { getApiError } from '../utils/apiError';

const schema = z.object({
  tipoDocumento: z.string().min(1),
  numeroDocumento: z.string().min(4),
});
type FormData = z.infer<typeof schema>;

const TIPOS_DOC = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TARJETA_IDENTIDAD', label: 'Tarjeta de Identidad' },
];

export default function RecuperarPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoDocumento: 'CEDULA_CIUDADANIA' },
  });

  const onSubmit = async (data: FormData) => {
    setError(''); setMessage('');
    try {
      const res = await authApi.recuperarPassword(data);
      setMessage((res.data as { message: string }).message);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-primary-800 flex flex-col">
      <div className="bg-primary-900 px-6 py-3 flex items-center gap-3">
        <span className="font-bold text-xl text-white">sigep<span className="text-accent-400">II</span></span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-primary-700 font-semibold text-lg mb-1 text-center">Recuperar Contraseña</h2>
          <p className="text-neutral-400 text-xs text-center mb-6">
            Ingrese su tipo y número de documento para recibir instrucciones en su correo registrado.
          </p>
          {message && <div className="mb-4"><Alert type="success" message={message} /></div>}
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Tipo de Documento" required htmlFor="tipodoc" error={errors.tipoDocumento?.message}>
              <select id="tipodoc" {...register('tipoDocumento')} className="input-field">
                {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Número de Identificación" required htmlFor="numdoc" error={errors.numeroDocumento?.message}>
              <input
                id="numdoc" type="text" inputMode="numeric"
                placeholder="Número de documento"
                {...register('numeroDocumento')} className="input-field"
              />
            </FormField>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-primary-600 hover:underline">← Volver al inicio de sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
