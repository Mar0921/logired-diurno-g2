// =====================================================================
// PANTALLA DE ENVÍOS (todos los roles ven; administrador y despacho modifican)
// Usa: GET /envios, POST /envios, PUT /envios/:id, DELETE /envios/:id
// El nombre y la ciudad del cliente llegan compuestos por ms-envios.
// =====================================================================
const yo = exigirSesion();
const puedeEscribir = yo && ROLES_ESCRIBEN_ENVIOS.includes(yo.rol);
const ENV = { base: API_ENVIOS, servicio: 'ms-envios' };
let envios = [];

const camposEnvio = (editando) => [
  ...(editando ? [{ nombre: 'numero_guia', etiqueta: 'Número de guía' }] : []),
  { nombre: 'cliente_id', etiqueta: 'ID del cliente', ayuda: 'Ej.: 1' },
  { nombre: 'peso_kg', etiqueta: 'Peso (kg)', ayuda: 'Ej.: 2.5' },
  { nombre: 'ciudad_destino', etiqueta: 'Ciudad de destino' },
  { nombre: 'direccion_destino', etiqueta: 'Dirección de destino' },
  { nombre: 'estado', etiqueta: 'Estado', tipo: 'select',
    opciones: ESTADOS_ENVIO.map((e) => ({ valor: e, texto: e })) },
];

// El formulario entrega texto; la API espera números
const aCuerpo = (d) => ({ ...d, cliente_id: Number(d.cliente_id), peso_kg: Number(d.peso_kg) });

const ETIQUETA_ESTADO = (e) => e.replace('_', ' ');
let estadoActivo = '';   // '' = todos
let texto = '';

function visibles() {
  const t = texto.trim().toLowerCase();
  return envios.filter((e) =>
    (!estadoActivo || e.estado === estadoActivo) &&
    (!t || [e.numero_guia, e.ciudad_destino, e.direccion_destino, e.cliente?.nombre]
      .some((v) => String(v ?? '').toLowerCase().includes(t))));
}

function pintarChips() {
  const opciones = [['', 'Todos', envios.length],
    ...ESTADOS_ENVIO.map((s) => [s, ETIQUETA_ESTADO(s), envios.filter((e) => e.estado === s).length])];
  document.getElementById('chips').innerHTML = opciones.map(([valor, nombre, n]) =>
    `<button type="button" class="chip${valor === estadoActivo ? ' activo' : ''}" data-estado="${valor}">
       ${esc(nombre)} <span class="cuenta">${n}</span></button>`).join('');
}

function filaCliente(e) {
  if (!e.cliente) return `<span class="sub">Cliente #${esc(e.cliente_id)} (sin datos)</span>`;
  return `<div class="cliente"><span class="avatar">${esc(e.cliente.nombre.charAt(0).toUpperCase())}</span>
    <div>${esc(e.cliente.nombre)}<br><span class="sub">${esc(e.cliente.ciudad)}</span></div></div>`;
}

function pintar() {
  const lista = visibles();
  document.getElementById('resumen').textContent = lista.length === envios.length
    ? `${envios.length} envíos` : `${lista.length} de ${envios.length} envíos`;
  pintarChips();
  document.getElementById('lista').innerHTML = lista.length ? lista.map((e) => `
    <tr>
      <td data-etiqueta="Guía">${esc(e.numero_guia)}</td>
      <td data-etiqueta="Cliente">${filaCliente(e)}</td>
      <td data-etiqueta="Destino">${esc(e.ciudad_destino)}<br><span class="sub">${esc(e.direccion_destino)}</span></td>
      <td data-etiqueta="Peso">${esc(Number(e.peso_kg).toLocaleString('es-CO'))} kg</td>
      <td data-etiqueta="Estado"><span class="estado estado-${esc(e.estado)}">${esc(ETIQUETA_ESTADO(e.estado))}</span></td>
      ${puedeEscribir ? `<td class="acciones">
        <button class="boton boton-suave" data-editar="${e.id}">Editar</button>
        <button class="boton boton-peligro" data-eliminar="${e.id}">Eliminar</button></td>` : ''}
    </tr>`).join('') : `<tr><td class="vacio" colspan="${puedeEscribir ? 6 : 5}">
      ${envios.length ? 'Ningún envío coincide con la búsqueda.' : 'Todavía no hay envíos registrados.'}</td></tr>`;
  // Degradación: ms-envios responde igual si ms-clientes está caído
  if (envios.some((e) => e.aviso)) {
    mostrarMensaje('ms-clientes no está disponible: se muestran los envíos sin los datos del cliente', 'error');
  }
}

async function cargar() {
  try {
    envios = await api('/envios', ENV) || [];
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de envíos.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Crear envío', camposEnvio(false), { estado: 'registrado' }, 'Crear envío');
  if (!datos) return;
  try {
    const nuevo = await api('/envios', { ...ENV, method: 'POST', body: aCuerpo(datos) });
    mostrarMensaje(`Envío creado: ${nuevo.numero_guia}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

async function editar(e) {
  const datos = await pedirDatos('Editar envío', camposEnvio(true), e);
  if (!datos) return;
  try {
    await api(`/envios/${e.id}`, { ...ENV, method: 'PUT', body: aCuerpo(datos) });
    mostrarMensaje('Cambios guardados');
    cargar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(e) {
  if (!(await confirmar(`¿Eliminar el envío ${e.numero_guia}?`, 'Eliminar envío'))) return;
  try {
    await api(`/envios/${e.id}`, { ...ENV, method: 'DELETE' });
    mostrarMensaje(`Envío eliminado: ${e.numero_guia}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  pintarMenu(yo, 'envios.html');
  // Los botones se ocultan según el rol; el permiso real lo exige ms-envios (403)
  document.getElementById('nuevo').hidden = !puedeEscribir;
  document.getElementById('col-acciones').hidden = !puedeEscribir;
  document.getElementById('nuevo').onclick = crear;
  document.getElementById('chips').onclick = (evento) => {
    const boton = evento.target.closest('[data-estado]');
    if (!boton) return;
    estadoActivo = boton.dataset.estado;
    pintar();
  };
  document.getElementById('buscar').oninput = (evento) => { texto = evento.target.value; pintar(); };
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const e = envios.find((x) => x.id === Number(idEditar || idEliminar));
    if (e && idEditar) editar(e);
    if (e && idEliminar) eliminar(e);
  };
  cargar();
}