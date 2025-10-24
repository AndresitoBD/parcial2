const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Usuario = require('../models/Usuario');
const Zona = require('../models/Zona');

// Generar JWT token
const generateToken = (userId, userRole) => {
  return jwt.sign(
    { userId, role: userRole },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol, contacto, zona_id } = req.body;

    // Verificar si el email ya existe
    const emailExists = await Usuario.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        error: 'Email ya registrado',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Si es tendero, verificar que la zona existe
    if (rol === 'tendero' && zona_id) {
      const zona = await Zona.findById(zona_id);
      if (!zona) {
        return res.status(400).json({
          error: 'Zona inválida',
          message: 'La zona especificada no existe'
        });
      }
    }

    // Crear usuario
    const userId = await Usuario.create({
      nombre,
      email,
      password,
      rol,
      contacto,
      zona_id: rol === 'tendero' ? zona_id : null
    });

    // Obtener usuario creado (sin contraseña)
    const newUser = await Usuario.findById(userId);

    // Generar token
    const token = generateToken(userId, rol);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser.toJSON(),
      token,
      expiresIn: config.jwt.expiresIn
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el usuario'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await Usuario.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token
    const token = generateToken(user.id, user.rol);

    res.json({
      message: 'Login exitoso',
      user: user.toJSON(),
      token,
      expiresIn: config.jwt.expiresIn
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el login'
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el perfil'
    });
  }
};

// Verificar token (útil para el frontend)
const verifyToken = async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido (verificado por middleware)
    res.json({
      valid: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  verifyToken
};