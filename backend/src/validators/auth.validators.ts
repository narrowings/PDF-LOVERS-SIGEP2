import { z } from 'zod';
import { TipoDocumento } from '@prisma/client';

export const loginSchema = z.object({
  tipoDocumento: z.nativeEnum(TipoDocumento),
  numeroDocumento: z
    .string()
    .min(4, 'Número de documento muy corto')
    .max(20, 'Número de documento muy largo')
    .regex(/^\d+$/, 'Solo se permiten dígitos'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1, 'Contraseña actual requerida'),
  passwordNueva: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
    .regex(/\d/, 'Debe contener al menos un número')
    .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial'),
  passwordConfirmacion: z.string(),
}).refine((d) => d.passwordNueva === d.passwordConfirmacion, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirmacion'],
});

export const recuperarPasswordSchema = z.object({
  tipoDocumento: z.nativeEnum(TipoDocumento),
  numeroDocumento: z
    .string()
    .min(4)
    .max(20)
    .regex(/^\d+$/),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type CambiarPasswordDto = z.infer<typeof cambiarPasswordSchema>;
export type RecuperarPasswordDto = z.infer<typeof recuperarPasswordSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
