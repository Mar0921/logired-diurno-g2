// MIDDLEWARES DE SEGURIDAD: verifican el token JWT y el rol.
// Cada microservicio verifica el token por su cuenta, con la misma JWT_SECRET de ms-usuarios.
const jwt = require('jsonwebtoken');

// Exige un token válido: Authorization: Bearer <token>
// Falta, es inválido o venció -> 401. Si es válido, deja los datos en req.usuario.
function verificarToken(req, res, next) {
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env');
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { id, nombre, rol, iat, exp }
    next();
  } catch (err) {
    const motivo = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    res.status(401).json({ error: motivo });
  }
}

// Deja pasar solo a los roles indicados; a los demás, 403
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tiene permiso para esta operación' });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };