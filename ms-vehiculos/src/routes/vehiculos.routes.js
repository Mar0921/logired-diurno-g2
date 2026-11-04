// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/vehiculos.controller');

const router = Router();

router.get('/', controller.listar);            // listar (con filtros ?estado, ?tipo, ?ids)
router.get('/:id', controller.obtener);        // obtener un vehículo por id
router.post('/', controller.crear);            // crear un vehículo
router.put('/:id', controller.actualizar);     // actualizar un vehículo
router.delete('/:id', controller.eliminar);    // eliminar un vehículo

module.exports = router;
