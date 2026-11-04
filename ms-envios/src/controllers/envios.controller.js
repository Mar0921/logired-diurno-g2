// PRESENTACIÓN: HTTP <-> servicio
const service = require('../services/envios.service');

async function listar(req, res) {
  const filtros = { estado: req.query.estado };
  res.status(200).json(await service.listar(filtros));
}

async function obtener(req, res) {
  res.status(200).json(await service.obtener(req.params.id));
}

async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

async function actualizar(req, res) {
  res.status(200).json(await service.actualizar(req.params.id, req.body));
}

async function eliminar(req, res) {
  await service.eliminar(req.params.id);
  res.status(204).end(); // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };