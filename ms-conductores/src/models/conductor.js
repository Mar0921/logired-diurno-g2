const SEDES_VALIDAS = ['Cali', 'Medellín', 'Bogotá'];
const LICENCIAS_VALIDAS = ['C2', 'C3'];

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim() !== '';

function validarConductor(datos = {}) {
  const errores = [];

  if (!esTextoNoVacio(datos.nombre)) errores.push('nombre es obligatorio');
  if (!esTextoNoVacio(datos.cedula)) errores.push('cedula es obligatoria');
  
  const licencia = String(datos.categoria_licencia || '').toUpperCase().trim();
  if (!LICENCIAS_VALIDAS.includes(licencia)) {
    errores.push(`categoria_licencia debe ser una de: ${LICENCIAS_VALIDAS.join(', ')}`);
  }

  if (!esTextoNoVacio(datos.telefono)) errores.push('telefono es obligatorio');
  if (!SEDES_VALIDAS.includes(datos.sede)) {
    errores.push(`sede debe ser una de: ${SEDES_VALIDAS.join(', ')}`);
  }
  
  return errores;
}

function construirConductor(datos) {
  return {
    nombre: datos.nombre.trim(),
    cedula: datos.cedula.trim(),
    categoria_licencia: String(datos.categoria_licencia).toUpperCase().trim(),
    telefono: datos.telefono.trim(),
    sede: datos.sede
  };
}

module.exports = { validarConductor, construirConductor };