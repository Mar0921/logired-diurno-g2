// =====================================================================
// CONFIGURACIÓN DEL FRONTEND: direcciones de las APIs, roles y menú.
// En el Taller 3, detrás del gateway, las direcciones pasan a '/api/...'.
// =====================================================================
const API_USUARIOS = 'http://localhost:3001';
const API_CLIENTES = 'http://localhost:3002';
const API_ENVIOS = 'http://localhost:3003';

const ROLES = ['administrador', 'despacho', 'flota'];

// Página de inicio de cada rol (a dónde lleva el login)
const PAGINA_POR_ROL = {
  administrador: 'inicio.html',
  despacho: 'inicio.html',
  flota: 'inicio.html',
};

// Menú de cada rol, según el mapa de navegación del Taller 1
const MENU_POR_ROL = {
  administrador: [['Inicio', 'inicio.html'], ['Usuarios', 'usuarios.html'], ['Clientes', 'clientes.html'],
                  ['Conductores', 'conductores.html'], ['Vehículos', 'vehiculos.html'], ['Envíos', 'envios.html']],
  despacho: [['Inicio', 'inicio.html'], ['Envíos', 'envios.html'], ['Clientes', 'clientes.html'],
             ['Conductores', 'conductores.html'], ['Vehículos', 'vehiculos.html']],
  flota: [['Inicio', 'inicio.html'], ['Conductores', 'conductores.html'], ['Vehículos', 'vehiculos.html'],
          ['Envíos', 'envios.html']],
};

// Permisos de Envíos (los mismos que aplica ms-envios; el backend es quien los exige)
const ROLES_ESCRIBEN_ENVIOS = ['administrador', 'despacho'];
// Permisos de Clientes (los mismos que aplica ms-clientes, el backend es quien los exige)
const ROLES_ESCRIBEN_CLIENTES = ['administrador', 'despacho'];
const ESTADOS_ENVIO = ['registrado', 'en_transito', 'entregado'];
