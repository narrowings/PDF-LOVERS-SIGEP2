import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import {
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken, getRefreshTokenExpiry,
} from '../utils/jwt';
import {
  UnauthorizedError, NotFoundError, ConflictError,
} from '../utils/errors';
import type {
  LoginDto, CambiarPasswordDto, RecuperarPasswordDto,
} from '../validators/auth.validators';
import { logger } from '../utils/logger';

export const loginService = async (dto: LoginDto): Promise<{
  accessToken: string;
  refreshToken: string;
  rol: string;
}> => {
  const usuario = await prisma.usuario.findFirst({
    where: {
      tipoDocumento: dto.tipoDocumento,
      numeroDocumento: dto.numeroDocumento,
      activo: true,
    },
  });

  // Timing-safe: siempre comparar aunque usuario no exista
  const hash = usuario?.passwordHash ?? '$2a$12$invalidhashpadding000000000000000000000000000000000000000';
  const valid = await bcrypt.compare(dto.password, hash);

  if (!usuario || !valid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Verificar que el rol siga activo (PAM: fecha fin de rol)
  if (usuario.fechaFinRol && usuario.fechaFinRol <= new Date()) {
    throw new UnauthorizedError('Su acceso ha sido deshabilitado');
  }

  const payload = {
    sub: usuario.id,
    rol: usuario.rol,
    tipoDocumento: usuario.tipoDocumento,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuarioId: usuario.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  logger.info(`Login exitoso para usuario ${usuario.id} [${usuario.rol}]`);
  return { accessToken, refreshToken, rol: usuario.rol };
};

export const refreshTokenService = async (token: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const payload = verifyRefreshToken(token);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { usuario: true },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt <= new Date()) {
    throw new UnauthorizedError('Refresh token inválido');
  }

  if (!storedToken.usuario.activo) {
    throw new UnauthorizedError('Usuario desactivado');
  }

  // Rotar el refresh token (revoke old, issue new)
  await prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revoked: true } });

  const newPayload = { sub: payload.sub, rol: payload.rol, tipoDocumento: payload.tipoDocumento };
  const accessToken = generateAccessToken(newPayload);
  const refreshToken = generateRefreshToken(newPayload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      usuarioId: storedToken.usuarioId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
};

export const logoutService = async (token: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
};

export const cambiarPasswordService = async (
  usuarioId: string,
  dto: CambiarPasswordDto,
): Promise<void> => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new NotFoundError('Usuario');

  const valid = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
  if (!valid) throw new UnauthorizedError('Contraseña actual incorrecta');

  const rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);
  const newHash = await bcrypt.hash(dto.passwordNueva, rounds);

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { passwordHash: newHash },
  });

  // Revocar todos los refresh tokens activos (forzar re-login)
  await prisma.refreshToken.updateMany({
    where: { usuarioId, revoked: false },
    data: { revoked: true },
  });

  logger.info(`Contraseña cambiada para usuario ${usuarioId}`);
};

export const recuperarPasswordService = async (dto: RecuperarPasswordDto): Promise<void> => {
  const usuario = await prisma.usuario.findFirst({
    where: {
      tipoDocumento: dto.tipoDocumento,
      numeroDocumento: dto.numeroDocumento,
      activo: true,
    },
    include: { hojaDeVida: { include: { datosContacto: true } } },
  });

  // Siempre responder igual para no revelar si el usuario existe
  if (!usuario || !usuario.correo) {
    logger.warn(`Recuperación de contraseña: usuario no encontrado (doc: ${dto.numeroDocumento})`);
    return;
  }

  // Generar contraseña temporal segura
  const tempPassword = crypto.randomBytes(8).toString('hex');
  const rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);
  const hash = await bcrypt.hash(tempPassword, rounds);

  await prisma.usuario.update({ where: { id: usuario.id }, data: { passwordHash: hash } });

  // En producción aquí se enviaría el correo con el servicio SMTP configurado
  logger.info(`Contraseña temporal generada para usuario ${usuario.id}. Correo: ${usuario.correo}`);
  // TODO: Integrar servicio de correo (nodemailer / AWS SES)
};
