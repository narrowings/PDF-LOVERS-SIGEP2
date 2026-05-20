import { prismaMock } from '../../mocks/prisma';
import {
  listarHojasDeVida,
  getHojaDeVidaCompleta,
  toggleVerificacionFormacion,
  toggleVerificacionExperiencia,
  toggleVerificacionDocente,
} from '../../services/jth.service';

describe('jth.service', () => {
  describe('listarHojasDeVida', () => {
    it('debe retornar lista de servidores públicos', async () => {
      prismaMock.usuario.findMany.mockResolvedValue([]);
      const result = await listarHojasDeVida();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getHojaDeVidaCompleta', () => {
    it('debe lanzar NotFoundError si el usuario no existe', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      await expect(getHojaDeVidaCompleta('user-999'))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('debe lanzar NotFoundError si el usuario no tiene hoja de vida', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ id: 'user-123', hojaDeVida: null } as any);
      await expect(getHojaDeVidaCompleta('user-123'))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('debe retornar usuario con hoja de vida', async () => {
      const mockData = { id: 'user-123', hojaDeVida: { id: 'hv-1' } };
      prismaMock.usuario.findUnique.mockResolvedValue(mockData as any);
      const result = await getHojaDeVidaCompleta('user-123');
      expect(result).toHaveProperty('hojaDeVida');
    });
  });

  describe('toggleVerificacionFormacion', () => {
    it('debe lanzar NotFoundError si no existe el registro', async () => {
      prismaMock.formacionAcademica.findUnique.mockResolvedValue(null);
      await expect(toggleVerificacionFormacion('fa-999', true))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('debe verificar el registro correctamente', async () => {
      prismaMock.formacionAcademica.findUnique.mockResolvedValue({ id: 'fa-1' } as any);
      prismaMock.formacionAcademica.update.mockResolvedValue({ id: 'fa-1', verificadoEdFormal: true } as any);
      const result = await toggleVerificacionFormacion('fa-1', true);
      expect(result).toHaveProperty('verificadoEdFormal', true);
    });
  });

  describe('toggleVerificacionExperiencia', () => {
    it('debe lanzar NotFoundError si no existe el registro', async () => {
      prismaMock.experienciaLaboral.findUnique.mockResolvedValue(null);
      await expect(toggleVerificacionExperiencia('el-999', true))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('debe verificar el registro correctamente', async () => {
      prismaMock.experienciaLaboral.findUnique.mockResolvedValue({ id: 'el-1' } as any);
      prismaMock.experienciaLaboral.update.mockResolvedValue({ id: 'el-1', verificado: true } as any);
      const result = await toggleVerificacionExperiencia('el-1', true);
      expect(result).toHaveProperty('verificado', true);
    });
  });

  describe('toggleVerificacionDocente', () => {
    it('debe lanzar NotFoundError si no existe el registro', async () => {
      prismaMock.experienciaDocente.findUnique.mockResolvedValue(null);
      await expect(toggleVerificacionDocente('ed-999', true))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('debe verificar el registro correctamente', async () => {
      prismaMock.experienciaDocente.findUnique.mockResolvedValue({ id: 'ed-1' } as any);
      prismaMock.experienciaDocente.update.mockResolvedValue({ id: 'ed-1', verificado: true } as any);
      const result = await toggleVerificacionDocente('ed-1', true);
      expect(result).toHaveProperty('verificado', true);
    });
  });
});