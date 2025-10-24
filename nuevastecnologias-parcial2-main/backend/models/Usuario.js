const { query } = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.email = data.email;
    this.password = data.password;
    this.rol = data.rol;
    this.contacto = data.contacto;
    this.zona_id = data.zona_id;
    this.activo = data.activo;
    this.created_at = data.created_at;
  }

  // Crear nuevo usuario
  static async create(userData) {
    const { nombre, email, password, rol, contacto, zona_id } = userData;
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO usuarios (nombre, email, password, rol, contacto, zona_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [nombre, email, hashedPassword, rol, contacto, zona_id]);
    return result.insertId;
  }

  // Buscar por email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND activo = 1';
    const results = await query(sql, [email]);
    return results.length > 0 ? new Usuario(results[0]) : null;
  }

  // Buscar por ID
  static async findById(id) {
    const sql = 'SELECT * FROM usuarios WHERE id = ? AND activo = 1';
    const results = await query(sql, [id]);
    return results.length > 0 ? new Usuario(results[0]) : null;
  }

  // Verificar contraseña
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Obtener usuarios por rol
  static async findByRole(rol) {
    const sql = `
      SELECT u.*, z.nombre as zona_nombre 
      FROM usuarios u 
      LEFT JOIN zonas z ON u.zona_id = z.id 
      WHERE u.rol = ? AND u.activo = 1
    `;
    const results = await query(sql, [rol]);
    return results.map(user => new Usuario(user));
  }

  // Verificar si email ya existe
  static async emailExists(email, excludeId = null) {
    let sql = 'SELECT id FROM usuarios WHERE email = ?';
    let params = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  // Obtener datos sin contraseña
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = Usuario;