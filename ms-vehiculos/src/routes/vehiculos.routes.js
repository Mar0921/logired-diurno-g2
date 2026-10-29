const { Router } = require('express');
const controller = require('../controllers/vehiculos.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los vehículos
router.get('/:id', controller.obtener);  // obtener un vehículo por id
router.post('/', controller.crear);      // crear un vehículo

module.exports = router;
