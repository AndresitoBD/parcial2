const { query } = require('../config/database');

class Producto {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.precio_base = parseFloat(data.precio_base);
    this.unidad = data.unidad;
    this.activo = data.activo;
    this.created_at = data.created_at;
  }

  // Obtener todos los productos activos
  static async findAll() {
    const sql = 'SELECT * FROM productos WHERE activo = 1 ORDER BY nombre';
    const results = await query(sql);
    return results.map(producto => new Producto(producto));
  }

  // Buscar por ID
  static async findById(id) {
    const sql = 'SELECT * FROM productos WHERE id = ? AND activo = 1';
    const results = await query(sql, [id]);
    return results.length > 0 ? new Producto(results[0]) : null;
  }

  // Crear nuevo producto
  static async create(productData) {
    const { nombre, descripcion, precio_base, unidad } = productData;
    
    const sql = `
      INSERT INTO productos (nombre, descripcion, precio_base, unidad) 
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query(sql, [nombre, descripcion, precio_base, unidad]);
    return result.insertId;
  }

  // Actualizar producto
  static async update(id, productData) {
    const { nombre, descripcion, precio_base, unidad } = productData;
    
    const sql = `
      UPDATE productos 
      SET nombre = ?, descripcion = ?, precio_base = ?, unidad = ?
      WHERE id = ? AND activo = 1
    `;
    
    const result = await query(sql, [nombre, descripcion, precio_base, unidad, id]);
    return result.affectedRows > 0;
  }

  // Desactivar producto (soft delete)
  static async deactivate(id) {
    const sql = 'UPDATE productos SET activo = 0 WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Verificar si nombre ya existe
  static async nameExists(nombre, excludeId = null) {
    let sql = 'SELECT id FROM productos WHERE nombre = ? AND activo = 1';
    let params = [nombre];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  // Buscar productos por IDs
  static async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `SELECT * FROM productos WHERE id IN (${placeholders}) AND activo = 1`;
    const results = await query(sql, ids);
    return results.map(producto => new Producto(producto));
  }
}

module.exports = Producto;