// LÓGICA DE NEGOCIO: validaciones y reglas. No conoce HTTP ni dónde se guardan los datos.
const repo = require('../repositories/envios.repository');
const clientesClient = require('../clients/clientes.client');
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

// Relación: el cliente referenciado debe existir en ms-clientes
async function validarCliente(clienteId, token) {
  if (!(await clientesClient.existeCliente(clienteId, token))) {
    throw new HttpError(400, `No existe el cliente con id ${clienteId}`);
  }
}

// Agrega a cada envío su objeto cliente, con UNA sola consulta a ms-clientes
async function componer(envios, token) {
  const ids = [...new Set(envios.map((e) => e.cliente_id))];
  const clientes = await clientesClient.clientesPorIds(ids, token);
  if (!clientes) { // degradación controlada
    return envios.map((e) =>
      ({ ...e, cliente: null, aviso: 'ms-clientes no disponible' }));
  }
  return envios.map((e) => ({ ...e, cliente: clientes.get(e.cliente_id) || null }));
}

async function listar(filtros = {}, token) {
  if (filtros.estado !== undefined && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return componer(await repo.findAll(filtros), token);
}

async function obtener(idTexto, token) {
  const id = leerId(idTexto);
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe un envío con id ${id}`);
  const [compuesto] = await componer([envio], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  await validarCliente(datos.cliente_id, token); // 400 si no existe, 503 si ms-clientes no responde

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
  const nuevo = await repo.create(envio);
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(idTexto, datos, token) {
  const id = leerId(idTexto);
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe un envío con id ${id}`);

  const errores = validarEnvio(datos, { completo: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  await validarCliente(datos.cliente_id, token);

  const envio = construirEnvio(datos);
  const otro = await repo.findByNumeroGuia(envio.numero_guia);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un envío con el numero_guia ${envio.numero_guia}`);
  }
  envio.fecha_registro = existente.fecha_registro; // no cambia
  const actualizado = await repo.update(id, envio);
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(idTexto) {
  const id = leerId(idTexto);
  if (!(await repo.remove(id))) throw new HttpError(404, `No existe un envío con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };