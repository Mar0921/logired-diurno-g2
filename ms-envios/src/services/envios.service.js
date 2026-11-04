// LÓGICA DE NEGOCIO: validaciones y reglas. No conoce HTTP ni dónde se guardan los datos.
const repo = require('../repositories/envios.repository');
const { ESTADOS, validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/HttpError');
 
function leerId(idTexto) {
  if (!/^\d+$/.test(String(idTexto)) || Number(idTexto) < 1) {
    throw new HttpError(400, 'El id debe ser un número entero positivo');
  }
  return Number(idTexto);
}
 
// Genera LR-AAAA-NNNNNN sin repetir ninguno existente
async function generarNumeroGuia() {
  let n = (await repo.findAll()).length + 1;
  const anio = new Date().getFullYear();
  let guia;
  do {
    guia = `LR-${anio}-${String(n++).padStart(6, '0')}`;
  } while (await repo.findByNumeroGuia(guia));
  return guia;
}
 
async function listar(filtros = {}) {
  if (filtros.estado !== undefined && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return repo.findAll(filtros);
}
 
async function obtener(idTexto) {
  const id = leerId(idTexto);
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe un envío con id ${id}`);
  return envio;
}
 
async function crear(datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
 
  const envio = construirEnvio(datos);
  if (envio.numero_guia) {
    // Regla de negocio: el número de guía no se puede repetir
    if (await repo.findByNumeroGuia(envio.numero_guia)) {
      throw new HttpError(409, `Ya existe un envío con el numero_guia ${envio.numero_guia}`);
    }
  } else {
    envio.numero_guia = await generarNumeroGuia();
  }
  envio.fecha_registro = new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD
  return repo.create(envio);
}
 
async function actualizar(idTexto, datos) {
  const id = leerId(idTexto);
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe un envío con id ${id}`);
 
  const errores = validarEnvio(datos, { completo: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
 
  const envio = construirEnvio(datos);
  const otro = await repo.findByNumeroGuia(envio.numero_guia);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un envío con el numero_guia ${envio.numero_guia}`);
  }
  envio.fecha_registro = existente.fecha_registro; // no cambia
  return repo.update(id, envio);
}
 
async function eliminar(idTexto) {
  const id = leerId(idTexto);
  if (!(await repo.remove(id))) throw new HttpError(404, `No existe un envío con id ${id}`);
}
 
module.exports = { listar, obtener, crear, actualizar, eliminar };
 
