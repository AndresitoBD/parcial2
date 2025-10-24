const { query } = require('../config/database');

class Pedido {
  constructor(data) {
    this.id = data.id;
    this.tendero_id = data.tendero_id;
    this.zona_id = data.zona_id;
    this.estado = data.estado;
    this.fecha_pedido = data.fecha_pedido;
    this.fecha_limite = data.fecha_limite;
    this.proveedor_id = data.proveedor_id;
  }

  // Estados válidos
  static get ESTADOS() {
    return {
      PENDIENTE: 'pendiente',
      CONSOLIDACION: 'consolidacion',
      ASIGNACION: 'asignacion',
      DESPACHO: 'despacho',
      ENVIADO: 'enviado',
      ENTREGADO: 'entregado',
      RECIBIDO: 'recibido'
    };
  }

  // Crear nuevo pedido
  static async create(pedidoData) {
    const { tendero_id, zona_id, productos } = pedidoData;
    
    // Calcular fecha límite (72 horas)
    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + 72);
    
    // Crear pedido principal
    const sqlPedido = `
      INSERT INTO pedidos (tendero_id, zona_id, fecha_limite) 
      VALUES (?, ?, ?)
    `;
    
    const result = await query(sqlPedido, [tendero_id, zona_id, fechaLimite]);
    const pedidoId = result.insertId;
    
    // Insertar detalles del pedido
    if (productos && productos.length > 0) {
      const sqlDetalle = `
        INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario, subtotal) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      for (const producto of productos) {
        const subtotal = producto.cantidad * producto.precio_unitario;
        await query(sqlDetalle, [
          pedidoId, 
          producto.producto_id, 
          producto.cantidad, 
          producto.precio_unitario, 
          subtotal
        ]);
      }
    }
    
    return pedidoId;
  }

  // Buscar pedidos por tendero
  static async findByTendero(tenderoId) {
    const sql = `
      SELECT p.*, u.nombre as tendero_nombre, z.nombre as zona_nombre
      FROM pedidos p
      JOIN usuarios u ON p.tendero_id = u.id
      JOIN zonas z ON p.zona_id = z.id
      WHERE p.tendero_id = ?
      ORDER BY p.fecha_pedido DESC
    `;
    
    const results = await query(sql, [tenderoId]);
    return results.map(pedido => new Pedido(pedido));
  }

  // Buscar pedido activo por tendero
  static async findActivePedidoByTendero(tenderoId) {
    const sql = `
      SELECT * FROM pedidos 
      WHERE tendero_id = ? AND estado IN ('pendiente', 'consolidacion', 'asignacion', 'despacho', 'enviado')
      ORDER BY fecha_pedido DESC
      LIMIT 1
    `;
    
    const results = await query(sql, [tenderoId]);
    return results.length > 0 ? new Pedido(results[0]) : null;
  }

  // Obtener detalles del pedido
  static async getDetalles(pedidoId) {
    const sql = `
      SELECT pd.*, pr.nombre as producto_nombre, pr.unidad
      FROM pedido_detalles pd
      JOIN productos pr ON pd.producto_id = pr.id
      WHERE pd.pedido_id = ?
    `;
    
    return await query(sql, [pedidoId]);
  }

  // Actualizar estado del pedido
  static async updateEstado(pedidoId, nuevoEstado) {
    const sql = 'UPDATE pedidos SET estado = ? WHERE id = ?';
    const result = await query(sql, [nuevoEstado, pedidoId]);
    return result.affectedRows > 0;
  }

  // Marcar producto como recibido
  static async marcarProductoRecibido(pedidoId, productoId) {
    const sql = `
      UPDATE pedido_detalles 
      SET recibido = 1 
      WHERE pedido_id = ? AND producto_id = ?
    `;
    
    const result = await query(sql, [pedidoId, productoId]);
    return result.affectedRows > 0;
  }

  // Verificar si todos los productos fueron recibidos
  static async todosProductosRecibidos(pedidoId) {
    const sql = `
      SELECT COUNT(*) as total, SUM(recibido) as recibidos
      FROM pedido_detalles 
      WHERE pedido_id = ?
    `;
    
    const results = await query(sql, [pedidoId]);
    const { total, recibidos } = results[0];
    return total === recibidos;
  }

  // Buscar por ID con detalles
  static async findByIdWithDetails(pedidoId) {
    const sql = `
      SELECT p.*, u.nombre as tendero_nombre, z.nombre as zona_nombre
      FROM pedidos p
      JOIN usuarios u ON p.tendero_id = u.id
      JOIN zonas z ON p.zona_id = z.id
      WHERE p.id = ?
    `;
    
    const results = await query(sql, [pedidoId]);
    if (results.length === 0) return null;
    
    const pedido = new Pedido(results[0]);
    pedido.detalles = await this.getDetalles(pedidoId);
    return pedido;
  }
}

module.exports = Pedido;