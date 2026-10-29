// LÓGICA DE NEGOCIO: validaciones y reglas.
// No conoce HTTP ni dónde se guardan los datos.

const repo = require('../repositories/envios.repository');
const {
  validarEnvio,
  construirEnvio
} = require('../models/envio');
const HttpError = require('../utils/HttpError');

async function listar() {
  return repo.findAll();
}

async function obtener(idTexto) {
  if (!/^\d+$/.test(String(idTexto)) || Number(idTexto) < 1) {
    throw new HttpError(
      400,
      'El id debe ser un número entero positivo'
    );
  }

  const envio = await repo.findById(Number(idTexto));

  if (!envio) {
    throw new HttpError(
      404,
      `No existe un envío con id ${idTexto}`
    );
  }

  return envio;
}

async function crear(datos) {
  // 1. Validar los datos del envío
  const errores = validarEnvio(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  // 2. Construir el objeto de envío
  const envio = construirEnvio(datos);

  // 3. Consultar los envíos existentes
  const todos = await repo.findAll();

  // 4. Comprobar si ya existe un envío con los mismos datos
  const duplicado = todos.find((existente) => {
    return (
      Number(existente.cliente_id) === Number(envio.cliente_id) &&
      Number(existente.peso_kg) === Number(envio.peso_kg) &&
      String(existente.ciudad_destino).trim().toLowerCase() ===
        String(envio.ciudad_destino).trim().toLowerCase() &&
      String(existente.direccion_destino).trim().toLowerCase() ===
        String(envio.direccion_destino).trim().toLowerCase()
    );
  });

  // 5. Si está duplicado, generar el error 409
  if (duplicado) {
    throw new HttpError(
      409,
      'Ya existe un envío registrado con los mismos datos'
    );
  }

  // 6. Generar la fecha de registro
  const ahora = new Date();

  envio.fecha_registro = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, '0'),
    String(ahora.getDate()).padStart(2, '0')
  ].join('-');

  // 7. Generar el número de guía automáticamente
  const anio = ahora.getFullYear();

  const guiasDelAnio = todos.filter((e) =>
    String(e.numero_guia).startsWith(`LR-${anio}-`)
  );

  const mayorConsecutivo = guiasDelAnio.reduce((mayor, e) => {
    const coincidencia = String(e.numero_guia).match(
      new RegExp(`^LR-${anio}-(\\d{6})$`)
    );

    return coincidencia
      ? Math.max(mayor, Number(coincidencia[1]))
      : mayor;
  }, 0);

  const consecutivo = String(mayorConsecutivo + 1).padStart(6, '0');

  envio.numero_guia = `LR-${anio}-${consecutivo}`;

  // 8. Guardar el envío si no está duplicado
  return repo.create(envio);
}

module.exports = {
  listar,
  obtener,
  crear
};