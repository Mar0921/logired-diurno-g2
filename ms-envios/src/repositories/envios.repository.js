// ACCESO A DATOS: único que sabe dónde se guardan los envíos (memoria en este taller).
// Funciones async: en el Taller 2 pasan a consultar MySQL sin cambiar servicio ni controlador.

const envios = [
  { id: 1, numero_guia: 'LR-2026-000001', cliente_id: 1, peso_kg: 2.5, ciudad_destino: 'Medellín', direccion_destino: 'Carrera 43A # 1-50', estado: 'registrado', fecha_registro: '2026-10-26' },
  { id: 2, numero_guia: 'LR-2026-000002', cliente_id: 2, peso_kg: 10, ciudad_destino: 'Bogotá', direccion_destino: 'Calle 72 # 10-34', estado: 'en_transito', fecha_registro: '2026-10-26' },
  { id: 3, numero_guia: 'LR-2026-000003', cliente_id: 3, peso_kg: 0.8, ciudad_destino: 'Cali', direccion_destino: 'Avenida 6N # 25-10', estado: 'entregado', fecha_registro: '2026-10-25' },
];
let siguienteId = 4;

async function findAll() {
  return envios;
}

async function findById(id) {
  return envios.find((e) => e.id === id) || null;
}

async function create(envio) {
  const id = siguienteId++;
  const nuevo = { id, numero_guia: envio.numero_guia, ...envio };
  envios.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, create };
