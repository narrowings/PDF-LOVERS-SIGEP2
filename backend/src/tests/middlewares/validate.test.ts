import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';

const mockRes = {} as Response;
const mockNext = jest.fn() as NextFunction;

const schema = z.object({
  nombre: z.string().min(1),
  edad: z.number().int().min(0),
});

describe('validate middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe llamar next sin error con datos válidos', () => {
    const req = { body: { nombre: 'Juan', edad: 30 } } as Request;
    validate(schema)(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('debe llamar next con ValidationError si faltan campos', () => {
    const req = { body: { nombre: '' } } as Request;
    validate(schema)(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 422 }));
  });

  it('debe llamar next con ValidationError si el tipo es incorrecto', () => {
    const req = { body: { nombre: 'Juan', edad: 'no-es-numero' } } as Request;
    validate(schema)(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 422 }));
  });

  it('debe sanitizar el body con los datos parseados por zod', () => {
    const req = { body: { nombre: 'Juan', edad: 25, campoExtra: 'ignorado' } } as Request;
    validate(schema)(req, mockRes, mockNext);
    expect(req.body).not.toHaveProperty('campoExtra');
    expect(req.body.nombre).toBe('Juan');
  });
});