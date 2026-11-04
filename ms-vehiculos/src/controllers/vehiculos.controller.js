// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, query, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/vehiculos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /vehiculos, ?estado=disponible, ?tipo=furgon, ?ids=1,3
async function listar(req, res) {
  const filtros = { estado: req.query.estado, tipo: req.query.tipo };
  if (req.query.ids) {                    // ?ids=1,3 → [1, 3]
    filtros.ids = String(req.query.ids).split(',').map(Number);
    if (filtros.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new HttpError(400, 'ids debe ser una lista de enteros separados por comas');
    }
  }
  const vehiculos = await service.listar(filtros);
  res.status(200).json(vehiculos);
}

// GET /vehiculos/:id
async function obtener(req, res) {
  const vehiculo = await service.obtener(leerId(req));
  res.status(200).json(vehiculo);
}

// POST /vehiculos
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /vehiculos/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body);
  res.status(200).json(actualizado);
}

// DELETE /vehiculos/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();                  // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
