const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Falta el token de acceso (cabecera Authorization: Bearer <token>)');
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new HttpError(401, 'Token inválido o vencido');
  }
  next();
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      throw new HttpError(403, `El rol ${req.usuario.rol} no tiene permiso para esta operación`);
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };