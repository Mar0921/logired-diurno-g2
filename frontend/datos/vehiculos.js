// =====================================================================
// DATOS DE EJEMPLO DE VEHÍCULOS (Taller 2)
// Tienen la misma forma que la respuesta de ms-vehiculos descrita en el
// contrato de la API: cada vehículo llega con su objeto conductor, que
// ms-vehiculos compone consultando a ms-conductores.
//   { id, placa, tipo, capacidad_kg, estado, conductor_id,
//     conductor: { id, nombre, telefono } | null }
// conductor_id puede ser null: el vehículo aún no tiene conductor asignado.
// En el Taller 3, cuando el frontend consulte al gateway de Apache,
// este archivo se elimina y los datos llegan de GET /vehiculos.
// =====================================================================
const VEHICULOS_EJEMPLO = [
  { id: 1, placa: 'ABC123', tipo: 'furgon', capacidad_kg: 1500, estado: 'disponible', conductor_id: 1,
    conductor: { id: 1, nombre: 'Carlos Pérez', telefono: '3001234567' } },
  { id: 2, placa: 'XYZ45D', tipo: 'moto', capacidad_kg: 30, estado: 'en_ruta', conductor_id: 2,
    conductor: { id: 2, nombre: 'Ana Gómez', telefono: '3109876543' } },
  { id: 3, placa: 'KLM789', tipo: 'camion', capacidad_kg: 8000, estado: 'mantenimiento', conductor_id: null,
    conductor: null },
  { id: 4, placa: 'DEF456', tipo: 'furgon', capacidad_kg: 1200, estado: 'disponible', conductor_id: 3,
    conductor: { id: 3, nombre: 'Luis Rodríguez', telefono: '3205556677' } },
  { id: 5, placa: 'GHI78E', tipo: 'moto', capacidad_kg: 25, estado: 'disponible', conductor_id: null,
    conductor: null },
];

// Conductores que se pueden asignar en el formulario (id, nombre, telefono).
// En el Taller 3 salen de GET /conductores (ms-conductores) por el gateway.
const CONDUCTORES_ASIGNABLES = [
  { id: 1, nombre: 'Carlos Pérez', telefono: '3001234567' },
  { id: 2, nombre: 'Ana Gómez', telefono: '3109876543' },
  { id: 3, nombre: 'Luis Rodríguez', telefono: '3205556677' },
];
