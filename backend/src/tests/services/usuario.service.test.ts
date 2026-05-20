import { prismaMock } from '../../mocks/prisma';
import { crearUsuario, inhabilitarRol, listarUsuarios } from '../../services/usuario.service';

process.env['BCRYPT_ROUNDS'] = '4';

jest.mock('../../utils/email', () => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
  emailUsuarioCreado: jest.fn().mockReturnValue({ to: '', subject: '', html: '' }),
}));

const mockUsuario = {
  id: 'user-123',
  tipoDocumento: 'CEDULA_CIUDADANIA' as any,
  numeroDocumento: '12345678',
  correo: 'test@test.com',
  rol: 'SERVIDOR_PUBLICO' as any,
  activo: true,
  fechaFinRol: null,
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('usuario.service', () => {
  describe('crearUsuario', () => {
    it('debe lanzar ConflictError si ya existe el usuario', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue(mockUsuario);
      await expect(crearUsuario({
        tipoDocumento: 'CEDULA_CIUDADANIA',
        numeroDocumento: '12345678',
        correo: 'test@test.com',
      })).rejects.toMatchObject({ statusCode: 409 });
    });

    it('debe crear el usuario correctamente', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue(null);
      prismaMock.usuario.create.mockResolvedValue(mockUsuario);
      const result = await crearUsuario({
        tipoDocumento: 'CEDULA_CIUDADANIA',
        numeroDocumento: '99999999',
        correo: 'nuevo@test.com',
      });
      expect(result).toHaveProperty('id');
      expect(prismaMock.usuario.create).toHaveBeenCalled();
    });
  });

  describe('inhabilitarRol', () => {
    it('debe lanzar NotFoundError si el usuario no existe', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      await expect(inhabilitarRol('user-999', { fechaFin: '2025-12-31' }))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('debe inhabilitar el rol correctamente con fecha futura', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(mockUsuario);
      prismaMock.usuario.update.mockResolvedValue({ ...mockUsuario, activo: true });
      const result = await inhabilitarRol('user-123', { fechaFin: '2099-12-31' });
      expect(result).toHaveProperty('message');
    });

    it('debe desactivar al usuario si la fecha ya pasó', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(mockUsuario);
      prismaMock.usuario.update.mockResolvedValue({ ...mockUsuario, activo: false });
      prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      const result = await inhabilitarRol('user-123', { fechaFin: '2000-01-01' });
      expect(result).toHaveProperty('message');
    });
  });

  describe('listarUsuarios', () => {
    it('debe retornar la lista de usuarios', async () => {
      prismaMock.usuario.findMany.mockResolvedValue([mockUsuario]);
      const result = await listarUsuarios();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});