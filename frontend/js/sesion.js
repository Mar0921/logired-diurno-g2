// =====================================================================
// SESIÓN: inicio de sesión, usuario actual y cierre de sesión.
// El token y el usuario se guardan en sessionStorage: se borran al
// cerrar la pestaña.
// =====================================================================
function usuarioActual() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario'));
  } catch (error) {
    return null;
  }
}

async function iniciarSesion(email, password) {
  let token;
  let usuario;
  try {
    ({ token, usuario } = await api('/usuarios/login', {
      method: 'POST',
      body: { email, password },
    }));
  } catch (error) {
    // Taller 2: el frontend todavía no se comunica con los microservicios.
    // Si ms-usuarios no responde, se entra con la sesión simulada que pide
    // el mapa de navegación. En el Taller 3, con el gateway de Apache,
    // este catch se elimina y queda solo el inicio de sesión real.
    if (error.status !== 0) throw error;
    ({ token, usuario } = sesionSimulada(email));
  }
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('usuario', JSON.stringify(usuario));   // nombre y rol
  location.href = PAGINA_POR_ROL[usuario.rol];
}

// Inicio de sesión simulado: el rol se escoge con el email, igual que las
// cuentas reales (admin@…, despacho@…, flota@…). Solo para el Taller 2.
function sesionSimulada(email) {
  const cuenta = String(email).toLowerCase();
  const rol = ROLES.find((r) => cuenta.startsWith(r))
    || (cuenta.startsWith('admin') ? 'administrador' : '');
  if (!rol) {
    throw new ErrorApi(503, 'Entre con admin@, despacho@ o flota@ para revisar las pantallas.');
  }
  const nombres = {
    administrador: 'Administrador LogiRed',
    despacho: 'Equipo de Despacho',
    flota: 'Equipo de Flota',
  };
  return { token: '', usuario: { id: 0, nombre: nombres[rol], email: cuenta, rol } };
}

function cerrarSesion() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
  location.href = 'login.html';
}

// Cada página llama a esto al cargar: sin sesión → login.
// Si se indican roles y el usuario no tiene uno de ellos → su propia página.
function exigirSesion(...roles) {
  const usuario = usuarioActual();
  if (!usuario) {
    location.href = 'login.html';
    return null;
  }
  if (roles.length && !roles.includes(usuario.rol)) {
    location.href = PAGINA_POR_ROL[usuario.rol];
    return null;
  }
  return usuario;
}

// Encabezado común: nombre, rol y botón de cerrar sesión
function pintarEncabezado(usuario) {
  document.getElementById('nombre-usuario').textContent = usuario.nombre;
  document.getElementById('rol-usuario').textContent = usuario.rol;
  document.getElementById('cerrar-sesion').onclick = cerrarSesion;
}
