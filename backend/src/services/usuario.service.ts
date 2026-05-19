import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { ConflictError, NotFoundError } from '../utils/errors';
import { TipoDocumento, RolUsuario } from '@prisma/client';
import { logger } from '../utils/logger';
import { sendMail, emailUsuarioCreado } from '../utils/email';
import { generarPasswordAleatoria } from './auth.service';

interface CrearUsuarioDto { tipoDocumento: TipoDocumento; numeroDocumento: string; correo: string; }

export const crearUsuario = async (dto: CrearUsuarioDto) => {
  const existe = await prisma.usuario.findFirst({
    where: { OR: [{ tipoDocumento: dto.tipoDocumento, numeroDocumento: dto.numeroDocumento }, { correo: dto.correo }] },
  });
  if (existe) throw new ConflictError('Ya existe un usuario con ese documento o correo');

  const tempPassword = generarPasswordAleatoria();
  const rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);
  const hash = await bcrypt.hash(tempPassword, rounds);

  const usuario = await prisma.usuario.create({
    data: { tipoDocumento: dto.tipoDocumento, numeroDocumento: dto.numeroDocumento, correo: dto.correo, passwordHash: hash, rol: RolUsuario.SERVIDOR_PUBLICO },
    select: { id: true, tipoDocumento: true, numeroDocumento: true, correo: true, rol: true, createdAt: true },
  });

  // Enviar correo con contraseña temporal
  await sendMail(emailUsuarioCreado(dto.correo, tempPassword));
  logger.info(`Usuario creado: ${usuario.id} — credenciales enviadas a ${dto.correo}`);
  return usuario;
};

export const inhabilitarRol = async (usuarioId: string, dto: { fechaFin: string }) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new NotFoundError('Usuario');
  const fechaFin = new Date(dto.fechaFin);
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { fechaFinRol: fechaFin, activo: fechaFin <= new Date() ? false : true },
  });
  if (fechaFin <= new Date()) {
    await prisma.refreshToken.updateMany({ where: { usuarioId, revoked: false }, data: { revoked: true } });
  }
  logger.info(`Rol inhabilitado para usuario ${usuarioId}, fecha fin: ${dto.fechaFin}`);
  return { message: 'Rol inhabilitado correctamente' };
};

export const listarUsuarios = async () =>
  prisma.usuario.findMany({
    select: { id: true, tipoDocumento: true, numeroDocumento: true, correo: true, rol: true, activo: true, fechaFinRol: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });