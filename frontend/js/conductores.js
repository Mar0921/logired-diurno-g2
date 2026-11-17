// =====================================================================
// PANTALLA DE CONDUCTORES - INTEGRACION REAL CON MS-CONDUCTORES
// Todos los roles consultan; administrador y flota escriben.
// =====================================================================

const yo = exigirSesion();
const puedeEscribir = yo && ROLES_ESCRIBEN_CONDUCTORES.includes(yo.rol);

const CONDUCTORES_API = {
  base: API_CONDUCTORES,
  servicio: 'ms-conductores'
};

let conductores = [];
let sedeActiva = '';
let texto = '';

const camposConductor = [
  { nombre: 'nombre', etiqueta: 'Nombre completo' },
  { nombre: 'cedula', etiqueta: 'Cédula' },
  {
    nombre: 'categoria_licencia',
    etiqueta: 'Categoría Licencia',
    tipo: 'select',
    opciones: LICENCIAS_CONDUCTOR.map(l => ({ valor: l, texto: l }))
  },
  { nombre: 'telefono', etiqueta: 'Teléfono' },
  {
    nombre: 'sede',
    etiqueta: 'Sede',
    tipo: 'select',
    opciones: SEDES_CONDUCTOR.map(s => ({ valor: s, texto: s }))
  }
];

// =====================================================================
// API
// =====================================================================

async function leerConductores() {
  return await api('/', CONDUCTORES_API) || [];
}

async function guardarConductor(datos) {
  return await api('/', {
    ...CONDUCTORES_API,
    method: 'POST',
    body: datos
  });
}

async function cambiarConductor(id, datos) {
  return await api(`/${id}`, {
    ...CONDUCTORES_API,
    method: 'PUT',
    body: datos
  });
}

async function borrarConductor(id) {
  return await api(`/${id}`, {
    ...CONDUCTORES_API,
    method: 'DELETE'
  });
}

// =====================================================================
// PRESENTACION
// =====================================================================

function visibles() {
  const t = texto.trim().toLowerCase();

  return conductores.filter(c =>
    (!sedeActiva || c.sede === sedeActiva) &&
    (!t || [c.nombre, c.cedula].some(v =>
      String(v ?? '').toLowerCase().includes(t)))
  );
}

function pintarChips() {
  const opciones = [
    ['', 'Todas', conductores.length],
    ...SEDES_CONDUCTOR.map(s => [
      s,
      s,
      conductores.filter(c => c.sede === s).length
    ])
  ];

  document.getElementById('chips').innerHTML = opciones.map(
    ([valor, nombre, n]) => `
      <button type="button"
        class="chip${valor === sedeActiva ? ' activo' : ''}"
        data-sede="${esc(valor)}">
        ${esc(nombre)} <span class="cuenta">${n}</span>
      </button>
    `
  ).join('');
}

function pintar() {
  const lista = visibles();

  document.getElementById('resumen').textContent =
    lista.length === conductores.length
      ? `${conductores.length} conductores`
      : `${lista.length} de ${conductores.length} conductores`;

  pintarChips();

  document.getElementById('lista').innerHTML = lista.length
    ? lista.map(c => `
      <tr>
        <td data-etiqueta="Nombre">
          <div class="cliente">
            <span class="avatar">${esc(c.nombre.charAt(0).toUpperCase())}</span>
            <div>${esc(c.nombre)}</div>
          </div>
        </td>
        <td data-etiqueta="Cédula">${esc(c.cedula)}</td>
        <td data-etiqueta="Licencia">
          <span class="etiqueta-rol">${esc(c.categoria_licencia)}</span>
        </td>
        <td data-etiqueta="Teléfono">${esc(c.telefono)}</td>
        <td data-etiqueta="Sede">
          <span class="ciudad">${esc(c.sede)}</span>
        </td>
        ${puedeEscribir ? `
          <td class="acciones">
            <button class="boton boton-suave" data-editar="${c.id}">
              Editar
            </button>
            <button class="boton boton-peligro" data-eliminar="${c.id}">
              Eliminar
            </button>
          </td>
        ` : ''}
      </tr>
    `).join('')
    : `
      <tr>
        <td class="vacio" colspan="${puedeEscribir ? 6 : 5}">
          ${conductores.length
            ? 'Ningún conductor coincide con la búsqueda.'
            : 'Todavía no hay conductores registrados.'}
        </td>
      </tr>
    `;
}

// =====================================================================
// CARGA
// =====================================================================

async function cargar() {
  try {
    conductores = await leerConductores();
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent =
      'No se pudo cargar la lista de conductores.';
    mostrarError(error);
  }
}

// =====================================================================
// CREAR
// =====================================================================

async function crear() {
  const datos = await pedirDatos(
    'Registrar conductor',
    camposConductor,
    { categoria_licencia: 'C2', sede: 'Cali' },
    'Registrar'
  );

  if (!datos) return;

  try {
    const nuevo = await guardarConductor(datos);
    conductores = await leerConductores();

    mostrarMensaje(`Conductor registrado: ${nuevo.nombre}`);
    pintar();
  } catch (error) {
    mostrarError(error);
  }
}

// =====================================================================
// EDITAR
// =====================================================================

async function editar(c) {
  const datos = await pedirDatos(
    'Editar conductor',
    camposConductor,
    c,
    'Guardar cambios'
  );

  if (!datos) return;

  try {
    await cambiarConductor(c.id, datos);
    conductores = await leerConductores();

    mostrarMensaje(`Conductor actualizado: ${c.nombre}`);
    pintar();
  } catch (error) {
    mostrarError(error);
  }
}

// =====================================================================
// ELIMINAR
// =====================================================================

async function eliminar(c) {
  if (!(await confirmar(
    `¿Eliminar al conductor ${c.nombre}?`,
    'Eliminar'
  ))) return;

  try {
    await borrarConductor(c.id);
    conductores = await leerConductores();

    mostrarMensaje(`Conductor eliminado: ${c.nombre}`);
    pintar();
  } catch (error) {
    mostrarError(error);
  }
}

// =====================================================================
// INICIALIZACION
// =====================================================================

if (yo) {
  pintarEncabezado(yo);
  pintarMenu(yo, 'conductores.html');

  document.getElementById('nuevo').hidden = !puedeEscribir;
  document.getElementById('col-acciones').hidden = !puedeEscribir;

  document.getElementById('nuevo').onclick = crear;

  document.getElementById('chips').onclick = evento => {
    const boton = evento.target.closest('[data-sede]');
    if (!boton) return;

    sedeActiva = boton.dataset.sede;
    pintar();
  };

  document.getElementById('buscar').oninput = evento => {
    texto = evento.target.value;
    pintar();
  };

  document.getElementById('lista').onclick = evento => {
    const { editar: idEditar, eliminar: idEliminar } =
      evento.target.dataset;

    const c = conductores.find(
      x => x.id === Number(idEditar || idEliminar)
    );

    if (c && idEditar) editar(c);
    if (c && idEliminar) eliminar(c);
  };

  cargar();
}
