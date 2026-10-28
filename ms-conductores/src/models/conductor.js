// MODELO: atributos de la entidad Conductor y su validación
const SEDES = ['Cali', 'Medellín', 'Bogotá'];

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim() !== '';

// Devuelve un arreglo de errores (vacío si todo está bien)
function validarConductor(datos = {}) {
  const errores = [];

  if (!esTextoNoVacio(datos.nombre)) {
    errores.push('nombre es obligatorio y no puede estar vacío');
  }
  if (!esTextoNoVacio(datos.cedula)) {
    errores.push('cedula es obligatoria y no puede estar vacía');
  }
  if (!esTextoNoVacio(datos.categoria_licencia)) {
    errores.push('categoria_licencia es obligatoria y no puede estar vacía');
  }
  if (!esTextoNoVacio(datos.telefono)) {
    errores.push('telefono es obligatorio y no puede estar vacío');
  }
  if (!SEDES.includes(datos.sede)) {
    errores.push(`sede debe ser una de: ${SEDES.join(', ')}`);
  }
  return errores;
}

// Copia solo los atributos del contrato que envía el cliente
function construirConductor(datos) {
  return {
    nombre: datos.nombre.trim(),
    cedula: datos.cedula.trim(),
    categoria_licencia: datos.categoria_licencia.trim(),
    telefono: datos.telefono.trim(),
    sede: datos.sede
  };
}

module.exports = { SEDES, validarConductor, construirConductor };