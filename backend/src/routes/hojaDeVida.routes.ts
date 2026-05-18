import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import {
  datosPersonalesSchema, datosDemograficosSchema, datosContactoSchema,
  formacionAcademicaSchema, experienciaLaboralSchema, experienciaDocenteSchema,
} from '../validators/hojaDeVida.validators';
import * as ctrl from '../controllers/hojaDeVida.controller';

const router = Router();
router.use(authenticate);

// Resumen completo
router.get('/', ctrl.getHojaDeVida);

// Datos personales y contacto
router.put('/datos-personales', validate(datosPersonalesSchema), ctrl.saveDatosPersonales);
router.put('/datos-demograficos', validate(datosDemograficosSchema), ctrl.saveDatosDemograficos);
router.put('/datos-contacto', validate(datosContactoSchema), ctrl.saveDatosContacto);

// Formación académica
router.post('/formacion', validate(formacionAcademicaSchema), ctrl.createFormacion);
router.put('/formacion/:id', validate(formacionAcademicaSchema), ctrl.updateFormacion);
router.delete('/formacion/:id', ctrl.deleteFormacion);

// Experiencia laboral
router.post('/experiencia-laboral', validate(experienciaLaboralSchema), ctrl.createExperiencia);
router.put('/experiencia-laboral/:id', validate(experienciaLaboralSchema), ctrl.updateExperiencia);
router.delete('/experiencia-laboral/:id', ctrl.deleteExperiencia);

// Experiencia docente
router.post('/experiencia-docente', validate(experienciaDocenteSchema), ctrl.createDocente);
router.put('/experiencia-docente/:id', validate(experienciaDocenteSchema), ctrl.updateDocente);
router.delete('/experiencia-docente/:id', ctrl.deleteDocente);

export default router;
