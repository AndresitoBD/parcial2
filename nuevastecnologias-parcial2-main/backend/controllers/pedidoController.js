const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const { query } = require('../config/database');

// ============================================
// ENDPOINTS PARA TENDERO
// ============================================

/**
 * Crear nuevo pedido
 * POST /api/pedidos
 * Requiere: rol 'tendero'
 */
const createPedido = async (req, res) => {
  try {
    const { productos } = req.body; // Array de {producto_id, cantidad}
    const tendero_id = req.user.id;
    const zona_id = req.user.zona_id;

    // Validar que el tendero tenga zona asignada
    if (!zona_id) {
      return res.status(400).json({
        error: 'Zona no asignada',
        message: 'El tendero debe tener una zona asignada para realizar pedidos'
      });
    }

    // Verificar que no tenga un pedido activo
    const pedidoActivo = await Pedido.findActivePedidoByTendero(tendero_id);
    if (pedidoActivo) {
      return res.status(400).json({
        error: 'Pedido activo existente',
        message: 'Ya tienes un pedido activo. Debes marcarlo como recibido antes de crear uno nuevo.',
        pedido_activo: {
          id: pedidoActivo.id,
          estado: pedidoActivo.estado,
          fecha_pedido: pedidoActivo.fecha_pedido
        }
      });
    }

    // Validar que haya productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({
        error: 'Sin productos',
        message: 'Debes incluir al menos un producto en el pedido'
      });
    }

    // Validar cantidades
    for (const prod of productos) {
      if (!prod.cantidad || prod.cantidad <= 0) {
        return res.status(400).json({
          error: 'Cantidad inválida',
          message: 'Todas las cantidades deben ser mayores a 0'
        });
      }
    }

    // Obtener información de los productos para validar y obtener precios
    const productosIds = productos.map(p => p.producto_id);
    const productosDB = await Producto.findByIds(productosIds);

    if (productosDB.length !== productos.length) {
      return res.status(400).json({
        error: 'Productos inválidos',
        message: 'Algunos productos no existen o no están disponibles'
      });
    }

    // Preparar datos de productos con precios actuales
    const productosConPrecio = productos.map(p => {
      const producto = productosDB.find(pr => pr.id === p.producto_id);
      return {
        producto_id: p.producto_id,
        cantidad: p.cantidad,
        precio_unitario: producto.precio_base
      };
    });

    // Crear pedido
    const pedidoId = await Pedido.create({
      tendero_id,
      zona_id,
      productos: productosConPrecio
    });

    // Obtener pedido completo con detalles
    const pedidoCompleto = await Pedido.findByIdWithDetails(pedidoId);

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      data: pedidoCompleto,
      info: 'Tu pedido será consolidado con otros pedidos de tu zona en las próximas 72 horas'
    });

  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear el pedido'
    });
  }
};

/**
 * Obtener mis pedidos
 * GET /api/pedidos/mis-pedidos
 * Requiere: rol 'tendero'
 */
const getMisPedidos = async (req, res) => {
  try {
    const tendero_id = req.user.id;

    const pedidos = await Pedido.findByTendero(tendero_id);

    // Obtener detalles de cada pedido
    const pedidosConDetalles = await Promise.all(
      pedidos.map(async (pedido) => {
        const detalles = await Pedido.getDetalles(pedido.id);
        
        // Calcular total
        const total = detalles.reduce((sum, det) => sum + parseFloat(det.subtotal), 0);
        
        return {
          id: pedido.id,
          estado: pedido.estado,
          fecha_pedido: pedido.fecha_pedido,
          fecha_limite: pedido.fecha_limite,
          zona_nombre: pedido.zona_nombre,
          total: total.toFixed(2),
          productos: detalles.map(d => ({
            producto_id: d.producto_id,
            nombre: d.producto_nombre,
            cantidad: d.cantidad,
            precio_unitario: parseFloat(d.precio_unitario).toFixed(2),
            subtotal: parseFloat(d.subtotal).toFixed(2),
            unidad: d.unidad,
            recibido: d.recibido === 1
          }))
        };
      })
    );

    res.json({
      message: 'Pedidos obtenidos exitosamente',
      data: pedidosConDetalles,
      total: pedidosConDetalles.length
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pedidos'
    });
  }
};

/**
 * Marcar producto como recibido
 * PUT /api/pedidos/:id/recibir
 * Requiere: rol 'tendero'
 */
const marcarProductoRecibido = async (req, res) => {
  try {
    const { id: pedidoId } = req.params;
    const { producto_id } = req.body;
    const tendero_id = req.user.id;

    // Validar que se envió el producto_id
    if (!producto_id) {
      return res.status(400).json({
        error: 'Producto requerido',
        message: 'Debes especificar el ID del producto'
      });
    }

    // Obtener pedido con detalles
    const pedido = await Pedido.findByIdWithDetails(pedidoId);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado',
        message: 'El pedido especificado no existe'
      });
    }

    // Verificar que el pedido pertenece al tendero
    if (pedido.tendero_id !== tendero_id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este pedido no te pertenece'
      });
    }

    // Verificar que el pedido esté en estado "entregado"
    if (pedido.estado !== 'entregado') {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'Solo puedes marcar como recibido pedidos que estén en estado "entregado"',
        estado_actual: pedido.estado
      });
    }

    // Marcar producto como recibido
    const marcado = await Pedido.marcarProductoRecibido(pedidoId, producto_id);

    if (!marcado) {
      return res.status(400).json({
        error: 'No se pudo marcar',
        message: 'El producto no pudo ser marcado como recibido. Verifica que exista en el pedido.'
      });
    }

    // Verificar si todos los productos fueron recibidos
    const todosRecibidos = await Pedido.todosProductosRecibidos(pedidoId);

    // Si todos fueron recibidos, actualizar estado del pedido a "recibido"
    if (todosRecibidos) {
      await Pedido.updateEstado(pedidoId, 'recibido');
    }

    res.json({
      message: todosRecibidos 
        ? 'Todos los productos han sido recibidos. Pedido completado.' 
        : 'Producto marcado como recibido',
      pedido_completado: todosRecibidos,
      puede_crear_nuevo_pedido: todosRecibidos
    });

  } catch (error) {
    console.error('Error marcando producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo marcar el producto como recibido'
    });
  }
};

// ============================================
// ENDPOINTS PARA PLATAFORMA
// ============================================

/**
 * Obtener todos los pedidos
 * GET /api/pedidos/todos
 * Requiere: rol 'plataforma'
 * Query params: zona_id, estado
 * ✅ IMPLEMENTADO: Filtros dinámicos funcionando
 */
const getTodosPedidos = async (req, res) => {
  try {
    const { zona_id, estado } = req.query;

    let sql = `
      SELECT 
        p.*,
        u.nombre as tendero_nombre,
        u.email as tendero_email,
        u.contacto as tendero_contacto,
        z.nombre as zona_nombre,
        prov.nombre as proveedor_nombre
      FROM pedidos p
      JOIN usuarios u ON p.tendero_id = u.id
      JOIN zonas z ON p.zona_id = z.id
      LEFT JOIN usuarios prov ON p.proveedor_id = prov.id
      WHERE 1=1
    `;

    const params = [];

    // ✅ Filtro por zona IMPLEMENTADO
    if (zona_id) {
      sql += ' AND p.zona_id = ?';
      params.push(zona_id);
    }

    // ✅ Filtro por estado IMPLEMENTADO
    if (estado) {
      sql += ' AND p.estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY p.fecha_pedido DESC';

    const pedidos = await query(sql, params);

    // Obtener detalles de cada pedido
    const pedidosConDetalles = await Promise.all(
      pedidos.map(async (pedido) => {
        const detalles = await Pedido.getDetalles(pedido.id);
        const total = detalles.reduce((sum, det) => sum + parseFloat(det.subtotal), 0);
        
        return {
          ...pedido,
          total: total.toFixed(2),
          productos: detalles
        };
      })
    );

    // Estadísticas generales
    const estadisticas = {
      total_pedidos: pedidosConDetalles.length,
      por_estado: {},
      por_zona: {}
    };

    pedidosConDetalles.forEach(p => {
      // Contar por estado
      estadisticas.por_estado[p.estado] = (estadisticas.por_estado[p.estado] || 0) + 1;
      
      // Contar por zona
      estadisticas.por_zona[p.zona_nombre] = (estadisticas.por_zona[p.zona_nombre] || 0) + 1;
    });

    res.json({
      message: 'Pedidos obtenidos exitosamente',
      data: pedidosConDetalles,
      estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pedidos'
    });
  }
};

/**
 * Consolidar pedidos por zona
 * POST /api/pedidos/consolidar
 * Requiere: rol 'plataforma'
 */
const consolidarPedidos = async (req, res) => {
  try {
    const { pedidos_ids } = req.body;

    // Validar que se enviaron IDs
    if (!pedidos_ids || pedidos_ids.length === 0) {
      return res.status(400).json({
        error: 'Sin pedidos',
        message: 'Debes seleccionar al menos un pedido para consolidar'
      });
    }

    // Obtener información de los pedidos
    const placeholders = pedidos_ids.map(() => '?').join(',');
    const sql = `
      SELECT p.*, z.nombre as zona_nombre
      FROM pedidos p
      JOIN zonas z ON p.zona_id = z.id
      WHERE p.id IN (${placeholders})
    `;
    
    const pedidos = await query(sql, pedidos_ids);

    // Validar que todos los pedidos existen
    if (pedidos.length !== pedidos_ids.length) {
      return res.status(400).json({
        error: 'Pedidos inválidos',
        message: 'Algunos pedidos no existen'
      });
    }

    // Validar que todos sean de la misma zona
    const zonaId = pedidos[0].zona_id;
    const todosLaMismaZona = pedidos.every(p => p.zona_id === zonaId);
    
    if (!todosLaMismaZona) {
      return res.status(400).json({
        error: 'Zonas diferentes',
        message: 'Todos los pedidos deben ser de la misma zona para consolidar',
        zona_requerida: pedidos[0].zona_nombre
      });
    }

    // Validar que todos estén en estado "pendiente"
    const todosPendientes = pedidos.every(p => p.estado === 'pendiente');
    
    if (!todosPendientes) {
      return res.status(400).json({
        error: 'Estados inválidos',
        message: 'Solo se pueden consolidar pedidos en estado "pendiente"'
      });
    }

    // Actualizar estado a "consolidacion"
    const updateSql = `
      UPDATE pedidos 
      SET estado = 'consolidacion' 
      WHERE id IN (${placeholders})
    `;
    
    await query(updateSql, pedidos_ids);

    res.json({
      message: 'Pedidos consolidados exitosamente',
      pedidos_consolidados: pedidos_ids.length,
      zona: pedidos[0].zona_nombre,
      estado_nuevo: 'consolidacion',
      siguiente_paso: 'Asignar proveedor a estos pedidos'
    });

  } catch (error) {
    console.error('Error consolidando pedidos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron consolidar los pedidos'
    });
  }
};

/**
 * Asignar proveedor a pedidos
 * PUT /api/pedidos/asignar-proveedor
 * Requiere: rol 'plataforma'
 */
const asignarProveedor = async (req, res) => {
  try {
    const { pedidos_ids, proveedor_id } = req.body;

    // Validaciones
    if (!pedidos_ids || pedidos_ids.length === 0) {
      return res.status(400).json({
        error: 'Sin pedidos',
        message: 'Debes seleccionar al menos un pedido'
      });
    }

    if (!proveedor_id) {
      return res.status(400).json({
        error: 'Sin proveedor',
        message: 'Debes seleccionar un proveedor'
      });
    }

    // Verificar que el proveedor existe y tiene rol correcto
    const proveedor = await Usuario.findById(proveedor_id);
    
    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado',
        message: 'El proveedor especificado no existe'
      });
    }

    if (proveedor.rol !== 'proveedor') {
      return res.status(400).json({
        error: 'Rol inválido',
        message: 'El usuario seleccionado no es un proveedor'
      });
    }

    // Obtener pedidos
    const placeholders = pedidos_ids.map(() => '?').join(',');
    const selectSql = `SELECT * FROM pedidos WHERE id IN (${placeholders})`;
    const pedidos = await query(selectSql, pedidos_ids);

    // Validar que estén en estado "consolidacion"
    const todosEnConsolidacion = pedidos.every(p => p.estado === 'consolidacion');
    
    if (!todosEnConsolidacion) {
      return res.status(400).json({
        error: 'Estados inválidos',
        message: 'Solo se pueden asignar proveedores a pedidos en estado "consolidacion"'
      });
    }

    // Asignar proveedor y cambiar estado
    const updateSql = `
      UPDATE pedidos 
      SET proveedor_id = ?, estado = 'asignacion'
      WHERE id IN (${placeholders})
    `;
    
    await query(updateSql, [proveedor_id, ...pedidos_ids]);

    res.json({
      message: 'Proveedor asignado exitosamente',
      proveedor: {
        id: proveedor.id,
        nombre: proveedor.nombre,
        email: proveedor.email
      },
      pedidos_asignados: pedidos_ids.length,
      estado_nuevo: 'asignacion'
    });

  } catch (error) {
    console.error('Error asignando proveedor:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo asignar el proveedor'
    });
  }
};

/**
 * Marcar pedidos como despachados
 * PUT /api/pedidos/despachar
 * Requiere: rol 'plataforma'
 */
const despacharPedidos = async (req, res) => {
  try {
    const { pedidos_ids } = req.body;

    if (!pedidos_ids || pedidos_ids.length === 0) {
      return res.status(400).json({
        error: 'Sin pedidos',
        message: 'Debes seleccionar al menos un pedido'
      });
    }

    const placeholders = pedidos_ids.map(() => '?').join(',');
    const updateSql = `
      UPDATE pedidos 
      SET estado = 'despacho'
      WHERE id IN (${placeholders}) AND estado = 'asignacion'
    `;
    
    const result = await query(updateSql, pedidos_ids);

    res.json({
      message: 'Pedidos marcados como despachados',
      pedidos_actualizados: result.affectedRows,
      estado_nuevo: 'despacho'
    });

  } catch (error) {
    console.error('Error despachando pedidos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron despachar los pedidos'
    });
  }
};

// ============================================
// ENDPOINTS PARA PROVEEDOR
// ============================================

/**
 * Obtener pedidos asignados al proveedor
 * GET /api/pedidos/asignados
 * Requiere: rol 'proveedor'
 */
const getPedidosAsignados = async (req, res) => {
  try {
    const proveedor_id = req.user.id;
    const { estado, zona_id } = req.query;

    let sql = `
      SELECT 
        p.*,
        u.nombre as tendero_nombre,
        u.email as tendero_email,
        u.contacto as tendero_contacto,
        z.nombre as zona_nombre
      FROM pedidos p
      JOIN usuarios u ON p.tendero_id = u.id
      JOIN zonas z ON p.zona_id = z.id
      WHERE p.proveedor_id = ?
    `;

    const params = [proveedor_id];

    if (estado) {
      sql += ' AND p.estado = ?';
      params.push(estado);
    }

    if (zona_id) {
      sql += ' AND p.zona_id = ?';
      params.push(zona_id);
    }

    sql += ' ORDER BY p.fecha_pedido DESC';

    const pedidos = await query(sql, params);

    // Obtener detalles
    const pedidosConDetalles = await Promise.all(
      pedidos.map(async (pedido) => {
        const detalles = await Pedido.getDetalles(pedido.id);
        const total = detalles.reduce((sum, det) => sum + parseFloat(det.subtotal), 0);
        
        return {
          ...pedido,
          total: total.toFixed(2),
          productos: detalles
        };
      })
    );

    res.json({
      message: 'Pedidos asignados obtenidos exitosamente',
      data: pedidosConDetalles,
      total: pedidosConDetalles.length
    });

  } catch (error) {
    console.error('Error obteniendo pedidos asignados:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pedidos asignados'
    });
  }
};

/**
 * Actualizar estado de pedido
 * PUT /api/pedidos/:id/estado
 * Requiere: rol 'proveedor'
 */
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const proveedor_id = req.user.id;

    // Validar que se envió el estado
    if (!estado) {
      return res.status(400).json({
        error: 'Estado requerido',
        message: 'Debes especificar el nuevo estado'
      });
    }

    // Estados válidos para proveedores
    const estadosValidos = ['despacho', 'enviado', 'entregado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'El estado debe ser: despacho, enviado o entregado',
        estados_validos: estadosValidos
      });
    }

    // Verificar que el pedido existe y está asignado al proveedor
    const pedidoSql = 'SELECT * FROM pedidos WHERE id = ?';
    const pedidos = await query(pedidoSql, [id]);
    
    if (pedidos.length === 0) {
      return res.status(404).json({
        error: 'Pedido no encontrado',
        message: 'El pedido especificado no existe'
      });
    }

    const pedido = pedidos[0];

    if (pedido.proveedor_id !== proveedor_id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este pedido no está asignado a ti'
      });
    }

    // Actualizar estado
    const actualizado = await Pedido.updateEstado(id, estado);

    if (!actualizado) {
      return res.status(400).json({
        error: 'No se pudo actualizar',
        message: 'El estado del pedido no pudo ser actualizado'
      });
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      pedido_id: parseInt(id),
      estado_anterior: pedido.estado,
      estado_nuevo: estado
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el estado del pedido'
    });
  }
};

module.exports = {
  // Tendero
  createPedido,
  getMisPedidos,
  marcarProductoRecibido,
  
  // Plataforma
  getTodosPedidos,
  consolidarPedidos,
  asignarProveedor,
  despacharPedidos,
  
  // Proveedor
  getPedidosAsignados,
  actualizarEstadoPedido
};