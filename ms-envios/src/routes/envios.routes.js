// PRESENTACIÓN: método HTTP + URI -> controlador, con los permisos de la tabla del Taller 1
const { Router } = require('express');
const controller = require('../controllers/envios.controller');
const asyncHandler = require('../utils/asyncHandler');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken); // todas las rutas exigen token

router.get('/', asyncHandler(controller.listar)); // cualquier rol autenticado
router.get('/:id', asyncHandler(controller.obtener));
router.post('/', requiereRol('administrador', 'despacho'), asyncHandler(controller.crear));
router.put('/:id', requiereRol('administrador', 'despacho'), asyncHandler(controller.actualizar));
router.delete('/:id', requiereRol('administrador', 'despacho'), asyncHandler(controller.eliminar));

module.exports = router;