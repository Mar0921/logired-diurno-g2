// ACCESO A DATOS: único que sabe dónde se guardan los conductores.
const conductores = [
  { id: 1, nombre: 'Carlos Pérez', cedula: '12345678', categoria_licencia: 'C2', telefono: '3001234567', sede: 'Cali' },
  { id: 2, nombre: 'Ana Gómez', cedula: '87654321', categoria_licencia: 'C3', telefono: '3109876543', sede: 'Medellín' },
  { id: 3, nombre: 'Luis Rodríguez', cedula: '11223344', categoria_licencia: 'C2', telefono: '3205556677', sede: 'Bogotá' },
];
let siguienteId = 4;

async function findAll(ids = null) {
  if (ids && Array.isArray(ids) && ids.length > 0) {
    return conductores.filter((c) => ids.includes(c.id));
  }
  return conductores;
}

async function findById(id) {
  return conductores.find((c) => c.id === id) || null;
}

// NUEVA FUNCIÓN: Buscar por cédula para validar que sea única
async function findByCedula(cedula) {
  return conductores.find((c) => c.cedula === cedula) || null;
}

async function create(conductor) {
  const id = siguienteId++;
  const nuevo = { id, ...conductor };
  conductores.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByCedula, create };