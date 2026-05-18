import { z } from 'zod';
import {
  Genero, TipoDocumento, NivelAcademico,
  TipoInstitucion, EstadoEstudio, TipoZona,
} from '@prisma/client';

export const datosPersonalesSchema = z.object({
  primerNombre: z.string().min(1).max(60),
  segundoNombre: z.string().max(60).optional(),
  primerApellido: z.string().min(1).max(60),
  segundoApellido: z.string().max(60).optional(),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido'),
  genero: z.nativeEnum(Genero),
  tipoDocumento: z.nativeEnum(TipoDocumento),
  numeroDocumento: z.string().min(4).max(20).regex(/^\d+$/),
  distritoMilitar: z.string().max(10).optional(),
  claseLM: z.string().max(20).optional(),
  numeroLM: z.string().max(20).optional(),
  esPersonaExpPolit: z.boolean().optional().default(false),
});

export const datosDemograficosSchema = z.object({
  pais: z.string().default('COLOMBIA'),
  departamento: z.string().max(80).optional(),
  municipio: z.string().max(80).optional(),
  tipoZona: z.nativeEnum(TipoZona).default(TipoZona.URBANA),
  direccion: z.string().max(200).optional(),
  complemento: z.string().max(200).optional(),
});

export const datosContactoSchema = z.object({
  telefonoFijo: z.string().max(15).optional(),
  telefonoCelular: z.string().max(15).optional(),
  correoPersonal: z.string().email().optional(),
});

export const formacionAcademicaSchema = z.object({
  nivelAcademico: z.nativeEnum(NivelAcademico),
  nivelFormacion: z.string().max(80).optional(),
  areaConocimiento: z.string().max(120).optional(),
  pais: z.string().default('COLOMBIA'),
  institucion: z.string().min(1).max(200),
  programaAcademico: z.string().max(200).optional(),
  tituloObtenido: z.string().min(1).max(200),
  semestresAprobados: z.number().int().min(0).max(20).optional(),
  estadoEstudio: z.nativeEnum(EstadoEstudio),
  fechaTerminacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaGrado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estudiosExterior: z.boolean().default(false),
});

export const experienciaLaboralSchema = z.object({
  tipoInstitucion: z.nativeEnum(TipoInstitucion),
  nombreEntidad: z.string().min(1).max(200),
  pais: z.string().default('COLOMBIA'),
  departamento: z.string().max(80).optional(),
  municipio: z.string().max(80).optional(),
  tipoZona: z.nativeEnum(TipoZona).default(TipoZona.URBANA),
  direccion: z.string().max(200).optional(),
  cargo: z.string().min(1).max(200),
  areaConocimiento: z.string().max(120).optional(),
  funcionesCargo: z.string().max(1000).optional(),
  trabajoActual: z.boolean().default(false),
  fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaRetiro: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  motivoRetiro: z.string().max(200).optional(),
  jornadaLaboral: z.string().max(50).optional(),
  horasMes: z.number().int().min(0).max(744).optional(),
});

export const experienciaDocenteSchema = z.object({
  tipoInstitucion: z.nativeEnum(TipoInstitucion).default(TipoInstitucion.PUBLICA),
  institucion: z.string().min(1).max(200),
  pais: z.string().default('COLOMBIA'),
  departamento: z.string().max(80).optional(),
  municipio: z.string().max(80).optional(),
  nivelAcademico: z.nativeEnum(NivelAcademico),
  tipoZona: z.nativeEnum(TipoZona).default(TipoZona.URBANA),
  direccion: z.string().max(200).optional(),
  trabajoActual: z.boolean().default(false),
  fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaRetiro: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  motivoRetiro: z.string().max(200).optional(),
  jornadaLaboral: z.string().max(50).optional(),
  telefono: z.string().max(15).optional(),
  materiaImpartida: z.string().max(200).optional(),
});

export type DatosPersonalesDto = z.infer<typeof datosPersonalesSchema>;
export type DatosDemograficosDto = z.infer<typeof datosDemograficosSchema>;
export type DatosContactoDto = z.infer<typeof datosContactoSchema>;
export type FormacionAcademicaDto = z.infer<typeof formacionAcademicaSchema>;
export type ExperienciaLaboralDto = z.infer<typeof experienciaLaboralSchema>;
export type ExperienciaDocenteDto = z.infer<typeof experienciaDocenteSchema>;
