// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/vehiculos.repository');
const { validarVehiculo, construirVehiculo } = require('../models/vehiculo');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const vehiculo = await repo.findById(id);
  if (!vehiculo) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  return vehiculo;
}

async function crear(datos) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const vehiculo = construirVehiculo(datos);

  // Regla de negocio: no puede haber dos vehículos con la misma placa
  // (la placa identifica al vehículo en la vida real). 409 = Conflict.
  if (await repo.findByPlaca(vehiculo.placa)) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }

  return repo.create(vehiculo);
}

async function actualizar(id, datos) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const vehiculo = construirVehiculo(datos);

  // Misma regla de la placa, pero el vehículo sí puede conservar su propia placa
  const otro = await repo.findByPlaca(vehiculo.placa);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }

  const actualizado = await repo.update(id, vehiculo);
  if (!actualizado) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el vehículo con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
