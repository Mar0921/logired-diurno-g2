const vehiculos = [
  { id: 1, placa: 'ABC123', tipo: 'furgon', capacidad_kg: 1500, estado: 'disponible', conductor_id: 1 },
  { id: 2, placa: 'XYZ45D', tipo: 'moto', capacidad_kg: 30, estado: 'en_ruta', conductor_id: 2 },
  { id: 3, placa: 'KLM789', tipo: 'camion', capacidad_kg: 8000, estado: 'mantenimiento', conductor_id: null },
];
let siguienteId = 4;

async function findAll() {
  return vehiculos;
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

module.exports = { findAll, findById, findByPlaca, create };
