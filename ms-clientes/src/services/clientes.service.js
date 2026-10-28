// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/clientes.repository');
const { validarCliente, construirCliente } = require('../models/cliente');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  const cliente = await repo.findById(id);
  if (!cliente) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return cliente;
}

async function crear(datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const cliente = construirCliente(datos);

  // Regla de negocio: no puede haber dos clientes con el mismo documento,
  // porque es lo que identifica a la persona o empresa que despacha. 409 = Conflict.
  if (await repo.findByDocumento(cliente.documento)) {
    throw new HttpError(409, `Ya existe un cliente con el documento ${cliente.documento}`);
  }

  return repo.create(cliente);
}

module.exports = { listar, obtener, crear };
