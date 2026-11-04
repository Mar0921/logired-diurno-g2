// src/repositories/vehiculos.repository.js — versión MySQL
// Única capa que sabe DÓNDE se guardan los datos. Las funciones conservan
// el mismo nombre, parámetros y tipo de resultado que la versión en memoria.
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM vehiculos';
  const condiciones = [];
  const valores = [];
  if (filtros.estado) {                    // ?estado=disponible
    condiciones.push('estado = ?');
    valores.push(filtros.estado);
  }
  if (filtros.tipo) {                      // ?tipo=furgon
    condiciones.push('tipo = ?');
    valores.push(filtros.tipo);
  }
  if (filtros.ids) {                       // ?ids=1,2,3 → WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByPlaca(placa) {
  const [filas] = await pool.query('SELECT * FROM vehiculos WHERE placa = ?', [placa]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(vehiculo) {
  const [resultado] = await pool.query(
    'INSERT INTO vehiculos (placa, tipo, capacidad_kg, estado, conductor_id) VALUES (?, ?, ?, ?, ?)',
    [vehiculo.placa, vehiculo.tipo, vehiculo.capacidad_kg, vehiculo.estado, vehiculo.conductor_id]);
  return findById(resultado.insertId);     // MySQL devuelve el id generado
}

async function update(id, vehiculo) {
  const [resultado] = await pool.query(
    'UPDATE vehiculos SET placa = ?, tipo = ?, capacidad_kg = ?, estado = ?, conductor_id = ? WHERE id = ?',
    [vehiculo.placa, vehiculo.tipo, vehiculo.capacidad_kg, vehiculo.estado, vehiculo.conductor_id, id]);
  if (resultado.affectedRows === 0) return null;   // no existía ese id
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByPlaca, create, update, remove };
