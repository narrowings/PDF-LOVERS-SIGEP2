import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import {
  loginSchema, cambiarPasswordSchema,
  recuperarPasswordSchema, refreshTokenSchema,
} from '../validators/auth.validators';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Tokens de acceso y refresh
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authRateLimiter, validate(loginSchema), ctrl.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Autenticación]
 *     summary: Renovar access token
 */
router.post('/refresh', validate(refreshTokenSchema), ctrl.refresh);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Autenticación]
 *     summary: Cerrar sesión
 */
router.post('/logout', validate(refreshTokenSchema), ctrl.logout);

/**
 * @openapi
 * /api/v1/auth/recuperar-password:
 *   post:
 *     tags: [Autenticación]
 *     summary: Recuperar contraseña olvidada
 */
router.post('/recuperar-password', authRateLimiter, validate(recuperarPasswordSchema), ctrl.recuperarPassword);

/**
 * @openapi
 * /api/v1/auth/cambiar-password:
 *   patch:
 *     tags: [Autenticación]
 *     summary: Cambiar contraseña (autenticado)
 *     security:
 *       - bearerAuth: []
 */
router.patch('/cambiar-password', authenticate, validate(cambiarPasswordSchema), ctrl.cambiarPassword);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Autenticación]
 *     summary: Datos del usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, ctrl.me);

export default router;
