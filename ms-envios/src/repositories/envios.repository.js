// src/repositories/envios.repository.js — versión MySQL
// Mismas funciones, mismos parámetros y mismo tipo de resultado que la versión en memoria.
const pool = require('../db');

// filtros.estado: solo devuelve los envíos en ese estado
async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM envios';
  const valores = [];
  if (filtros.estado !== undefined) {
    sql += ' WHERE estado = ?';
    valores.push(filtros.estado);
  }
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM envios WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByNumeroGuia(numeroGuia) {
  const [filas] = await pool.query('SELECT * FROM envios WHERE numero_guia = ?', [numeroGuia]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(envio) {
  const [resultado] = await pool.query(
    `INSERT INTO envios
       (numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [envio.numero_guia, envio.cliente_id, envio.peso_kg, envio.ciudad_destino,
     envio.direccion_destino, envio.estado, envio.fecha_registro]
  );
  return findById(resultado.insertId); // MySQL devuelve el id generado
}

async function update(id, datos) {
  const [resultado] = await pool.query(
    `UPDATE envios
        SET numero_guia = ?, cliente_id = ?, peso_kg = ?,
            ciudad_destino = ?, direccion_destino = ?, estado = ?
      WHERE id = ?`,
    [datos.numero_guia, datos.cliente_id, datos.peso_kg,
     datos.ciudad_destino, datos.direccion_destino, datos.estado, id]
  );
  if (resultado.affectedRows === 0) return null; // no existe
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM envios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNumeroGuia, create, update, remove };