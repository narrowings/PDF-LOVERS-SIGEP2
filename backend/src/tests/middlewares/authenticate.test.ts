import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middlewares/authenticate';
import { generateAccessToken } from '../../utils/jwt';

process.env['JWT_SECRET'] = 'test-secret-key';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key';

const mockRes = {} as Response;
const mockNext = jest.fn() as NextFunction;

const validPayload = {
  sub: 'user-123',
  rol: 'SERVIDOR_PUBLICO',
  tipoDocumento: 'CEDULA_CIUDADANIA',
  correo: 'test@test.com',
};

describe('authenticate middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe llamar next con UnauthorizedError si no hay header', () => {
    const req = { headers: {} } as Request;
    authenticate(req as any, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('debe llamar next con UnauthorizedError si el token es inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } } as Request;
    authenticate(req as any, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('debe asignar user al request con token válido', () => {
    const token = generateAccessToken(validPayload);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    authenticate(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
    expect(req.user.sub).toBe('user-123');
  });
});

describe('requireRole middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debe llamar next con UnauthorizedError si no hay user', () => {
    const req = {} as any;
    requireRole('JEFE_TALENTO_HUMANO')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('debe llamar next con ForbiddenError si el rol no coincide', () => {
    const req = { user: { ...validPayload, rol: 'SERVIDOR_PUBLICO' } } as any;
    requireRole('JEFE_TALENTO_HUMANO')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('debe llamar next sin error si el rol coincide', () => {
    const req = { user: { ...validPayload, rol: 'JEFE_TALENTO_HUMANO' } } as any;
    requireRole('JEFE_TALENTO_HUMANO')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });
});