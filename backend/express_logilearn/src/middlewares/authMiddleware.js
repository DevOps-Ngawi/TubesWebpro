const jwt = require('jsonwebtoken');
const resp = require('../helpers/response');
const { getRequiredEnv } = require('../helpers/env');

const JWT_SECRET = getRequiredEnv('JWT_SECRET');

function verifyLogin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return resp(401, null, 'Unauthorized', res);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return resp(401, null, 'Invalid token format', res);
  }

  try {
    req.auth = jwt.verify(parts[1], JWT_SECRET);
    next();
  } catch (err) {
    return resp(401, null, 'Invalid token', res);
  }
}

function onlyAdmin(req, res, next){
  if (req.auth.type !== 'ADMIN') {
    return resp(403, null, 'Admin only', res);
  }

  next();
}

function onlyPelajar(req, res, next){
  if (req.auth.type !== 'PELAJAR') {
    return resp(403, null, 'Pelajar only', res);
  }

  next();
}

module.exports = {
  verifyLogin,
  onlyAdmin,
  onlyPelajar
};
