const express = require('express');
const router = express.Router();
const zonaController = require('../controllers/zonaController');

// Ruta pública para obtener zonas (necesaria para registro)
router.get('/', zonaController.getZonas);

module.exports = router;