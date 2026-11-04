const repo = require('../repositories/conductores.repository');
const { validarConductor, construirConductor } = require('../models/conductor');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const conductor = await repo.findById(id);
  // Mensaje estandarizado igual a ms-envios
  if (!conductor) throw new HttpError(404, `No existe un conductor con id ${id}`);
  return conductor;
}

async function crear(datos) {
  // Validación estructural (400)
  const errores = validarConductor(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const conductor = construirConductor(datos);

  // Regla de negocio (409) - Mismo formato que ms-usuarios con el email
  if (await repo.findByCedula(conductor.cedula)) {
    throw new HttpError(409, `Ya existe un conductor con la cédula ${conductor.cedula}`);
  }

  return repo.create(conductor);
}

async function actualizar(id, datos) {
  const errores = validarConductor(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  
  const conductor = construirConductor(datos);

  const conductorExistente = await repo.findByCedula(conductor.cedula);
  if (conductorExistente && conductorExistente.id !== id) {
    throw new HttpError(409, `La cédula ${conductor.cedula} ya está registrada por otro conductor`);
  }

  const actualizado = await repo.update(id, conductor);
  if (!actualizado) throw new HttpError(404, `No existe un conductor con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe un conductor con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };