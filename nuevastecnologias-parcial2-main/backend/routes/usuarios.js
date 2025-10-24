const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { verifyToken } = require('../middleware/auth');

// GET /api/usuarios?rol=proveedor
router.get('/', verifyToken, async (req, res) => {
  try {
    const { rol } = req.query;

    if (!rol) {
      return res.status(400).json({ error: 'Debe especificar un rol' });
    }

    const usuarios = await Usuario.findByRole(rol);
    res.json(usuarios.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
