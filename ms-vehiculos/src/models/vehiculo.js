// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Vehículo y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// conductor_id es una REFERENCIA a ms-conductores: aquí solo se valida
// el formato (entero positivo o null). Que el conductor exista se
// verifica por REST en el Taller 3.
// =====================================================================

const TIPOS = ['moto', 'furgon', 'camion'];
const ESTADOS = ['disponible', 'en_ruta', 'mantenimiento'];

// Placa colombiana: carros/camiones ABC123, motos ABC12D
const PLACA_VALIDA = /^[A-Z]{3}[0-9]{2}[A-Z0-9]$/;

function normalizarPlaca(placa) {
  return placa.trim().toUpperCase().replace(/[\s-]/g, '');
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarVehiculo(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del vehículo'];
  }
  if (typeof datos.placa !== 'string' || !PLACA_VALIDA.test(normalizarPlaca(datos.placa))) {
    errores.push('placa es obligatoria y debe tener formato ABC123 (o ABC12D para motos)');
  }
  if (!TIPOS.includes(datos.tipo)) {
    errores.push(`tipo debe ser uno de: ${TIPOS.join(', ')}`);
  }
  if (typeof datos.capacidad_kg !== 'number' || !(datos.capacidad_kg > 0)) {
    errores.push('capacidad_kg es obligatoria y debe ser un número mayor que 0');
  }
  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  if (
    datos.conductor_id !== undefined &&
    datos.conductor_id !== null &&
    !(Number.isInteger(datos.conductor_id) && datos.conductor_id > 0)
  ) {
    errores.push('conductor_id debe ser un entero positivo o null (sin conductor asignado)');
  }
  return errores;
}

// Construye un vehículo "limpio" solo con los campos permitidos
function construirVehiculo(datos) {
  return {
    placa: normalizarPlaca(datos.placa),
    tipo: datos.tipo,
    capacidad_kg: datos.capacidad_kg,
    estado: datos.estado === undefined ? 'disponible' : datos.estado,
    conductor_id: datos.conductor_id === undefined ? null : datos.conductor_id,
  };
}

module.exports = { validarVehiculo, construirVehiculo, TIPOS, ESTADOS };
