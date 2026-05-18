import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import * as authService from '../services/auth.service';
import type { LoginDto, CambiarPasswordDto, RecuperarPasswordDto, RefreshTokenDto } from '../validators/auth.validators';

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.loginService(req.body as LoginDto);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenDto;
    const result = await authService.refreshTokenService(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenDto;
    await authService.logoutService(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const cambiarPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.cambiarPasswordService(req.user!.sub, req.body as CambiarPasswordDto);
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

export const recuperarPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.recuperarPasswordService(req.body as RecuperarPasswordDto);
    // Respuesta genérica para no revelar si el usuario existe
    res.status(200).json({ message: 'Si existe una cuenta con esos datos, recibirá instrucciones en su correo registrado' });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ sub: req.user?.sub, rol: req.user?.rol });
  } catch (err) {
    next(err);
  }
};
