import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ValidationError) {
    res.status(422).json({ message: err.message, errors: err.errors });
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) logger.error('Error no operacional', err);
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error('Error inesperado', err);
  res.status(500).json({
    message: process.env['NODE_ENV'] === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Ruta no encontrada' });
};
