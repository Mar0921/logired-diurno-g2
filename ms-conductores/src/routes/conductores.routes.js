// src/routes/conductores.routes.js
const { Router } = require('express');
const controller = require('../controllers/conductores.controller');
const asyncHandler = require('../utils/asyncHandler');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

// 1. Todas las rutas exigen un token válido (si no, 401)
router.use(verificarToken);

// 2. Cualquier rol autenticado puede consultar (GET)
router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));

// 3. Solo administrador y flota pueden crear, editar o borrar (POST, PUT, DELETE)
router.post('/', requiereRol('administrador', 'flota'), asyncHandler(controller.crear));
router.put('/:id', requiereRol('administrador', 'flota'), asyncHandler(controller.actualizar));
router.delete('/:id', requiereRol('administrador', 'flota'), asyncHandler(controller.eliminar));

module.exports = router;