const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM conductores';
  const condiciones = [];
  const valores = [];

  if (filtros.sede) {
    condiciones.push('sede = ?');
    valores.push(filtros.sede);
  }
  if (filtros.ids) {
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }

  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByCedula(cedula) {
  const [filas] = await pool.query('SELECT * FROM conductores WHERE cedula = ?', [cedula]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(conductor) {
  const [resultado] = await pool.query(
    'INSERT INTO conductores (nombre, cedula, categoria_licencia, telefono, sede) VALUES (?, ?, ?, ?, ?)',
    [conductor.nombre, conductor.cedula, conductor.categoria_licencia, conductor.telefono, conductor.sede]
  );
  return findById(resultado.insertId);
}

async function update(id, conductor) {
  const [resultado] = await pool.query(
    'UPDATE conductores SET nombre = ?, cedula = ?, categoria_licencia = ?, telefono = ?, sede = ? WHERE id = ?',
    [conductor.nombre, conductor.cedula, conductor.categoria_licencia, conductor.telefono, conductor.sede, id]
  );
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM conductores WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByCedula, create, update, remove };