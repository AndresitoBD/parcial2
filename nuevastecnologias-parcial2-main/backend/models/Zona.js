const { query } = require('../config/database');

class Zona {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.created_at = data.created_at;
  }

  // Obtener todas las zonas
  static async findAll() {
    const sql = 'SELECT * FROM zonas ORDER BY nombre';
    const results = await query(sql);
    return results.map(zona => new Zona(zona));
  }

  // Buscar por ID
  static async findById(id) {
    const sql = 'SELECT * FROM zonas WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? new Zona(results[0]) : null;
  }

  // Crear nueva zona
  static async create(zonaData) {
    const { nombre, descripcion } = zonaData;
    
    const sql = 'INSERT INTO zonas (nombre, descripcion) VALUES (?, ?)';
    const result = await query(sql, [nombre, descripcion]);
    return result.insertId;
  }

  // Obtener tenderos por zona
  static async getTenderos(zonaId) {
    const sql = `
      SELECT u.id, u.nombre, u.email, u.contacto
      FROM usuarios u
      WHERE u.zona_id = ? AND u.rol = 'tendero' AND u.activo = 1
      ORDER BY u.nombre
    `;
    
    return await query(sql, [zonaId]);
  }

  // Verificar si nombre ya existe
  static async nameExists(nombre, excludeId = null) {
    let sql = 'SELECT id FROM zonas WHERE nombre = ?';
    let params = [nombre];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }
}

module.exports = Zona;