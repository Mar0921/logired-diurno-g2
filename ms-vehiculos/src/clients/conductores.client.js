// =====================================================================
// CLIENTE HTTP de ms-conductores: la única parte de ms-vehiculos que sabe
// cómo hablar con otro microservicio (análogo al repositorio).
// =====================================================================
const HttpError = require('../utils/http-error');
const CONDUCTORES_URL = process.env.CONDUCTORES_URL;

// Hace la petición reenviando el token del usuario. null si no hubo respuesta.
async function pedir(ruta, token) {
  try {
    return await fetch(`${CONDUCTORES_URL}${ruta}`, {
      headers: { Authorization: token },        // el token de la petición original
      signal: AbortSignal.timeout(3000),         // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                                 // ms-conductores caído o sin responder
  }
}

// VALIDACIÓN: ¿existe el conductor? Si ms-conductores no responde → 503
async function existeConductor(id, token) {
  const respuesta = await pedir(`/conductores/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'ms-conductores no está disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) {
    throw new HttpError(502, `ms-conductores respondió ${respuesta.status}`);
  }
  return true;
}

// COMPOSICIÓN: varios conductores en UNA petición → Map id → conductor (null si no responde)
async function conductoresPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/conductores?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const conductores = await respuesta.json();
  return new Map(conductores.map((c) =>
    [c.id, { id: c.id, nombre: c.nombre, telefono: c.telefono }]));
}

module.exports = { existeConductor, conductoresPorIds };
