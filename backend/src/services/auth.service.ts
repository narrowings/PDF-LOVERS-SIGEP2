import bcrypt from 'bcryptjs';

import { prisma } from '../config/database';
import {
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken, getRefreshTokenExpiry,
} from '../utils/jwt';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import type { LoginDto, CambiarPasswordDto, RecuperarPasswordDto} from '../validators/auth.validators';
import { logger } from '../utils/logger';
import { sendMail, emailRecuperarPassword } from '../utils/email';

/** Genera contraseña aleatoria que cumple: ≥6 chars, ≥1 letra, ≥1 número, ≥1 especial */
export const generarPasswordAleatoria = (): string => {
  const letras  = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  const numeros = '23456789';
  const especiales = '!@#$%&*-_';
  const todos = letras + numeros + especiales;
  let pwd = '';
  // Garantizar al menos uno de cada tipo
  pwd += letras[Math.floor(Math.random() * letras.length)];
  pwd += numeros[Math.floor(Math.random() * numeros.length)];
  pwd += especiales[Math.floor(Math.random() * especiales.length)];
  // Completar hasta 10 caracteres
  for (let i = 3; i < 10; i++) pwd += todos[Math.floor(Math.random() * todos.length)];
  // Mezclar
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

export const loginService = async (dto: LoginDto) => {
  const usuario = await prisma.usuario.findFirst({
    where: { tipoDocumento: dto.tipoDocumento, numeroDocumento: dto.numeroDocumento, activo: true },
  });
  const hash = usuario?.passwordHash ?? '$2a$12$invalidhashpadding000000000000000000000000000000000000000';
  const valid = await bcrypt.compare(dto.password, hash);
  if (!usuario || !valid) throw new UnauthorizedError('Credenciales inválidas');
  if (usuario.fechaFinRol && usuario.fechaFinRol <= new Date()) throw new UnauthorizedError('Su acceso ha sido deshabilitado');

  const payload = { sub: usuario.id, rol: usuario.rol, tipoDocumento: usuario.tipoDocumento, correo: usuario.correo };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await prisma.refreshToken.create({ data: { token: refreshToken, usuarioId: usuario.id, expiresAt: getRefreshTokenExpiry() } });
  logger.info(`Login exitoso para usuario ${usuario.id} [${usuario.rol}]`);
  return { accessToken, refreshToken, rol: usuario.rol };
};

export const refreshTokenService = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { token }, include: { usuario: true } });
  if (!stored || stored.revoked || stored.expiresAt <= new Date()) throw new UnauthorizedError('Refresh token inválido');
  if (!stored.usuario.activo) throw new UnauthorizedError('Usuario desactivado');
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const np = { sub: payload.sub, rol: payload.rol, tipoDocumento: payload.tipoDocumento, correo: payload.correo ?? stored.usuario.correo };
  const accessToken = generateAccessToken(np);
  const refreshToken = generateRefreshToken(np);
  await prisma.refreshToken.create({ data: { token: refreshToken, usuarioId: stored.usuarioId, expiresAt: getRefreshTokenExpiry() } });
  return { accessToken, refreshToken };
};

export const logoutService = async (token: string) =>
  prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });

export const cambiarPasswordService = async (usuarioId: string, dto: CambiarPasswordDto) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new NotFoundError('Usuario');
  const valid = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
  if (!valid) throw new UnauthorizedError('Contraseña actual incorrecta');
  const rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);
  const newHash = await bcrypt.hash(dto.passwordNueva, rounds);
  await prisma.usuario.update({ where: { id: usuarioId }, data: { passwordHash: newHash } });
  await prisma.refreshToken.updateMany({ where: { usuarioId, revoked: false }, data: { revoked: true } });
  logger.info(`Contraseña cambiada para usuario ${usuarioId}`);
};

export const recuperarPasswordService = async (dto: RecuperarPasswordDto) => {
  const usuario = await prisma.usuario.findFirst({
    where: { tipoDocumento: dto.tipoDocumento, numeroDocumento: dto.numeroDocumento, activo: true },
  });
  // Respuesta genérica para no revelar si el usuario existe
  if (!usuario || !usuario.correo) {
    logger.warn(`Recuperación: usuario no encontrado (doc: ${dto.numeroDocumento})`);
    return;
  }
  const tempPassword = generarPasswordAleatoria();
  const rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);
  await prisma.usuario.update({ where: { id: usuario.id }, data: { passwordHash: await bcrypt.hash(tempPassword, rounds) } });
  await sendMail(emailRecuperarPassword(usuario.correo, tempPassword));
  logger.info(`Contraseña temporal enviada a ${usuario.correo}`);
};