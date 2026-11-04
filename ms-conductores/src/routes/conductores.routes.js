const { Router } = require('express');
const controller = require('../controllers/conductores.controller');
const asyncHandler = require('../utils/asyncHandler'); // <-- Importante

const router = Router();

router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));
router.post('/', asyncHandler(controller.crear));
router.put('/:id', asyncHandler(controller.actualizar));
router.delete('/:id', asyncHandler(controller.eliminar));

module.exports = router;