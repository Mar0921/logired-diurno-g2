// =====================================================================
// PANTALLA DE USUARIOS
// Solo administrador: consulta, crea, edita y elimina.
// Los datos provienen de ms-usuarios mediante Apache Gateway.
// =====================================================================

const yo = exigirSesion();

if (!yo || yo.rol !== 'administrador') {
  window.location.href = 'inicio.html';
} else {

  const API = { base: API_USUARIOS, servicio: 'ms-usuarios' };

  let usuarios = [];
  let filtroRol = '';
  let texto = '';

  const ROLES_USUARIO = ['administrador', 'despacho', 'flota'];

  const CAMPOS = [
    { nombre: 'nombre', etiqueta: 'Nombre', ayuda: 'Nombre completo' },
    { nombre: 'email', etiqueta: 'Correo electrónico', tipo: 'email', ayuda: 'usuario@logired.com' },
    { nombre: 'password', etiqueta: 'Contraseña', tipo: 'password', ayuda: 'Mínimo 8 caracteres' },
    { nombre: 'rol', etiqueta: 'Rol', tipo: 'select', opciones: ROLES_USUARIO.map(r => ({ valor: r, texto: r })) },
    { nombre: 'activo', etiqueta: 'Estado', tipo: 'select', opciones: [
      { valor: 'true', texto: 'Activo' },
      { valor: 'false', texto: 'Inactivo' }
    ]}
  ];

  async function leerUsuarios() {
    return await api('/', API) || [];
  }

  async function guardarUsuario(datos) {
    return await api('/', { ...API, method: 'POST', body: datos });
  }

  async function cambiarUsuario(id, datos) {
    return await api(`/${id}`, { ...API, method: 'PUT', body: datos });
  }

  async function borrarUsuario(id) {
    return await api(`/${id}`, { ...API, method: 'DELETE' });
  }

  function visibles() {
    const t = texto.trim().toLowerCase();
    return usuarios.filter(u =>
      (!filtroRol || u.rol === filtroRol) &&
      (!t || [u.nombre, u.email].some(v =>
        String(v ?? '').toLowerCase().includes(t)))
    );
  }

  function pintarTarjetas() {
    const activos = usuarios.filter(u => u.activo).length;
    const inactivos = usuarios.length - activos;

    document.getElementById('tarjetas').innerHTML = [
      [usuarios.length, 'usuarios registrados'],
      [activos, 'usuarios activos'],
      [inactivos, 'usuarios inactivos']
    ].map(([n, titulo]) =>
      `<div class="tarjeta"><strong>${n}</strong><span>${esc(titulo)}</span></div>`
    ).join('');
  }

  function pintarChips() {
    const opciones = [
      ['', 'Todos', usuarios.length],
      ...ROLES_USUARIO.map(rol => [
        rol, rol, usuarios.filter(u => u.rol === rol).length
      ])
    ];

    document.getElementById('chips').innerHTML = opciones.map(([valor, nombre, n]) =>
      `<button type="button" class="chip${valor === filtroRol ? ' activo' : ''}"
        data-rol="${esc(valor)}">
        ${esc(nombre)} <span class="cuenta">${n}</span>
      </button>`
    ).join('');
  }

  function pintar() {
    const lista = visibles();

    document.getElementById('resumen').textContent =
      lista.length === usuarios.length
        ? `${usuarios.length} usuarios`
        : `${lista.length} de ${usuarios.length} usuarios`;

    pintarTarjetas();
    pintarChips();

    document.getElementById('lista').innerHTML = lista.length
      ? lista.map(u => `
        <tr>
          <td data-etiqueta="Usuario">
            <div class="cliente">
              <span class="avatar">${esc(u.nombre.charAt(0).toUpperCase())}</span>
              <div>${esc(u.nombre)}<br>
                <span class="sub">Usuario #${esc(u.id)}</span>
              </div>
            </div>
          </td>
          <td data-etiqueta="Correo">${esc(u.email)}</td>
          <td data-etiqueta="Rol"><span class="ciudad">${esc(u.rol)}</span></td>
          <td data-etiqueta="Estado">
            <span class="ciudad">${u.activo ? 'Activo' : 'Inactivo'}</span>
          </td>
          <td class="acciones">
            <button class="boton boton-suave" data-editar="${u.id}">Editar</button>
            <button class="boton boton-peligro" data-eliminar="${u.id}">Eliminar</button>
          </td>
        </tr>
      `).join('')
      : `<tr><td class="vacio" colspan="5">
          ${usuarios.length ? 'Ningún usuario coincide con la búsqueda.' : 'Todavía no hay usuarios registrados.'}
        </td></tr>`;
  }

  async function cargar() {
    try {
      usuarios = await leerUsuarios();
      pintar();
    } catch (error) {
      document.getElementById('resumen').textContent =
        'No se pudo cargar la lista de usuarios.';
      mostrarError(error);
    }
  }

  function cuerpo(datos, incluirPassword = true) {
    const resultado = {
      nombre: datos.nombre,
      email: datos.email.toLowerCase(),
      rol: datos.rol,
      activo: datos.activo === 'true'
    };

    if (incluirPassword && datos.password) {
      resultado.password = datos.password;
    }

    return resultado;
  }

  async function crear() {
    const datos = await pedirDatos(
      'Registrar usuario',
      CAMPOS,
      { rol: 'despacho', activo: 'true' },
      'Registrar usuario'
    );

    if (!datos) return;

    try {
      const nuevo = await guardarUsuario(cuerpo(datos));
      usuarios = await leerUsuarios();
      mostrarMensaje(`Usuario registrado: ${nuevo.nombre}`);
      pintar();
    } catch (error) {
      mostrarError(error);
    }
  }

  async function editar(u) {
    const camposEdicion = CAMPOS.map(c =>
      c.nombre === 'password'
        ? { ...c, opcional: true, ayuda: 'Déjala vacía para conservar la contraseña actual' }
        : c
    );

    const datos = await pedirDatos(
      `Editar usuario ${u.nombre}`,
      camposEdicion,
      { ...u, activo: String(u.activo), password: '' },
      'Guardar cambios'
    );

    if (!datos) return;

    try {
      await cambiarUsuario(u.id, cuerpo(datos));
      usuarios = await leerUsuarios();
      mostrarMensaje(`Usuario actualizado: ${u.nombre}`);
      pintar();
    } catch (error) {
      mostrarError(error);
    }
  }

  async function eliminar(u) {
    if (u.id === yo.id) {
      mostrarMensaje('No puedes eliminar tu propio usuario.', 'error');
      return;
    }

    if (!(await confirmar(
      `¿Eliminar el usuario ${u.nombre}?`,
      'Eliminar usuario'
    ))) return;

    try {
      await borrarUsuario(u.id);
      usuarios = await leerUsuarios();
      mostrarMensaje(`Usuario eliminado: ${u.nombre}`);
      pintar();
    } catch (error) {
      mostrarError(error);
    }
  }

  pintarEncabezado(yo);
  pintarMenu(yo, 'usuarios.html');

  document.getElementById('nuevo').onclick = crear;

  document.getElementById('buscar').oninput = evento => {
    texto = evento.target.value;
    pintar();
  };

  document.getElementById('chips').onclick = evento => {
    const boton = evento.target.closest('[data-rol]');
    if (!boton) return;
    filtroRol = boton.dataset.rol;
    pintar();
  };

  document.getElementById('lista').onclick = evento => {
    const idEditar = evento.target.dataset.editar;
    const idEliminar = evento.target.dataset.eliminar;
    const usuario = usuarios.find(u => u.id === Number(idEditar || idEliminar));

    if (usuario && idEditar) editar(usuario);
    if (usuario && idEliminar) eliminar(usuario);
  };

  cargar();
}
