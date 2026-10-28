// LÓGICA DE NEGOCIO: validaciones y reglas. No conoce HTTP ni dónde se guardan los datos.
const repo = require('../repositories/envios.repository');
const { validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/HttpError');

async function listar() {
  return repo.findAll();
}

async function obtener(idTexto) {
  if (!/^\d+$/.test(String(idTexto)) || Number(idTexto) < 1) {
    throw new HttpError(400, 'El id debe ser un número entero positivo');
  }
  const envio = await repo.findById(Number(idTexto));
  if (!envio) throw new HttpError(404, `No existe un envío con id ${idTexto}`);
  return envio;
}

async function crear(datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirEnvio(datos);
  const ahora = new Date();
  envio.fecha_registro = ahora.toLocaleDateString('en-CA'); // AAAA-MM-DD
  // Regla de negocio: el número de guía lo genera el servicio (LR-AAAA-NNNNNN), nunca el cliente
  const todos = await repo.findAll();
  const consecutivo = String(todos.length + 1).padStart(6, '0');
  envio.numero_guia = `LR-${ahora.getFullYear()}-${consecutivo}`;

  return repo.create(envio);
}

module.exports = { listar, obtener, crear };
