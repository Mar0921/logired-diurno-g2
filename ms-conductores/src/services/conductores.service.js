// LÓGICA DE NEGOCIO: validaciones y reglas.
const repo = require('../repositories/conductores.repository');
const { validarConductor, construirConductor } = require('../models/conductor');
const HttpError = require('../utils/HttpError');

async function listar(idsParam) {
  let ids = null;
  if (idsParam) {
    ids = idsParam.split(',').map(Number).filter(n => !isNaN(n));
  }
  return repo.findAll(ids);
}

async function obtener(idTexto) {
  if (!/^\d+$/.test(String(idTexto)) || Number(idTexto) < 1) {
    throw new HttpError(400, 'El id debe ser un número entero positivo');
  }
  const conductor = await repo.findById(Number(idTexto));
  if (!conductor) throw new HttpError(404, `No existe un conductor con id ${idTexto}`);
  return conductor;
}

async function crear(datos) {
  // 1. Validar la forma de los datos (Modelo)
  const errores = validarConductor(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  // 2. Construir el registro limpio
  const conductor = construirConductor(datos);

  // 3. REGLA DE NEGOCIO: Validar que la cédula sea única
  const conductorExistente = await repo.findByCedula(conductor.cedula);
  if (conductorExistente) {
    throw new HttpError(409, `Ya existe un conductor con la cédula ${conductor.cedula}`);
  }

  // 4. Guardar
  return repo.create(conductor);
}

module.exports = { listar, obtener, crear };