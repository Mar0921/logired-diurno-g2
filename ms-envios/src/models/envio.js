// MODELO: atributos de la entidad Envío y su validación
const ESTADOS = ['registrado', 'en_transito', 'entregado'];

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim() !== '';

// Devuelve un arreglo de errores (vacío si todo está bien)
function validarEnvio(datos = {}) {
  const errores = [];

  if (!Number.isInteger(datos.cliente_id) || datos.cliente_id < 1) {
    errores.push('cliente_id es obligatorio y debe ser un entero positivo');
  }
  if (typeof datos.peso_kg !== 'number' || !Number.isFinite(datos.peso_kg) || datos.peso_kg <= 0) {
    errores.push('peso_kg es obligatorio y debe ser un número mayor que 0');
  }
  if (!esTextoNoVacio(datos.ciudad_destino)) {
    errores.push('ciudad_destino es obligatoria y no puede estar vacía');
  }
  if (!esTextoNoVacio(datos.direccion_destino)) {
    errores.push('direccion_destino es obligatoria y no puede estar vacía');
  }
  if (datos.estado !== undefined && !ESTADOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return errores;
}

// Copia solo los atributos del contrato que envía el cliente
function construirEnvio(datos) {
  return {
    cliente_id: datos.cliente_id,
    peso_kg: datos.peso_kg,
    ciudad_destino: datos.ciudad_destino.trim(),
    direccion_destino: datos.direccion_destino.trim(),
    estado: datos.estado === undefined ? 'registrado' : datos.estado,
  };
}

module.exports = { ESTADOS, validarEnvio, construirEnvio };
