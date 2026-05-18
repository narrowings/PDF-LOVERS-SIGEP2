import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type {
  DatosPersonalesDto, DatosDemograficosDto, DatosContactoDto,
  FormacionAcademicaDto, ExperienciaLaboralDto, ExperienciaDocenteDto,
} from '../validators/hojaDeVida.validators';

export const getHojaDeVida = async (usuarioId: string) => {
  const hdv = await prisma.hojaDeVida.findUnique({
    where: { usuarioId },
    include: {
      datosDemograficos: true,
      datosContacto: true,
      formacionAcademica: { orderBy: { createdAt: 'desc' } },
      experienciaLaboral: { orderBy: { fechaIngreso: 'desc' } },
      experienciaDocente: { orderBy: { fechaIngreso: 'desc' } },
    },
  });
  if (!hdv) throw new NotFoundError('Hoja de vida');
  return hdv;
};

export const upsertDatosPersonales = async (usuarioId: string, dto: DatosPersonalesDto) => {
  return prisma.hojaDeVida.upsert({
    where: { usuarioId },
    update: {
      primerNombre: dto.primerNombre,
      segundoNombre: dto.segundoNombre,
      primerApellido: dto.primerApellido,
      segundoApellido: dto.segundoApellido,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      genero: dto.genero,
      distritoMilitar: dto.distritoMilitar,
      claseLM: dto.claseLM,
      numeroLM: dto.numeroLM,
      esPersonaExpPolit: dto.esPersonaExpPolit ?? false,
    },
    create: {
      usuarioId,
      primerNombre: dto.primerNombre,
      segundoNombre: dto.segundoNombre,
      primerApellido: dto.primerApellido,
      segundoApellido: dto.segundoApellido,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      genero: dto.genero,
      distritoMilitar: dto.distritoMilitar,
      claseLM: dto.claseLM,
      numeroLM: dto.numeroLM,
      esPersonaExpPolit: dto.esPersonaExpPolit ?? false,
    },
  });
};

export const upsertDatosDemograficos = async (usuarioId: string, dto: DatosDemograficosDto) => {
  const hdv = await prisma.hojaDeVida.findUnique({ where: { usuarioId } });
  if (!hdv) throw new NotFoundError('Hoja de vida');
  return prisma.datosDemograficos.upsert({
    where: { hojaDeVidaId: hdv.id },
    update: { ...dto },
    create: { hojaDeVidaId: hdv.id, ...dto },
  });
};

export const upsertDatosContacto = async (usuarioId: string, dto: DatosContactoDto) => {
  const hdv = await prisma.hojaDeVida.findUnique({ where: { usuarioId } });
  if (!hdv) throw new NotFoundError('Hoja de vida');
  return prisma.datosContacto.upsert({
    where: { hojaDeVidaId: hdv.id },
    update: { ...dto },
    create: { hojaDeVidaId: hdv.id, ...dto },
  });
};

// ── Formación académica ───────────────────────────────────────────────────────
export const createFormacion = async (usuarioId: string, dto: FormacionAcademicaDto) => {
  const hdv = await prisma.hojaDeVida.findUnique({ where: { usuarioId } });
  if (!hdv) throw new NotFoundError('Hoja de vida');
  return prisma.formacionAcademica.create({
    data: {
      hojaDeVidaId: hdv.id,
      ...dto,
      fechaTerminacion: dto.fechaTerminacion ? new Date(dto.fechaTerminacion) : undefined,
      fechaGrado: dto.fechaGrado ? new Date(dto.fechaGrado) : undefined,
    },
  });
};

export const updateFormacion = async (
  usuarioId: string, id: string, dto: FormacionAcademicaDto,
) => {
  const record = await prisma.formacionAcademica.findUnique({
    where: { id }, include: { hojaDeVida: true },
  });
  if (!record) throw new NotFoundError('Formación académica');
  if (record.hojaDeVida.usuarioId !== usuarioId) throw new ForbiddenError();
  // 🔒 HU-013/validación: bloquear si ya fue verificada por el JTH
  if (record.verificadoEdFormal) {
    throw new ForbiddenError(
      'Este registro ha sido validado por el JTH y no puede modificarse. Solicite al JTH que levante la validación.',
    );
  }
  return prisma.formacionAcademica.update({
    where: { id },
    data: {
      ...dto,
      fechaTerminacion: dto.fechaTerminacion ? new Date(dto.fechaTerminacion) : undefined,
      fechaGrado: dto.fechaGrado ? new Date(dto.fechaGrado) : undefined,
    },
  });
};

export const deleteFormacion = async (usuarioId: string, id: string) => {
  const record = await prisma.formacionAcademica.findUnique({
    where: { id }, include: { hojaDeVida: true },
  });
  if (!record) throw new NotFoundError('Formación académica');
  if (record.hojaDeVida.usuarioId !== usuarioId) throw new ForbiddenError();
  if (record.verificadoEdFormal) {
    throw new ForbiddenError(
      'Este registro ha sido validado por el JTH y no puede eliminarse.',
    );
  }
  return prisma.formacionAcademica.delete({ where: { id } });
};

// ── Experiencia laboral ───────────────────────────────────────────────────────
export const createExperiencia = async (usuarioId: string, dto: ExperienciaLaboralDto) => {
  const hdv = await prisma.hojaDeVida.findUnique({ where: { usuarioId } });
  if (!hdv) throw new NotFoundError('Hoja de vida');
  return prisma.experienciaLaboral.create({
    data: {
      hojaDeVidaId: hdv.id,
      ...dto,
      fechaIngreso: new Date(dto.fechaIngreso),
      fechaRetiro: dto.fechaRetiro ? new Date(dto.fechaRetiro) : undefined,
    },
  });
};

export const updateExperiencia = async (
  usuarioId: string, id: string, dto: ExperienciaLaboralDto,
) => {
  const record = await prisma.experienciaLaboral.findUnique({
    where: { id }, include: { hojaDeVida: true },
  });
  if (!record) throw new NotFoundError('Experiencia laboral');
  if (record.hojaDeVida.usuarioId !== usuarioId) throw new ForbiddenError();
  if (record.verificado) {
    throw new ForbiddenError(
      'Este registro ha sido validado por el JTH y no puede modificarse.',
    );
  }
  return prisma.experienciaLaboral.update({
    where: { id },
    data: {
      ...dto,
      fechaIngreso: new Date(dto.fechaIngreso),
      fechaRetiro: dto.fechaRetiro ? new Date(dto.fechaRetiro) : undefined,
    },
  });
};

export const deleteExperiencia = async (usuarioId: string, id: string) => {
  const record = await prisma.experienciaLaboral.findUnique({
    where: { id }, include: { hojaDeVida: true },
  });
  if (!record) throw new NotFoundError('Experiencia laboral');
  if (record.hojaDeVida.usuarioId !== usuarioId) throw new ForbiddenError();
  if (record.verificado) {
    throw new ForbiddenError('Este registro ha sido validado por el JTH y no puede eliminarse.');
  }
  return prisma.experienciaLaboral.delete({ where: { id } });
};

// ── Experiencia docente ───────────────────────────────────────────────────────
export const createDocente = async (usuarioId: string, dto: ExperienciaDocenteDto) => {
  const hdv = await prisma.hojaDeVida.findUnique({ where: { usuarioId } });
  if (!hdv) throw new NotFoundError('Hoja de vida');
  return prisma.experienciaDocente.create({
    data: {
      hojaDeVidaId: hdv.id,
      ...dto,
      fechaIngreso: new Date(dto.fechaIngreso),
      fechaRetiro: dto.fechaRetiro ? new Date(dto.fechaRetiro) : undefined,
    },
  });
};

export const updateDocente = async (
  usuarioId: string, id: string, dto: ExperienciaDocenteDto,
) => {
  const record = await prisma.experienciaDocente.findUnique({
    where: { id }, include: { hojaDeVida: true },
  });
  if (!record) throw new NotFoundError('Experiencia docente');
  if (record.hojaDeVida.usuarioId !== usuarioId) throw new ForbiddenError();
  if (record.verificado) {
    throw new ForbiddenError('Este registro ha sido validado por el JTH y no puede modificarse.');
  }
  return prisma.experienciaDocente.update({
    where: { id },
    data: {
      ...dto,
      fechaIngreso: new Date(dto.fechaIngreso),
      fechaRetiro: dto.fechaRetiro ? new Date(dto.fechaRetiro) : undefined,
    },
  });
};

export const deleteDocente = async (usuarioId: string, id: string) => {
  const record = await prisma.experienciaDocente.findUnique({
    where: { id }, include: { hojaDeVida: true },
  });
  if (!record) throw new NotFoundError('Experiencia docente');
  if (record.hojaDeVida.usuarioId !== usuarioId) throw new ForbiddenError();
  if (record.verificado) {
    throw new ForbiddenError('Este registro ha sido validado por el JTH y no puede eliminarse.');
  }
  return prisma.experienciaDocente.delete({ where: { id } });
};
