// INICIO (todos los roles): saludo y resumen de envíos por estado
const yo = exigirSesion();

async function cargarResumen() {
  try {
    const envios = await api('/envios', { base: API_ENVIOS, servicio: 'ms-envios' });
    if (!envios) return;
    document.getElementById('resumen').innerHTML = ESTADOS_ENVIO.map((estado) => `
      <div class="tarjeta"><strong>${envios.filter((e) => e.estado === estado).length}</strong>
      <span>${esc(estado.replace('_', ' '))}</span></div>`).join('');
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  pintarMenu(yo, 'inicio.html');
  document.getElementById('saludo').textContent = `Hola, ${yo.nombre}`;
  cargarResumen();
}
