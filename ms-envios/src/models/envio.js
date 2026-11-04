// MODELO: atributos de la entidad Envío y su validación
const ESTADOS = ['registrado', 'en_transito', 'entregado'];
const FORMATO_GUIA = /^LR-\d{4}-\d{6}$/;

const esTextoNoVacio = (v) => typeof v === 'string' && v.trim() !== '';

// Devuelve un arreglo de errores (vacío si todo está bien).
// completo = true (PUT): numero_guia y estado también son obligatorios.
function validarEnvio(datos = {}, { completo = false } = {}) {
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
  if (datos.estado === undefined ? completo : !ESTADOS.includes(datos.estado)) {
    errores.push(`estado ${completo ? 'es obligatorio y ' : ''}debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  if (datos.numero_guia === undefined ? completo : !FORMATO_GUIA.test(String(datos.numero_guia))) {
    errores.push(`numero_guia ${completo ? 'es obligatorio y ' : ''}debe tener el formato LR-AAAA-NNNNNN`);
  }
  return errores;
}

// Copia solo los atributos del contrato que envía el cliente
function construirEnvio(datos) {
  const envio = {
    cliente_id: datos.cliente_id,
    peso_kg: datos.peso_kg,
    ciudad_destino: datos.ciudad_destino.trim(),
    direccion_destino: datos.direccion_destino.trim(),
    estado: datos.estado === undefined ? 'registrado' : datos.estado,
  };
  if (datos.numero_guia !== undefined) envio.numero_guia = datos.numero_guia;
  return envio;
}

module.exports = { ESTADOS, FORMATO_GUIA, validarEnvio, construirEnvio };