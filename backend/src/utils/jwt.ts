import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from './logger';

export interface JwtPayload {
  sub: string;
  rol: string;
  tipoDocumento: string;
  iat?: number;
  exp?: number;
}

const getSecret = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Variable de entorno ${key} no definida`);
  return val;
};

export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = getSecret('JWT_SECRET');
  const options: SignOptions = {
    expiresIn: (process.env['JWT_EXPIRES_IN'] ?? '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = getSecret('JWT_REFRESH_SECRET');
  const options: SignOptions = {
    expiresIn: (process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getSecret('JWT_SECRET')) as JwtPayload;
  } catch (err) {
    logger.warn('Token de acceso inválido', err);
    throw new Error('Token inválido o expirado');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as JwtPayload;
  } catch (err) {
    logger.warn('Refresh token inválido', err);
    throw new Error('Refresh token inválido o expirado');
  }
};

export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt((process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d').replace('d', ''), 10);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
