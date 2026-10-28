// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'Distribuidora El Valle', documento: '900456789-1', telefono: '3155678901', email: 'contacto@distribuidoraelvalle.com', ciudad: 'Cali' },
  { id: 2, nombre: 'Almacenes del Pacifico', documento: '901234567-5', telefono: '3182345678', email: 'compras@almacenespacifico.com', ciudad: 'Buenaventura' },
  { id: 3, nombre: 'Carolina Mejia Londoño', documento: '1144556677', telefono: '3017654321', email: 'carolina.mejia@correo.com', ciudad: 'Medellin' },
  { id: 4, nombre: 'Textiles Andinos', documento: '860098765-3', telefono: '6013456789', email: 'logistica@textilesandinos.com', ciudad: 'Bogota' },
];
let siguienteId = 5;

async function findAll() {
  return clientes;
}

async function findById(id) {
  return clientes.find((c) => c.id === id) || null;
}

async function findByDocumento(documento) {
  return clientes.find((c) => c.documento === documento) || null;
}

async function create(cliente) {
  const nuevo = { id: siguienteId++, ...cliente };
  clientes.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByDocumento, create };
