const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Rutas públicas (no requieren autenticación)
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', verifyToken, authController.getProfile);
router.get('/verify', verifyToken, authController.verifyToken);

module.exports = router;