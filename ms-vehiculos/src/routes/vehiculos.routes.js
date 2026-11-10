// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y aplica los permisos de LogiRed sobre los vehículos.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/vehiculos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                      // todas las rutas exigen token (401)

// Consultar: cualquier rol autenticado (administrador, despacho, flota)
router.get('/', controller.listar);              // listar (con filtros ?estado, ?tipo, ?ids)
router.get('/:id', controller.obtener);          // obtener un vehículo por id

// Crear, modificar y eliminar: solo administrador y flota (los demás: 403)
router.post('/', requiereRol('administrador', 'flota'), controller.crear);
router.put('/:id', requiereRol('administrador', 'flota'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'flota'), controller.eliminar);

module.exports = router;
