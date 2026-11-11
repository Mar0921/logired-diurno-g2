// Menú común: muestra solo las secciones del rol de la persona
function pintarMenu(usuario, actual) {
  document.getElementById('menu').innerHTML = MENU_POR_ROL[usuario.rol].map(([texto, url]) =>
    `<a href="${url}"${url === actual ? ' aria-current="page"' : ''}>${esc(texto)}</a>`).join('');
}
