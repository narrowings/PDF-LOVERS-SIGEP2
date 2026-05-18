import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '../components/layout/Layout';
import Alert from '../components/shared/Alert';
import FormField from '../components/shared/FormField';
import { authApi } from '../services/api';
import { getApiError } from '../utils/apiError';

const schema = z.object({
  passwordActual: z.string().min(1, 'Ingrese su contraseña actual'),
  passwordNueva: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
    .regex(/\d/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
  passwordConfirmacion: z.string(),
}).refine(d => d.passwordNueva === d.passwordConfirmacion, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirmacion'],
});
type FormData = z.infer<typeof schema>;

export default function CambiarPasswordPage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(''); setSuccess('');
    try {
      const res = await authApi.cambiarPassword(data);
      setSuccess((res.data as { message: string }).message);
      reset();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <Layout>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-primary-700 mb-1">Cambiar Contraseña</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Use mínimo 6 caracteres con letras, números y al menos un carácter especial.
        </p>
        <div className="card p-6">
          {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Contraseña Actual" required htmlFor="passActual" error={errors.passwordActual?.message}>
              <input id="passActual" type="password" autoComplete="current-password"
                {...register('passwordActual')} className={`input-field ${errors.passwordActual ? 'input-error' : ''}`} />
            </FormField>
            <FormField label="Nueva Contraseña" required htmlFor="passNueva" error={errors.passwordNueva?.message}>
              <input id="passNueva" type="password" autoComplete="new-password"
                {...register('passwordNueva')} className={`input-field ${errors.passwordNueva ? 'input-error' : ''}`} />
            </FormField>
            <FormField label="Confirmar Nueva Contraseña" required htmlFor="passConf" error={errors.passwordConfirmacion?.message}>
              <input id="passConf" type="password" autoComplete="new-password"
                {...register('passwordConfirmacion')} className={`input-field ${errors.passwordConfirmacion ? 'input-error' : ''}`} />
            </FormField>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
