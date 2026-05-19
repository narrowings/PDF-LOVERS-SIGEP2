import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export const listarHojasDeVida = async () => {
  return prisma.usuario.findMany({
    where: { rol: 'SERVIDOR_PUBLICO' },
    select: {
      id: true, tipoDocumento: true, numeroDocumento: true, correo: true, activo: true,
      hojaDeVida: {
        select: {
          id: true, primerNombre: true, segundoNombre: true,
          primerApellido: true, segundoApellido: true, updatedAt: true,
          formacionAcademica: {
            select: { id: true, tituloObtenido: true, institucion: true, verificadoEdFormal: true, verificadoEn: true },
          },
          experienciaLaboral: {
            select: { id: true, nombreEntidad: true, cargo: true, verificado: true, verificadoEn: true },
          },
          experienciaDocente: {
            select: { id: true, institucion: true, nivelAcademico: true, verificado: true, verificadoEn: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getHojaDeVidaCompleta = async (usuarioId: string) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true, tipoDocumento: true, numeroDocumento: true, correo: true,
      hojaDeVida: {
        include: {
          datosDemograficos: true,
          datosContacto: true,
          formacionAcademica: { orderBy: { createdAt: 'desc' } },
          experienciaLaboral: { orderBy: { fechaIngreso: 'desc' } },
          experienciaDocente: { orderBy: { fechaIngreso: 'desc' } },
        },
      },
    },
  });
  if (!usuario) throw new NotFoundError('Usuario');
  if (!usuario.hojaDeVida) throw new NotFoundError('Hoja de vida');
  return usuario;
};

export const toggleVerificacionFormacion = async (id: string, verificado: boolean) => {
  if (!await prisma.formacionAcademica.findUnique({ where: { id } })) throw new NotFoundError('Formación académica');
  return prisma.formacionAcademica.update({
    where: { id },
    data: { verificadoEdFormal: verificado, verificadoEn: verificado ? new Date() : null },
  });
};

export const toggleVerificacionExperiencia = async (id: string, verificado: boolean) => {
  if (!await prisma.experienciaLaboral.findUnique({ where: { id } })) throw new NotFoundError('Experiencia laboral');
  return prisma.experienciaLaboral.update({
    where: { id },
    data: { verificado, verificadoEn: verificado ? new Date() : null },
  });
};

export const toggleVerificacionDocente = async (id: string, verificado: boolean) => {
  if (!await prisma.experienciaDocente.findUnique({ where: { id } })) throw new NotFoundError('Experiencia docente');
  return prisma.experienciaDocente.update({
    where: { id },
    data: { verificado, verificadoEn: verificado ? new Date() : null },
  });
};