const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { 
  verifyToken, 
  requireTendero, 
  requirePlataforma, 
  requireProveedor 
} = require('../middleware/auth');
const { validatePedido } = require('../middleware/validation');

// ============================================
// RUTAS PARA TENDERO
// ============================================

/**
 * Crear nuevo pedido
 * POST /api/pedidos
 * Body: { productos: [{producto_id: 1, cantidad: 5}, ...] }
 */
router.post(
  '/',
  verifyToken,
  requireTendero,
  validatePedido,
  pedidoController.createPedido
);

/**
 * Obtener mis pedidos
 * GET /api/pedidos/mis-pedidos
 */
router.get(
  '/mis-pedidos',
  verifyToken,
  requireTendero,
  pedidoController.getMisPedidos
);

/**
 * Marcar producto como recibido
 * PUT /api/pedidos/:id/recibir
 * Body: { producto_id: 1 }
 */
router.put(
  '/:id/recibir',
  verifyToken,
  requireTendero,
  pedidoController.marcarProductoRecibido
);

// ============================================
// RUTAS PARA PLATAFORMA
// ============================================

/**
 * Obtener todos los pedidos (con filtros opcionales)
 * GET /api/pedidos/todos?zona_id=1&estado=pendiente
 */
router.get(
  '/todos',
  verifyToken,
  requirePlataforma,
  pedidoController.getTodosPedidos
);

/**
 * Consolidar pedidos por zona
 * POST /api/pedidos/consolidar
 * Body: { pedidos_ids: [1, 2, 3] }
 */
router.post(
  '/consolidar',
  verifyToken,
  requirePlataforma,
  pedidoController.consolidarPedidos
);

/**
 * Asignar proveedor a pedidos consolidados
 * PUT /api/pedidos/asignar-proveedor
 * Body: { pedidos_ids: [1, 2, 3], proveedor_id: 2 }
 */
router.put(
  '/asignar-proveedor',
  verifyToken,
  requirePlataforma,
  pedidoController.asignarProveedor
);

/**
 * Marcar pedidos como despachados
 * PUT /api/pedidos/despachar
 * Body: { pedidos_ids: [1, 2, 3] }
 */
router.put(
  '/despachar',
  verifyToken,
  requirePlataforma,
  pedidoController.despacharPedidos
);

// ============================================
// RUTAS PARA PROVEEDOR
// ============================================

/**
 * Obtener pedidos asignados al proveedor
 * GET /api/pedidos/asignados?estado=despacho&zona_id=1
 */
router.get(
  '/asignados',
  verifyToken,
  requireProveedor,
  pedidoController.getPedidosAsignados
);

/**
 * Actualizar estado de un pedido
 * PUT /api/pedidos/:id/estado
 * Body: { estado: "enviado" }
 * Estados válidos: despacho, enviado, entregado
 */
router.put(
  '/:id/estado',
  verifyToken,
  requireProveedor,
  pedidoController.actualizarEstadoPedido
);

module.exports = router;