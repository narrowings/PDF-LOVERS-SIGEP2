import { Router } from 'express';
import { z } from 'zod';
import { TipoDocumento } from '@prisma/client';
import { authenticate, requireRole } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import * as ctrl from '../controllers/usuario.controller';

const router = Router();
router.use(authenticate, requireRole('JEFE_TALENTO_HUMANO'));

const crearUsuarioSchema = z.object({
  tipoDocumento: z.nativeEnum(TipoDocumento),
  numeroDocumento: z.string().min(4).max(20).regex(/^\d+$/),
  correo: z.string().email(),
});

const inhabilitarSchema = z.object({
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido'),
});

/**
 * @openapi
 * /api/v1/usuarios:
 *   get:
 *     tags: [Usuarios - JTH]
 *     summary: Listar servidores públicos
 *     security:
 *       - bearerAuth: []
 */
router.get('/', ctrl.listarUsuarios);

/**
 * @openapi
 * /api/v1/usuarios:
 *   post:
 *     tags: [Usuarios - JTH]
 *     summary: Crear usuario inicial para nuevo servidor
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validate(crearUsuarioSchema), ctrl.crearUsuario);

/**
 * @openapi
 * /api/v1/usuarios/{id}/inhabilitar:
 *   patch:
 *     tags: [Usuarios - JTH]
 *     summary: Inhabilitar rol de un servidor (PAM)
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/inhabilitar', validate(inhabilitarSchema), ctrl.inhabilitarRol);

export default router;
