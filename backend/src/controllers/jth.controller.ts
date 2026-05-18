import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import * as jthService from '../services/jth.service';

export const listarHojasDeVida = async (
  _req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> => {
  try { res.status(200).json(await jthService.listarHojasDeVida()); }
  catch (err) { next(err); }
};

export const getHojaDeVidaCompleta = async (
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> => {
  try { res.status(200).json(await jthService.getHojaDeVidaCompleta(req.params['usuarioId']!)); }
  catch (err) { next(err); }
};

export const verificarFormacion = async (
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> => {
  try {
    const verificado = (req.body as { verificado: boolean }).verificado;
    res.status(200).json(await jthService.toggleVerificacionFormacion(req.params['id']!, verificado));
  } catch (err) { next(err); }
};

export const verificarExperiencia = async (
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> => {
  try {
    const verificado = (req.body as { verificado: boolean }).verificado;
    res.status(200).json(await jthService.toggleVerificacionExperiencia(req.params['id']!, verificado));
  } catch (err) { next(err); }
};

export const verificarDocente = async (
  req: AuthRequest, res: Response, next: NextFunction,
): Promise<void> => {
  try {
    const verificado = (req.body as { verificado: boolean }).verificado;
    res.status(200).json(await jthService.toggleVerificacionDocente(req.params['id']!, verificado));
  } catch (err) { next(err); }
};
