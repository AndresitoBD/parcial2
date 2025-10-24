require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: '24h'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'parcial_pedidos',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: 10
  }
};