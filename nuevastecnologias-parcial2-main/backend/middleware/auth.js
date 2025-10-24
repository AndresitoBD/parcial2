const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Usuario = require('../models/Usuario');

// Middleware para verificar JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debe incluir el header Authorization'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Token no válido',
        message: 'Formato: Bearer <token>'
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Buscar usuario en BD
    const usuario = await Usuario.findById(decoded.userId);
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El token no corresponde a un usuario válido'
      });
    }

    // Agregar usuario a la request
    req.user = usuario;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, inicie sesión nuevamente'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error verificando autenticación'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    const rolesArray = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    if (!rolesArray.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${rolesArray.join(', ')}`,
        userRole: req.user.rol
      });
    }

    next();
  };
};

// Middleware específicos por rol
const requireTendero = requireRole('tendero');
const requireProveedor = requireRole('proveedor');
const requirePlataforma = requireRole('plataforma');
const requireTenderoOrPlataforma = requireRole(['tendero', 'plataforma']);
const requireProveedorOrPlataforma = requireRole(['proveedor', 'plataforma']);

module.exports = {
  verifyToken,
  requireRole,
  requireTendero,
  requireProveedor,
  requirePlataforma,
  requireTenderoOrPlataforma,
  requireProveedorOrPlataforma
};