// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/vehiculos.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los vehículos
router.get('/:id', controller.obtener);  // obtener un vehículo por id
router.post('/', controller.crear);      // crear un vehículo

// Taller 2: agregar PUT /:id (actualizar) y DELETE /:id (eliminar)

module.exports = router;
