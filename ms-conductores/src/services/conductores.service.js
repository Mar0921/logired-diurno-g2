// LÓGICA DE NEGOCIO: validaciones y reglas. No conoce HTTP ni dónde se guardan los datos.
const repo = require('../repositories/conductores.repository');
const { validarConductor, construirConductor } = require('../models/conductor');
const HttpError = require('../utils/HttpError');

// Recibe el parámetro de la URL (ej. "1,2,3") y lo procesa
async function listar(idsParam) {
  let ids = null;
  if (idsParam) {
    // Convierte "1,2,3" en [1, 2, 3] y filtra nulos si hay errores de tipeo
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
  const errores = validarConductor(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const conductor = construirConductor(datos);
  return repo.create(conductor);
}

module.exports = { listar, obtener, crear };