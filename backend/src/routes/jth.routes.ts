import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import * as ctrl from '../controllers/jth.controller';

const router = Router();
router.use(authenticate, requireRole('JEFE_TALENTO_HUMANO'));

const verificarSchema = z.object({ verificado: z.boolean() });

// Listar todos los servidores con resumen de HV
router.get('/hojas-de-vida', ctrl.listarHojasDeVida);

// HV completa de un servidor específico
router.get('/hojas-de-vida/:usuarioId', ctrl.getHojaDeVidaCompleta);

// Verificar / levantar verificación
router.patch('/formacion/:id/verificar',    validate(verificarSchema), ctrl.verificarFormacion);
router.patch('/experiencia/:id/verificar',  validate(verificarSchema), ctrl.verificarExperiencia);
router.patch('/docente/:id/verificar',      validate(verificarSchema), ctrl.verificarDocente);

export default router;