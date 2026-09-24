import { Router } from 'express';
import mongoose from 'mongoose';
import * as controller from '../controllers/entregas.js';
import Materia from '../models/Materia.js';
import { validarMateria } from '../validation.js';
const router = Router();
router.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' });
});
router.get('/materias', async (req, res) => res.json(await Materia.find().sort({ nombre: 1 })));
router.post('/materias', async (req, res) => res.status(201).json(await Materia.create(validarMateria(req.body))));
router.route('/entregas').get(controller.listar).post(controller.crear);
router.route('/entregas/:id').get(controller.obtener).put(controller.actualizar).delete(controller.eliminar);
export default router;
