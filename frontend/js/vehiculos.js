// =====================================================================
// PANTALLA DE VEHÍCULOS
// Consultan todos los roles; crean, editan y eliminan administrador y flota.
// Taller 2: los datos salen del archivo de ejemplo datos/vehiculos.js.
// Taller 3: los mismos datos llegarán de ms-vehiculos por el gateway.
// =====================================================================
const yo = exigirSesion();
const puedeEscribir = yo && ROLES_ESCRIBEN_VEHICULOS.includes(yo.rol);

let vehiculos = [];
let estadoActivo = '';   // '' = todos
let texto = '';

const NOMBRE_TIPO = { moto: 'Moto', furgon: 'Furgón', camion: 'Camión' };
const NOMBRE_ESTADO = (e) => e.replace('_', ' ');

// Los mismos atributos del contrato de la API. El conductor se escoge de la
// lista; la opción vacía significa "sin conductor asignado" (conductor_id: null).
const CAMPOS = [
  { nombre: 'placa', etiqueta: 'Placa', ayuda: 'Ej.: ABC123 (motos: ABC12D)' },
  { nombre: 'tipo', etiqueta: 'Tipo', tipo: 'select',
    opciones: TIPOS_VEHICULO.map((t) => ({ valor: t, texto: NOMBRE_TIPO[t] })) },
  { nombre: 'capacidad_kg', etiqueta: 'Capacidad (kg)', tipo: 'number', ayuda: 'Ej.: 1200' },
  { nombre: 'estado', etiqueta: 'Estado', tipo: 'select',
    opciones: ESTADOS_VEHICULO.map((e) => ({ valor: e, texto: NOMBRE_ESTADO(e) })) },
  { nombre: 'conductor_id', etiqueta: 'Conductor', tipo: 'select',
    opciones: [{ valor: '', texto: 'Sin conductor asignado' },
      ...CONDUCTORES_ASIGNABLES.map((c) => ({ valor: c.id, texto: c.nombre }))] },
];

// El formulario entrega texto; la API espera números, la placa en
// mayúsculas sin guiones ni espacios y null cuando no hay conductor.
const aCuerpo = (d) => ({
  placa: d.placa.toUpperCase().replace(/[\s-]/g, ''),
  tipo: d.tipo,
  capacidad_kg: Number(d.capacidad_kg),
  estado: d.estado,
  conductor_id: d.conductor_id ? Number(d.conductor_id) : null,
});

// =====================================================================
// ORIGEN DE LOS DATOS
// Todo lo que toca los datos está en este bloque y en ningún otro lado.
// En el Taller 3 solo cambian estas cuatro funciones por su llamada a la
// API y el resto del archivo queda igual:
//   leerVehiculos()             → api('/vehiculos', VEH)
//   guardarVehiculo(cuerpo)     → api('/vehiculos', { ...VEH, method: 'POST', body: cuerpo })
//   cambiarVehiculo(id, cuerpo) → api(`/vehiculos/${id}`, { ...VEH, method: 'PUT', body: cuerpo })
//   borrarVehiculo(id)          → api(`/vehiculos/${id}`, { ...VEH, method: 'DELETE' })
// donde VEH = { base: API_VEHICULOS, servicio: 'ms-vehiculos' }.
// Las reglas de negocio que se repiten aquí son las mismas que ms-vehiculos
// aplica en el servidor, para que la pantalla se comporte igual después.
// =====================================================================

function leerVehiculos() {
  return VEHICULOS_EJEMPLO.map((v) => ({ ...v }));
}

// Mismas validaciones del modelo de ms-vehiculos (400)
function validar(cuerpo) {
  const errores = [];
  if (!/^[A-Z]{3}[0-9]{2}[A-Z0-9]$/.test(cuerpo.placa)) {
    errores.push('placa es obligatoria y debe tener formato ABC123 (o ABC12D para motos)');
  }
  if (!(cuerpo.capacidad_kg > 0)) errores.push('capacidad_kg es obligatoria y debe ser un número mayor que 0');
  if (errores.length) throw new ErrorApi(400, 'Datos inválidos', errores);
}

// Regla de negocio de ms-vehiculos: placa única (409)
function placaRepetida(placa, idPropio) {
  return vehiculos.some((v) => v.placa === placa && v.id !== idPropio);
}

// Lo que hace ms-vehiculos con ms-conductores: valida que el conductor
// exista (400) y agrega el objeto conductor a la respuesta.
function componerConductor(cuerpo) {
  if (cuerpo.conductor_id === null) return { ...cuerpo, conductor: null };
  const conductor = CONDUCTORES_ASIGNABLES.find((c) => c.id === cuerpo.conductor_id);
  if (!conductor) throw new ErrorApi(400, `No existe el conductor con id ${cuerpo.conductor_id}`);
  return { ...cuerpo, conductor: { ...conductor } };
}

function guardarVehiculo(cuerpo) {
  validar(cuerpo);
  if (placaRepetida(cuerpo.placa, null)) {
    throw new ErrorApi(409, `Ya existe un vehículo con la placa ${cuerpo.placa}`);
  }
  const nuevo = { id: Math.max(0, ...vehiculos.map((v) => v.id)) + 1, ...componerConductor(cuerpo) };
  vehiculos.push(nuevo);
  return nuevo;
}

function cambiarVehiculo(id, cuerpo) {
  validar(cuerpo);
  if (placaRepetida(cuerpo.placa, id)) {
    throw new ErrorApi(409, `Ya existe un vehículo con la placa ${cuerpo.placa}`);
  }
  const indice = vehiculos.findIndex((v) => v.id === id);
  if (indice < 0) throw new ErrorApi(404, `No existe el vehículo con id ${id}`);
  vehiculos[indice] = { id, ...componerConductor(cuerpo) };
  return vehiculos[indice];
}

function borrarVehiculo(id) {
  const indice = vehiculos.findIndex((v) => v.id === id);
  if (indice < 0) throw new ErrorApi(404, `No existe el vehículo con id ${id}`);
  vehiculos.splice(indice, 1);
}

// =====================================================================
// DIBUJAR LA PANTALLA
// =====================================================================

// Lo que se ve después de aplicar el filtro de estado y la búsqueda
function visibles() {
  const t = texto.trim().toLowerCase();
  return vehiculos.filter((v) =>
    (!estadoActivo || v.estado === estadoActivo) &&
    (!t || [v.placa, v.tipo, NOMBRE_TIPO[v.tipo], v.conductor?.nombre]
      .some((x) => String(x ?? '').toLowerCase().includes(t))));
}

function pintarTarjetas() {
  const total = vehiculos.length;
  const resumen = [
    [vehiculos.filter((v) => v.estado === 'disponible').length, 'disponibles'],
    [vehiculos.filter((v) => v.estado === 'en_ruta').length, 'en ruta'],
    [vehiculos.filter((v) => v.estado === 'mantenimiento').length, 'en mantenimiento'],
    [vehiculos.filter((v) => v.conductor_id === null).length, 'sin conductor asignado'],
  ];
  const capacidad = vehiculos.reduce((suma, v) => suma + Number(v.capacidad_kg), 0);
  document.getElementById('tarjetas').innerHTML = resumen.map(([n, titulo]) =>
    `<div class="tarjeta"><strong>${n}</strong><span>${esc(titulo)}</span></div>`).join('') +
    `<div class="tarjeta"><strong>${esc(capacidad.toLocaleString('es-CO'))}</strong>
       <span>kg de capacidad total (${total} vehículos)</span></div>`;
}

function pintarChips() {
  const opciones = [['', 'Todos', vehiculos.length],
    ...ESTADOS_VEHICULO.map((e) => [e, NOMBRE_ESTADO(e), vehiculos.filter((v) => v.estado === e).length])];
  document.getElementById('chips').innerHTML = opciones.map(([valor, nombre, n]) =>
    `<button type="button" class="chip${valor === estadoActivo ? ' activo' : ''}" data-estado="${esc(valor)}">
       ${esc(nombre)} <span class="cuenta">${n}</span></button>`).join('');
}

function celdaConductor(v) {
  if (v.conductor_id === null) {
    return `<div class="cliente"><span class="avatar avatar-vacio">—</span>
      <span class="sub">Sin conductor asignado</span></div>`;
  }
  // Degradación: ms-vehiculos responde igual si ms-conductores está caído
  if (!v.conductor) return `<span class="sub">Conductor #${esc(v.conductor_id)} (sin datos)</span>`;
  return `<div class="cliente"><span class="avatar">${esc(v.conductor.nombre.charAt(0).toUpperCase())}</span>
    <div>${esc(v.conductor.nombre)}<br><span class="sub">${esc(v.conductor.telefono)}</span></div></div>`;
}

function pintar() {
  const lista = visibles();
  document.getElementById('resumen').textContent = lista.length === vehiculos.length
    ? `${vehiculos.length} vehículos`
    : `${lista.length} de ${vehiculos.length} vehículos`;
  pintarTarjetas();
  pintarChips();

  document.getElementById('lista').innerHTML = lista.length ? lista.map((v) => `
    <tr>
      <td data-etiqueta="Placa"><span class="placa">${esc(v.placa)}</span></td>
      <td data-etiqueta="Tipo"><span class="tipo-vehiculo tipo-${esc(v.tipo)}">${esc(NOMBRE_TIPO[v.tipo] || v.tipo)}</span></td>
      <td data-etiqueta="Capacidad">${esc(Number(v.capacidad_kg).toLocaleString('es-CO'))} kg</td>
      <td data-etiqueta="Conductor">${celdaConductor(v)}</td>
      <td data-etiqueta="Estado"><span class="estado estado-${esc(v.estado)}">${esc(NOMBRE_ESTADO(v.estado))}</span></td>
      ${puedeEscribir ? `<td class="acciones">
        <button class="boton boton-suave" data-editar="${v.id}">Editar</button>
        <button class="boton boton-peligro" data-eliminar="${v.id}">Eliminar</button></td>` : ''}
    </tr>`).join('') : `<tr><td class="vacio" colspan="${puedeEscribir ? 6 : 5}">
      ${vehiculos.length ? 'Ningún vehículo coincide con la búsqueda.' : 'Todavía no hay vehículos registrados.'}</td></tr>`;

  if (vehiculos.some((v) => v.aviso)) {
    mostrarMensaje('ms-conductores no está disponible: se muestran los vehículos sin los datos del conductor', 'error');
  }
}

// =====================================================================
// ACCIONES DE LA PANTALLA
// =====================================================================

function cargar() {
  try {
    vehiculos = leerVehiculos();
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de vehículos.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Registrar vehículo', CAMPOS,
    { tipo: 'furgon', estado: 'disponible', conductor_id: '' }, 'Registrar vehículo');
  if (!datos) return;
  try {
    const nuevo = guardarVehiculo(aCuerpo(datos));
    mostrarMensaje(`Vehículo registrado: ${nuevo.placa}`);
    pintar();
  } catch (error) { mostrarError(error); }
}

async function editar(v) {
  const datos = await pedirDatos(`Editar vehículo ${v.placa}`, CAMPOS,
    { ...v, conductor_id: v.conductor_id ?? '' }, 'Guardar cambios');
  if (!datos) return;
  try {
    cambiarVehiculo(v.id, aCuerpo(datos));
    mostrarMensaje('Cambios guardados');
    pintar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(v) {
  if (!(await confirmar(`¿Eliminar el vehículo ${v.placa}?`, 'Eliminar vehículo'))) return;
  try {
    borrarVehiculo(v.id);
    mostrarMensaje(`Vehículo eliminado: ${v.placa}`);
    pintar();
  } catch (error) { mostrarError(error); }
}

// =====================================================================
// ARRANQUE
// =====================================================================

if (yo) {
  pintarEncabezado(yo);
  pintarMenu(yo, 'vehiculos.html');

  // Los botones se ocultan según el rol; el permiso real lo exige ms-vehiculos (403)
  document.getElementById('nuevo').hidden = !puedeEscribir;
  document.getElementById('col-acciones').hidden = !puedeEscribir;

  document.getElementById('nuevo').onclick = crear;
  document.getElementById('buscar').oninput = (evento) => { texto = evento.target.value; pintar(); };
  document.getElementById('chips').onclick = (evento) => {
    const boton = evento.target.closest('[data-estado]');
    if (!boton) return;
    estadoActivo = boton.dataset.estado;
    pintar();
  };
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const v = vehiculos.find((x) => x.id === Number(idEditar || idEliminar));
    if (v && idEditar) editar(v);
    if (v && idEliminar) eliminar(v);
  };

  cargar();
}
