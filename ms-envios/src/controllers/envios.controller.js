// PRESENTACIÓN: HTTP <-> servicio
const service = require('../services/envios.service');

async function listar(req, res) {
  res.status(200).json(await service.listar());
}

async function obtener(req, res) {
  res.status(200).json(await service.obtener(req.params.id));
}

async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

module.exports = { listar, obtener, crear };
