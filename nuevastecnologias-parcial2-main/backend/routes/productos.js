const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyToken, requirePlataforma } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

// Rutas públicas o para usuarios autenticados
router.get('/', verifyToken, productoController.getProductos);
router.get('/:id', verifyToken, productoController.getProductoById);

// Rutas solo para plataforma
router.post('/', verifyToken, requirePlataforma, validateProduct, productoController.createProducto);
router.put('/:id', verifyToken, requirePlataforma, validateProduct, productoController.updateProducto);
router.delete('/:id', verifyToken, requirePlataforma, productoController.deleteProducto);

module.exports = router;