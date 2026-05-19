import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '../shared/FormField';
import Alert from '../shared/Alert';
import FileUpload from '../shared/FileUpload';
import { hvApi } from '../../services/api';
import { getApiError } from '../../utils/apiError';
import type { HojaDeVidaData } from '../../pages/HojaDeVidaPage';

const schema = z.object({
  primerNombre:       z.string().min(1, 'Requerido').max(60),
  segundoNombre:      z.string().max(60).optional(),
  primerApellido:     z.string().min(1, 'Requerido').max(60),
  segundoApellido:    z.string().max(60).optional(),
  fechaNacimiento:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido'),
  genero:             z.enum(['MASCULINO', 'FEMENINO', 'NO_BINARIO', 'PREFIERO_NO_DECIR']),
  tipoDocumento:      z.enum(['CEDULA_CIUDADANIA', 'CEDULA_EXTRANJERIA', 'PASAPORTE', 'TARJETA_IDENTIDAD']),
  numeroDocumento:    z.string().min(4, 'Mínimo 4 caracteres').max(20).regex(/^\d+$/, 'Solo dígitos'),
  pais:               z.string().default('COLOMBIA'),
  departamento:       z.string().max(80).optional(),
  municipio:          z.string().max(80).optional(),
  tipoZona:           z.enum(['URBANA', 'RURAL']).default('URBANA'),
  direccion:          z.string().max(200).optional(),
  complemento:        z.string().max(200).optional(),
  telefonoFijo:       z.string().max(15).optional(),
  telefonoCelular:    z.string().max(15).optional(),
  correoPersonal:     z.string().email('Correo inválido').optional().or(z.literal('')),
  esPersonaExpPolit:  z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { data: HojaDeVidaData; onSaved: () => void; }

export default function DatosPersonalesTab({ data, onSaved }: Props) {
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  // documentoUrl lives outside react-hook-form to avoid reset issues
  const [docUrl, setDocUrl]   = useState<string>('');

  const dd = data.datosDemograficos as Record<string, unknown> | undefined;
  const dc = data.datosContacto    as Record<string, unknown> | undefined;

  const defaultValues: FormData = {
    primerNombre:      data.primerNombre      ?? '',
    segundoNombre:     data.segundoNombre     ?? '',
    primerApellido:    data.primerApellido    ?? '',
    segundoApellido:   data.segundoApellido   ?? '',
    fechaNacimiento:   data.fechaNacimiento   ? data.fechaNacimiento.slice(0, 10) : '',
    genero:            (data.genero as FormData['genero']) ?? 'MASCULINO',
    tipoDocumento:     (data.tipoDocumento as FormData['tipoDocumento']) ?? 'CEDULA_CIUDADANIA',
    numeroDocumento:   data.numeroDocumento   ?? '',
    pais:              (dd?.['pais']          as string) ?? 'COLOMBIA',
    departamento:      (dd?.['departamento']  as string) ?? '',
    municipio:         (dd?.['municipio']     as string) ?? '',
    tipoZona:          ((dd?.['tipoZona']     as FormData['tipoZona']) ?? 'URBANA'),
    direccion:         (dd?.['direccion']     as string) ?? '',
    complemento:       (dd?.['complemento']   as string) ?? '',
    telefonoFijo:      (dc?.['telefonoFijo']  as string) ?? '',
    telefonoCelular:   (dc?.['telefonoCelular'] as string) ?? '',
    correoPersonal:    (dc?.['correoPersonal'] as string) ?? '',
    esPersonaExpPolit: data.esPersonaExpPolit ?? false,
  };

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Sync when parent data changes (after onSaved reload)
  useEffect(() => {
    reset(defaultValues);
    setDocUrl((data.documentoUrl as string) ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const onSubmit = async (fd: FormData) => {
    setError(''); setSuccess('');
    try {
      await hvApi.saveDatosPersonales({
        primerNombre: fd.primerNombre, segundoNombre: fd.segundoNombre,
        primerApellido: fd.primerApellido, segundoApellido: fd.segundoApellido,
        fechaNacimiento: fd.fechaNacimiento, genero: fd.genero,
        tipoDocumento: fd.tipoDocumento, numeroDocumento: fd.numeroDocumento,
        esPersonaExpPolit: fd.esPersonaExpPolit,
        documentoUrl: docUrl || undefined,
      });
      await hvApi.saveDatosDemograficos({
        pais: fd.pais, departamento: fd.departamento, municipio: fd.municipio,
        tipoZona: fd.tipoZona, direccion: fd.direccion, complemento: fd.complemento,
      });
      await hvApi.saveDatosContacto({
        telefonoFijo: fd.telefonoFijo, telefonoCelular: fd.telefonoCelular,
        correoPersonal: fd.correoPersonal || undefined,
      });
      setSuccess('Datos personales guardados correctamente.');
      onSaved();
    } catch (err) { setError(getApiError(err)); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* ── Datos básicos ─────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title">Datos Básicos</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Primer Nombre" required htmlFor="primerNombre" error={errors.primerNombre?.message}>
            <input id="primerNombre" type="text" {...register('primerNombre')}
              className={`input-field ${errors.primerNombre ? 'input-error' : ''}`} />
          </FormField>
          <FormField label="Segundo Nombre" htmlFor="segundoNombre" error={errors.segundoNombre?.message}>
            <input id="segundoNombre" type="text" {...register('segundoNombre')} className="input-field" />
          </FormField>
          <FormField label="Primer Apellido" required htmlFor="primerApellido" error={errors.primerApellido?.message}>
            <input id="primerApellido" type="text" {...register('primerApellido')}
              className={`input-field ${errors.primerApellido ? 'input-error' : ''}`} />
          </FormField>
          <FormField label="Segundo Apellido" htmlFor="segundoApellido" error={errors.segundoApellido?.message}>
            <input id="segundoApellido" type="text" {...register('segundoApellido')} className="input-field" />
          </FormField>
          <FormField label="Tipo de Documento" required htmlFor="tipoDocumento" error={errors.tipoDocumento?.message}>
            <select id="tipoDocumento" {...register('tipoDocumento')} className="input-field">
              <option value="CEDULA_CIUDADANIA">Cédula de Ciudadanía</option>
              <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
              <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
            </select>
          </FormField>
          {/* Punto 3: numeroDocumento no se borra */}
          <FormField label="Número de Identificación" required htmlFor="numeroDocumento" error={errors.numeroDocumento?.message}>
            <input id="numeroDocumento" type="text" inputMode="numeric" {...register('numeroDocumento')}
              className={`input-field ${errors.numeroDocumento ? 'input-error' : ''}`} />
          </FormField>
          <FormField label="Fecha de Nacimiento" required htmlFor="fechaNac" error={errors.fechaNacimiento?.message}>
            <input id="fechaNac" type="date" {...register('fechaNacimiento')}
              className={`input-field ${errors.fechaNacimiento ? 'input-error' : ''}`} />
          </FormField>
          <FormField label="Género" required htmlFor="genero" error={errors.genero?.message}>
            <select id="genero" {...register('genero')} className="input-field">
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="NO_BINARIO">No Binario</option>
              <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
            </select>
          </FormField>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input type="checkbox" {...register('esPersonaExpPolit')} className="rounded border-neutral-300" />
            ¿Es usted una Persona Expuesta Políticamente?
          </label>
        </div>
      </div>

      {/* ── Datos demográficos ────────────────────────────────────────── */}
      <div>
        <h3 className="section-title">Datos Demográficos</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="País" htmlFor="pais">
            <input id="pais" type="text" {...register('pais')} className="input-field" />
          </FormField>
          <FormField label="Departamento" htmlFor="dpto">
            <input id="dpto" type="text" {...register('departamento')} className="input-field" />
          </FormField>
          <FormField label="Municipio" htmlFor="municipio">
            <input id="municipio" type="text" {...register('municipio')} className="input-field" />
          </FormField>
          <FormField label="Tipo de Zona" htmlFor="zona">
            <select id="zona" {...register('tipoZona')} className="input-field">
              <option value="URBANA">Urbana</option>
              <option value="RURAL">Rural</option>
            </select>
          </FormField>
          <FormField label="Dirección" htmlFor="dir">
            <input id="dir" type="text" {...register('direccion')} className="input-field" />
          </FormField>
          <FormField label="Complemento / Dirección especial" htmlFor="comp">
            <input id="comp" type="text" {...register('complemento')} className="input-field" placeholder="Para zona rural" />
          </FormField>
        </div>
      </div>

      {/* ── Datos de contacto ─────────────────────────────────────────── */}
      <div>
        <h3 className="section-title">Datos de Contacto</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Teléfono Fijo" htmlFor="telfijo">
            <input id="telfijo" type="tel" {...register('telefonoFijo')} className="input-field" />
          </FormField>
          <FormField label="Teléfono Celular" htmlFor="telcel">
            <input id="telcel" type="tel" {...register('telefonoCelular')} className="input-field" />
          </FormField>
          <FormField label="Correo Personal" htmlFor="correopers" error={errors.correoPersonal?.message}>
            <input id="correopers" type="email" {...register('correoPersonal')}
              className={`input-field ${errors.correoPersonal ? 'input-error' : ''}`} />
          </FormField>
        </div>
      </div>

      {/* ── Documento soporte (HU-013) ────────────────────────────────── */}
      <div>
        <h3 className="section-title">Documento de Soporte</h3>
        <FormField label="Adjuntar cédula / documento de identidad (PDF, JPG o PNG · máx. 2 MB)">
          <FileUpload
            currentUrl={docUrl || null}
            onUploaded={url => setDocUrl(url)}
            accept=".pdf,.jpg,.jpeg,.png"
            maxMB={2}
            label="Seleccionar documento"
          />
        </FormField>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Guardando...' : 'Guardar Datos Personales'}
        </button>
      </div>
    </form>
  );
}