import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import * as usuarioService from '../services/usuario.service';

export const crearUsuario = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await usuarioService.crearUsuario(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const inhabilitarRol = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await usuarioService.inhabilitarRol(id!, req.body);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

export const listarUsuarios = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await usuarioService.listarUsuarios();
    res.status(200).json(data);
  } catch (err) { next(err); }
};
