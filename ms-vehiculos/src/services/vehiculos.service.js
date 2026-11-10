// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/vehiculos.repository');
const { validarVehiculo, construirVehiculo } = require('../models/vehiculo');
const HttpError = require('../utils/http-error');
const conductoresClient = require('../clients/conductores.client');

// Relación: el conductor referenciado debe existir en ms-conductores.
// Si conductor_id es null (vehículo sin conductor asignado) no hay nada que validar.
async function validarConductor(conductorId, token) {
  if (conductorId === null) return;
  if (!(await conductoresClient.existeConductor(conductorId, token))) {
    throw new HttpError(400, `No existe el conductor con id ${conductorId}`);
  }
}

// Agrega a cada vehículo su objeto conductor, con UNA sola consulta a ms-conductores
async function componer(vehiculos, token) {
  const ids = [...new Set(vehiculos.map((v) => v.conductor_id).filter((id) => id !== null))];
  const conductores = await conductoresClient.conductoresPorIds(ids, token);
  if (!conductores) {                              // degradación controlada
    return vehiculos.map((v) => (v.conductor_id === null
      ? { ...v, conductor: null }
      : { ...v, conductor: null, aviso: 'ms-conductores no disponible' }));
  }
  return vehiculos.map((v) => ({ ...v, conductor: conductores.get(v.conductor_id) || null }));
}

async function listar(filtros, token) {
  return componer(await repo.findAll(filtros), token);
}

async function obtener(id, token) {
  const vehiculo = await repo.findById(id);
  if (!vehiculo) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  const [compuesto] = await componer([vehiculo], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const vehiculo = construirVehiculo(datos);

  // Regla de negocio: no puede haber dos vehículos con la misma placa
  // (la placa identifica al vehículo en la vida real). 409 = Conflict.
  if (await repo.findByPlaca(vehiculo.placa)) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }
  await validarConductor(vehiculo.conductor_id, token);

  const nuevo = await repo.create(vehiculo);
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const vehiculo = construirVehiculo(datos);

  // Misma regla de la placa, pero el vehículo sí puede conservar su propia placa
  const otro = await repo.findByPlaca(vehiculo.placa);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }
  await validarConductor(vehiculo.conductor_id, token);

  const actualizado = await repo.update(id, vehiculo);
  if (!actualizado) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el vehículo con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
