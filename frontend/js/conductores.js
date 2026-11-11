// =====================================================================
// PANTALLA DE CONDUCTORES
// Todos los roles consultan; administrador y flota crean, editan y eliminan.
// Por ahora usa datos de ejemplo (Mock) para evitar CORS en el Taller 2.
// =====================================================================

const yo = exigirSesion();
const puedeEscribir = yo && ROLES_ESCRIBEN_CONDUCTORES.includes(yo.rol);

// En el Taller 3 se usará: { base: API_CONDUCTORES, servicio: 'ms-conductores' }
// const CONDUCTORES_API = { base: API_CONDUCTORES, servicio: 'ms-conductores' };

// Datos Mock basados en tu schema.sql para que la tabla se vea llena
let conductoresMock = [
  { id: 1, nombre: 'Carlos Pérez', cedula: '12345678', categoria_licencia: 'C2', telefono: '3001234567', sede: 'Cali' },
  { id: 2, nombre: 'Ana Gómez', cedula: '87654321', categoria_licencia: 'C3', telefono: '3109876543', sede: 'Medellín' },
  { id: 3, nombre: 'Luis Rodríguez', cedula: '11223344', categoria_licencia: 'C2', telefono: '3205556677', sede: 'Bogotá' }
];

let conductores = [];
let sedeActiva = ''; // '' = todas
let texto = '';

// Definición de los campos para el formulario modal
const camposConductor = [
  { nombre: 'nombre', etiqueta: 'Nombre completo' },
  { nombre: 'cedula', etiqueta: 'Cédula' },
  { nombre: 'categoria_licencia', etiqueta: 'Categoría Licencia', tipo: 'select', 
    opciones: LICENCIAS_CONDUCTOR.map(l => ({ valor: l, texto: l })) },
  { nombre: 'telefono', etiqueta: 'Teléfono' },
  { nombre: 'sede', etiqueta: 'Sede', tipo: 'select', 
    opciones: SEDES_CONDUCTOR.map(s => ({ valor: s, texto: s })) }
];

function visibles() {
  const t = texto.trim().toLowerCase();
  return conductores.filter((c) =>
    (!sedeActiva || c.sede === sedeActiva) &&
    (!t || [c.nombre, c.cedula].some((v) => String(v ?? '').toLowerCase().includes(t))));
}

function pintarChips() {
  const opciones = [['', 'Todas', conductores.length],
    ...SEDES_CONDUCTOR.map((s) => [s, s, conductores.filter((c) => c.sede === s).length])];
  
  document.getElementById('chips').innerHTML = opciones.map(([valor, nombre, n]) =>
    `<button type="button" class="chip${valor === sedeActiva ? ' activo' : ''}" data-sede="${valor}">
       ${esc(nombre)} <span class="cuenta">${n}</span></button>`).join('');
}

function pintar() {
  const lista = visibles();
  document.getElementById('resumen').textContent = lista.length === conductores.length
    ? `${conductores.length} conductores` : `${lista.length} de ${conductores.length} conductores`;
  
  pintarChips();
  
  document.getElementById('lista').innerHTML = lista.length ? lista.map((c) => `
    <tr>
      <td data-etiqueta="Nombre">
        <div class="cliente">
          <span class="avatar">${esc(c.nombre.charAt(0).toUpperCase())}</span>
          <div>${esc(c.nombre)}</div>
        </div>
      </td>
      <td data-etiqueta="Cédula">${esc(c.cedula)}</td>
      <td data-etiqueta="Licencia"><span class="etiqueta-rol">${esc(c.categoria_licencia)}</span></td>
      <td data-etiqueta="Teléfono">${esc(c.telefono)}</td>
      <td data-etiqueta="Sede"><span class="ciudad">${esc(c.sede)}</span></td>
      ${puedeEscribir ? `<td class="acciones">
        <button class="boton boton-suave" data-editar="${c.id}">Editar</button>
        <button class="boton boton-peligro" data-eliminar="${c.id}">Eliminar</button></td>` : ''}
    </tr>`).join('') : `<tr><td class="vacio" colspan="${puedeEscribir ? 6 : 5}">
      ${conductores.length ? 'Ningún conductor coincide con la búsqueda.' : 'Todavía no hay conductores registrados.'}</td></tr>`;
}

async function cargar() {
  try {
    // TALLER 3: Aquí se conectará al Gateway (Apache)
    // conductores = await api('/conductores', CONDUCTORES_API) || [];
    
    // MOCK TALLER 2: Usamos los datos de prueba
    conductores = [...conductoresMock];
    
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Registrar conductor', camposConductor, { categoria_licencia: 'C2', sede: 'Cali' }, 'Registrar');
  if (!datos) return;
  
  try {
    // TALLER 3: const nuevo = await api('/conductores', { ...CONDUCTORES_API, method: 'POST', body: datos });
    
    // MOCK TALLER 2: Simulamos el guardado
    const nuevo = { id: Date.now(), ...datos };
    conductoresMock.push(nuevo);
    
    mostrarMensaje(`Conductor registrado: ${nuevo.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

async function editar(c) {
  const datos = await pedirDatos('Editar conductor', camposConductor, c);
  if (!datos) return;
  
  try {
    // TALLER 3: await api(`/conductores/${c.id}`, { ...CONDUCTORES_API, method: 'PUT', body: datos });
    
    // MOCK TALLER 2
    const index = conductoresMock.findIndex(x => x.id === c.id);
    if (index !== -1) conductoresMock[index] = { ...c, ...datos };
    
    mostrarMensaje('Cambios guardados');
    cargar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(c) {
  if (!(await confirmar(`¿Eliminar al conductor ${c.nombre}?`, 'Eliminar'))) return;
  
  try {
    // TALLER 3: await api(`/conductores/${c.id}`, { ...CONDUCTORES_API, method: 'DELETE' });
    
    // MOCK TALLER 2
    conductoresMock = conductoresMock.filter(x => x.id !== c.id);
    
    mostrarMensaje(`Conductor eliminado: ${c.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

// =====================================================================
// INICIALIZACIÓN
// =====================================================================
if (yo) {
  pintarEncabezado(yo);
  pintarMenu(yo, 'conductores.html');
  
  // Ocultar botones si el rol no tiene permisos (despacho)
  document.getElementById('nuevo').hidden = !puedeEscribir;
  document.getElementById('col-acciones').hidden = !puedeEscribir;
  
  document.getElementById('nuevo').onclick = crear;
  
  document.getElementById('chips').onclick = (evento) => {
    const boton = evento.target.closest('[data-sede]');
    if (!boton) return;
    sedeActiva = boton.dataset.sede;
    pintar();
  };
  
  document.getElementById('buscar').oninput = (evento) => { texto = evento.target.value; pintar(); };
  
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const c = conductores.find((x) => x.id === Number(idEditar || idEliminar));
    if (c && idEditar) editar(c);
    if (c && idEliminar) eliminar(c);
  };
  
  cargar();
}