// MODELO: atributos de la entidad Conductor y su validación
const SEDES = ['Cali', 'Medellín', 'Bogotá'];
const LICENCIAS_VALIDAS = ['C2', 'C3']; // Regla: solo licencias de carga

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim() !== '';

function validarConductor(datos = {}) {
  const errores = [];

  if (!esTextoNoVacio(datos.nombre)) {
    errores.push('nombre es obligatorio y no puede estar vacío');
  }
  if (!esTextoNoVacio(datos.cedula)) {
    errores.push('cedula es obligatoria y no puede estar vacía');
  }
  
  // Validación de la licencia (ignorando mayúsculas/minúsculas)
  const licenciaIngresada = String(datos.categoria_licencia || '').toUpperCase().trim();
  if (!LICENCIAS_VALIDAS.includes(licenciaIngresada)) {
    errores.push(`categoria_licencia debe ser una de: ${LICENCIAS_VALIDAS.join(', ')}`);
  }

  if (!esTextoNoVacio(datos.telefono)) {
    errores.push('telefono es obligatorio y no puede estar vacío');
  }
  if (!SEDES.includes(datos.sede)) {
    errores.push(`sede debe ser una de: ${SEDES.join(', ')}`);
  }
  return errores;
}

function construirConductor(datos) {
  return {
    nombre: datos.nombre.trim(),
    cedula: datos.cedula.trim(),
    categoria_licencia: String(datos.categoria_licencia).toUpperCase().trim(), // Forzamos mayúscula
    telefono: datos.telefono.trim(),
    sede: datos.sede
  };
}

module.exports = { SEDES, LICENCIAS_VALIDAS, validarConductor, construirConductor };