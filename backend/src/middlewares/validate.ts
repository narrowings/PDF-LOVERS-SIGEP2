import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body) as unknown;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
          const key = e.path.join('.');
          if (!errors[key]) errors[key] = [];
          errors[key].push(e.message);
        });
        next(new ValidationError(errors));
      } else {
        next(err);
      }
    }
  };
