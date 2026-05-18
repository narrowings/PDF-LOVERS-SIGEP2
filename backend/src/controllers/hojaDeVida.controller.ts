import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import * as hvService from '../services/hojaDeVida.service';

export const getHojaDeVida = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.getHojaDeVida(req.user!.sub);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const saveDatosPersonales = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.upsertDatosPersonales(req.user!.sub, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const saveDatosDemograficos = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.upsertDatosDemograficos(req.user!.sub, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const saveDatosContacto = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.upsertDatosContacto(req.user!.sub, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const createFormacion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.createFormacion(req.user!.sub, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const updateFormacion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.updateFormacion(req.user!.sub, req.params['id']!, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const deleteFormacion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await hvService.deleteFormacion(req.user!.sub, req.params['id']!);
    res.status(204).send();
  } catch (err) { next(err); }
};

export const createExperiencia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.createExperiencia(req.user!.sub, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const updateExperiencia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.updateExperiencia(req.user!.sub, req.params['id']!, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const deleteExperiencia = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await hvService.deleteExperiencia(req.user!.sub, req.params['id']!);
    res.status(204).send();
  } catch (err) { next(err); }
};

export const createDocente = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.createDocente(req.user!.sub, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const updateDocente = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await hvService.updateDocente(req.user!.sub, req.params['id']!, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const deleteDocente = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await hvService.deleteDocente(req.user!.sub, req.params['id']!);
    res.status(204).send();
  } catch (err) { next(err); }
};
