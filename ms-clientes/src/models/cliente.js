// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Cliente y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Atributos acordados en el contrato de la API del grupo:
// id, nombre, documento, telefono, email (opcional), ciudad
// =====================================================================

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_VALIDO = /^[0-9+\s-]{7,15}$/;

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarCliente(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del cliente'];
  }
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (!datos.documento || typeof datos.documento !== 'string' || datos.documento.trim() === '') {
    errores.push('documento es obligatorio');
  }
  if (typeof datos.telefono !== 'string' || !TELEFONO_VALIDO.test(datos.telefono.trim())) {
    errores.push('telefono es obligatorio y debe tener entre 7 y 15 caracteres numéricos');
  }
  // email es opcional: solo se valida el formato cuando viene
  if (datos.email !== undefined && datos.email !== null && datos.email !== '') {
    if (typeof datos.email !== 'string' || !EMAIL_VALIDO.test(datos.email.trim())) {
      errores.push('email debe tener un formato válido');
    }
  }
  if (!datos.ciudad || typeof datos.ciudad !== 'string' || datos.ciudad.trim() === '') {
    errores.push('ciudad es obligatoria');
  }
  return errores;
}

// Construye un cliente "limpio" solo con los campos permitidos
function construirCliente(datos) {
  return {
    nombre: datos.nombre.trim(),
    documento: datos.documento.trim(),
    telefono: datos.telefono.trim(),
    email: datos.email ? datos.email.trim().toLowerCase() : null,
    ciudad: datos.ciudad.trim(),
  };
}

module.exports = { validarCliente, construirCliente };
