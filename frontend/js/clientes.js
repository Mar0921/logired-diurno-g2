// =====================================================================
// PANTALLA DE CLIENTES
// Consultan todos los roles; crean, editan y eliminan administrador y despacho.
// Taller 2: los datos salen del archivo de ejemplo datos/clientes.js.
// Taller 3: los mismos datos llegarán de ms-clientes por el gateway.
// =====================================================================
const yo = exigirSesion();
const puedeEscribir = yo && ROLES_ESCRIBEN_CLIENTES.includes(yo.rol);

let clientes = [];
let ciudadActiva = '';   // '' = todas
let texto = '';

// Los mismos atributos del contrato de la API: email es el único opcional
const CAMPOS = [
  { nombre: 'nombre', etiqueta: 'Nombre', ayuda: 'Ej.: Distribuidora El Valle' },
  { nombre: 'documento', etiqueta: 'Documento', ayuda: 'Ej.: 900456789-1' },
  { nombre: 'telefono', etiqueta: 'Teléfono', tipo: 'tel', ayuda: 'Ej.: 3155678901' },
  { nombre: 'email', etiqueta: 'Email (opcional)', tipo: 'email', opcional: true, ayuda: 'Ej.: contacto@empresa.com' },
  { nombre: 'ciudad', etiqueta: 'Ciudad', ayuda: 'Ej.: Cali' },
];

// pedirDatos ya recorta los espacios y omite los campos opcionales vacíos.
// El contrato pide email: null cuando el cliente no tiene correo.
const aCuerpo = (d) => ({
  nombre: d.nombre,
  documento: d.documento,
  telefono: d.telefono,
  email: d.email ? d.email.toLowerCase() : null,
  ciudad: d.ciudad,
});

// =====================================================================
// ORIGEN DE LOS DATOS
// Todo lo que toca los datos está en este bloque y en ningún otro lado.
// En el Taller 3 solo cambian estas cuatro funciones por su llamada a la
// API y el resto del archivo queda igual:
//   leerClientes()             → api('/clientes', CLI)
//   guardarCliente(cuerpo)     → api('/clientes', { ...CLI, method: 'POST', body: cuerpo })
//   cambiarCliente(id, cuerpo) → api(`/clientes/${id}`, { ...CLI, method: 'PUT', body: cuerpo })
//   borrarCliente(id)          → api(`/clientes/${id}`, { ...CLI, method: 'DELETE' })
// donde CLI = { base: API_CLIENTES, servicio: 'ms-clientes' }.
// Las reglas de negocio que se repiten aquí son las mismas que ms-clientes
// aplica en el servidor, para que la pantalla se comporte igual después.
// =====================================================================

function leerClientes() {
  return CLIENTES_EJEMPLO.map((c) => ({ ...c }));
}

function documentoRepetido(documento, idPropio) {
  return clientes.some((c) => c.documento === documento && c.id !== idPropio);
}

function guardarCliente(cuerpo) {
  if (documentoRepetido(cuerpo.documento, null)) {
    throw new ErrorApi(409, `Ya existe un cliente con el documento ${cuerpo.documento}`);
  }
  const nuevo = { id: Math.max(0, ...clientes.map((c) => c.id)) + 1, ...cuerpo };
  clientes.push(nuevo);
  return nuevo;
}

function cambiarCliente(id, cuerpo) {
  if (documentoRepetido(cuerpo.documento, id)) {
    throw new ErrorApi(409, `Ya existe un cliente con el documento ${cuerpo.documento}`);
  }
  const indice = clientes.findIndex((c) => c.id === id);
  if (indice < 0) throw new ErrorApi(404, `No existe el cliente con id ${id}`);
  clientes[indice] = { id, ...cuerpo };
  return clientes[indice];
}

function borrarCliente(id) {
  const indice = clientes.findIndex((c) => c.id === id);
  if (indice < 0) throw new ErrorApi(404, `No existe el cliente con id ${id}`);
  clientes.splice(indice, 1);
}

// =====================================================================
// DIBUJAR LA PANTALLA
// =====================================================================

function ciudades() {
  return [...new Set(clientes.map((c) => c.ciudad))].sort((a, b) => a.localeCompare(b, 'es'));
}

// Lo que se ve después de aplicar el filtro de ciudad y la búsqueda
function visibles() {
  const t = texto.trim().toLowerCase();
  return clientes.filter((c) =>
    (!ciudadActiva || c.ciudad === ciudadActiva) &&
    (!t || [c.nombre, c.documento, c.telefono, c.email, c.ciudad]
      .some((v) => String(v ?? '').toLowerCase().includes(t))));
}

function pintarTarjetas() {
  const resumen = [
    [clientes.length, 'clientes registrados'],
    [ciudades().length, 'ciudades atendidas'],
    [clientes.filter((c) => !c.email).length, 'sin email registrado'],
  ];
  document.getElementById('tarjetas').innerHTML = resumen.map(([n, titulo]) =>
    `<div class="tarjeta"><strong>${n}</strong><span>${esc(titulo)}</span></div>`).join('');
}

function pintarChips() {
  const opciones = [['', 'Todas', clientes.length],
    ...ciudades().map((ciudad) => [ciudad, ciudad, clientes.filter((c) => c.ciudad === ciudad).length])];
  document.getElementById('chips').innerHTML = opciones.map(([valor, nombre, n]) =>
    `<button type="button" class="chip${valor === ciudadActiva ? ' activo' : ''}" data-ciudad="${esc(valor)}">
       ${esc(nombre)} <span class="cuenta">${n}</span></button>`).join('');
}

function celdaCliente(c) {
  return `<div class="cliente"><span class="avatar">${esc(c.nombre.charAt(0).toUpperCase())}</span>
    <div>${esc(c.nombre)}<br><span class="sub">Cliente #${esc(c.id)}</span></div></div>`;
}

function pintar() {
  const lista = visibles();
  document.getElementById('resumen').textContent = lista.length === clientes.length
    ? `${clientes.length} clientes`
    : `${lista.length} de ${clientes.length} clientes`;
  pintarTarjetas();
  pintarChips();

  document.getElementById('lista').innerHTML = lista.length ? lista.map((c) => `
    <tr>
      <td data-etiqueta="Cliente">${celdaCliente(c)}</td>
      <td data-etiqueta="Documento">${esc(c.documento)}</td>
      <td data-etiqueta="Teléfono">${esc(c.telefono)}</td>
      <td data-etiqueta="Email">${c.email ? esc(c.email) : '<span class="sub">Sin email</span>'}</td>
      <td data-etiqueta="Ciudad"><span class="ciudad">${esc(c.ciudad)}</span></td>
      ${puedeEscribir ? `<td class="acciones">
        <button class="boton boton-suave" data-editar="${c.id}">Editar</button>
        <button class="boton boton-peligro" data-eliminar="${c.id}">Eliminar</button></td>` : ''}
    </tr>`).join('') : `<tr><td class="vacio" colspan="${puedeEscribir ? 6 : 5}">
      ${clientes.length ? 'Ningún cliente coincide con la búsqueda.' : 'Todavía no hay clientes registrados.'}</td></tr>`;
}

// =====================================================================
// ACCIONES DE LA PANTALLA
// =====================================================================

function cargar() {
  try {
    clientes = leerClientes();
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de clientes.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Crear cliente', CAMPOS, {}, 'Crear cliente');
  if (!datos) return;
  try {
    const nuevo = guardarCliente(aCuerpo(datos));
    mostrarMensaje(`Cliente creado: ${nuevo.nombre}`);
    pintar();
  } catch (error) { mostrarError(error); }
}

async function editar(c) {
  const datos = await pedirDatos(`Editar ${c.nombre}`, CAMPOS, c, 'Guardar cambios');
  if (!datos) return;
  try {
    cambiarCliente(c.id, aCuerpo(datos));
    mostrarMensaje('Cambios guardados');
    pintar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(c) {
  if (!(await confirmar(`¿Eliminar el cliente ${c.nombre}?`, 'Eliminar cliente'))) return;
  try {
    borrarCliente(c.id);
    mostrarMensaje(`Cliente eliminado: ${c.nombre}`);
    pintar();
  } catch (error) { mostrarError(error); }
}

// =====================================================================
// ARRANQUE
// =====================================================================

if (yo) {
  pintarEncabezado(yo);
  pintarMenu(yo, 'clientes.html');

  // Los botones se ocultan según el rol; el permiso real lo exige ms-clientes (403)
  document.getElementById('nuevo').hidden = !puedeEscribir;
  document.getElementById('col-acciones').hidden = !puedeEscribir;

  document.getElementById('nuevo').onclick = crear;
  document.getElementById('buscar').oninput = (evento) => { texto = evento.target.value; pintar(); };
  document.getElementById('chips').onclick = (evento) => {
    const boton = evento.target.closest('[data-ciudad]');
    if (!boton) return;
    ciudadActiva = boton.dataset.ciudad;
    pintar();
  };
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const c = clientes.find((x) => x.id === Number(idEditar || idEliminar));
    if (c && idEditar) editar(c);
    if (c && idEliminar) eliminar(c);
  };

  cargar();
}