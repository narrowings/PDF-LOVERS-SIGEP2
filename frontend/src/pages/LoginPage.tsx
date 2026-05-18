import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/shared/Alert';
import FormField from '../components/shared/FormField';
import { getApiError } from '../utils/apiError';

const schema = z.object({
  tipoDocumento: z.string().min(1, 'Seleccione el tipo de documento'),
  numeroDocumento: z.string().min(4, 'Ingrese su número de documento'),
  password: z.string().min(1, 'Ingrese su contraseña'),
});
type FormData = z.infer<typeof schema>;

const TIPOS_DOC = [
  { value: 'CEDULA_CIUDADANIA', label: 'Cédula de Ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TARJETA_IDENTIDAD', label: 'Tarjeta de Identidad' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoDocumento: 'CEDULA_CIUDADANIA' },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data.tipoDocumento, data.numeroDocumento, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-primary-800 flex flex-col">
      {/* Header */}
      <div className="bg-primary-900 px-6 py-3 flex items-center gap-3">
        <span className="font-bold text-xl text-white">sigep<span className="text-accent-400">II</span></span>
        <div className="w-px h-5 bg-primary-600" />
        <span className="text-xs text-primary-300 uppercase tracking-widest font-medium">Función Pública</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Info panel */}
          <div className="hidden md:block text-white space-y-5">
            <h1 className="text-3xl font-semibold leading-tight">
              Sistema de Gestión de<br />
              <span className="text-accent-400">Empleo Público</span>
            </h1>
            <p className="text-primary-200 text-sm leading-relaxed">
              Gestione su hoja de vida como servidor público del Estado colombiano. Registre su
              formación académica, experiencia laboral y datos personales de forma segura.
            </p>
            <div className="space-y-2 text-sm text-primary-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />
                Hoja de vida unificada para todas las entidades
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />
                Información protegida y verificada
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />
                Acceso seguro con autenticación JWT
              </div>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-center text-primary-700 font-semibold text-lg mb-1">Iniciar Sesión</h2>
            <p className="text-center text-neutral-400 text-xs mb-6">Datos obligatorios *</p>

            {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <FormField label="Tipo de Documento" required htmlFor="tipoDocumento" error={errors.tipoDocumento?.message}>
                <select id="tipoDocumento" {...register('tipoDocumento')} className={`input-field ${errors.tipoDocumento ? 'input-error' : ''}`}>
                  {TIPOS_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </FormField>

              <FormField label="Número de Identificación" required htmlFor="numeroDocumento" error={errors.numeroDocumento?.message}>
                <input
                  id="numeroDocumento"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="Número de documento"
                  {...register('numeroDocumento')}
                  className={`input-field ${errors.numeroDocumento ? 'input-error' : ''}`}
                />
              </FormField>

              <FormField label="Contraseña" required htmlFor="password" error={errors.password?.message}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </FormField>

              <div className="text-right">
                <Link to="/recuperar-password" className="text-xs text-primary-600 hover:underline">
                  ¿Olvidó su contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-2"
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="bg-primary-900 text-primary-500 text-xs text-center py-3">
        Departamento Administrativo de la Función Pública · Colombia
      </footer>
    </div>
  );
}
