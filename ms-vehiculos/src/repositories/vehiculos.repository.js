// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión en memoria (se pierden al reiniciar). En la Parte 3 se
// reemplaza por MySQL SIN tocar las otras capas.
// =====================================================================
const vehiculos = [
  { id: 1, placa: 'ABC123', tipo: 'furgon', capacidad_kg: 1500, estado: 'disponible', conductor_id: 1 },
  { id: 2, placa: 'XYZ45D', tipo: 'moto', capacidad_kg: 30, estado: 'en_ruta', conductor_id: 2 },
  { id: 3, placa: 'KLM789', tipo: 'camion', capacidad_kg: 8000, estado: 'mantenimiento', conductor_id: null },
];
let siguienteId = 4;

// Aplica los filtros que lleguen: estado, tipo, ids
async function findAll(filtros = {}) {
  let resultado = vehiculos;
  if (filtros.estado) resultado = resultado.filter((v) => v.estado === filtros.estado);
  if (filtros.tipo) resultado = resultado.filter((v) => v.tipo === filtros.tipo);
  if (filtros.ids) resultado = resultado.filter((v) => filtros.ids.includes(v.id));
  return resultado;
}

async function findById(id) {
  return vehiculos.find((v) => v.id === id) || null;
}

async function findByPlaca(placa) {
  return vehiculos.find((v) => v.placa === placa) || null;
}

async function create(vehiculo) {
  const nuevo = { id: siguienteId++, ...vehiculo };
  vehiculos.push(nuevo);
  return nuevo;
}

// Reemplaza los datos del vehículo. Devuelve null si no existe.
async function update(id, vehiculo) {
  const i = vehiculos.findIndex((v) => v.id === id);
  if (i === -1) return null;
  vehiculos[i] = { id, ...vehiculo };
  return vehiculos[i];
}

// Elimina el vehículo. Devuelve true si existía, false si no.
async function remove(id) {
  const i = vehiculos.findIndex((v) => v.id === id);
  if (i === -1) return false;
  vehiculos.splice(i, 1);
  return true;
}

module.exports = { findAll, findById, findByPlaca, create, update, remove };
