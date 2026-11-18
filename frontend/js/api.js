// =====================================================================
// API: TODAS las llamadas a los microservicios pasan por aquí.
//   api('/usuarios')                                         → ms-usuarios (por defecto)
//   api('/envios', { base: API_ENVIOS, servicio: 'ms-envios' }) → ms-envios
//   api('/envios', { base: API_ENVIOS, servicio: 'ms-envios', method: 'POST', body: {...} })
// Agrega el token, convierte la respuesta en JSON y, si hay error,
// lanza un ErrorApi con el código y el mensaje del microservicio.
// =====================================================================
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles || [];
  }
}

async function api(ruta, opciones = {}) {
  const base = opciones.base || API_USUARIOS;
  const servicio = opciones.servicio || 'ms-usuarios';
  const token = sessionStorage.getItem('token');
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${base}${ruta}`, {
      method: opciones.method || 'GET',
      headers: cabeceras,
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch (error) {
    // No hubo respuesta: el microservicio está apagado o CORS no está activo
    throw new ErrorApi(0, `No hay conexión con ${servicio}. ¿Está corriendo?`);
  }

  if (respuesta.status === 401 && ruta !== '/login') {
    cerrarSesion();                    // sin sesión o token vencido: volver a entrar
    return null;
  }
  // El gateway responde 503 en HTML cuando el microservicio está caído,
  // así que la respuesta puede no ser JSON.
  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(
      respuesta.status,
      (datos && datos.error) || `El servicio no está disponible (${respuesta.status})`,
      datos && datos.detalles,
    );
  }
  return datos;
}
