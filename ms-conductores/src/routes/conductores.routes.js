// PRESENTACIÓN: método HTTP + URI -> controlador
const { Router } = require('express');
const controller = require('../controllers/conductores.controller'); 
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));
router.post('/', asyncHandler(controller.crear));

module.exports = router;