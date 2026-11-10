// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y decide qué rutas exigen token y quién puede usarlas.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken); // todas las rutas exigen token

router.get('/', controller.listar); // cualquier rol autenticado
router.get('/:id', controller.obtener); // cualquier rol autenticado

router.post('/', requiereRol('administrador', 'despacho'), controller.crear);
router.put('/:id', requiereRol('administrador', 'despacho'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'despacho'), controller.eliminar);

module.exports = router;