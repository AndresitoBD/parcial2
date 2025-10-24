const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/config');
const { testConnection } = require('./config/database');

// Crear aplicación Express
const app = express();

// Middleware de seguridad
app.use(helmet());

// ✅ Configurar CORS - ACTUALIZADO PARA DESARROLLO Y PRODUCCIÓN
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://tu-dominio.com']
        : [
            'http://localhost:3000',      // Backend
            'http://localhost:3001',      // Frontend (puerto alternativo)
            'http://localhost:5173',      // Vite (puerto default)
            'http://localhost:5174',      // Vite (alternativo)
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:5173'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging básico
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Endpoint de salud
app.get('/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();

        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: config.nodeEnv,
            database: dbStatus ? 'connected' : 'disconnected',
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Endpoint básico de API
app.get('/api', (req, res) => {
    res.json({
        message: 'API de Plataforma de Pedidos',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            test: '/api/test',
            auth: '/api/auth/*',
            productos: '/api/productos',
            pedidos: '/api/pedidos',
            usuarios: '/api/usuarios'
        }
    });
});

// Endpoint de prueba para verificar conexión a BD
app.get('/api/test', async (req, res) => {
    try {
        const { query } = require('./config/database');

        const zonas = await query('SELECT COUNT(*) as total FROM zonas');
        const productos = await query('SELECT COUNT(*) as total FROM productos');
        const usuarios = await query('SELECT COUNT(*) as total FROM usuarios');

        res.json({
            message: 'Conexión a BD exitosa',
            data: {
                zonas: zonas[0].total,
                productos: productos[0].total,
                usuarios: usuarios[0].total
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error consultando base de datos',
            message: error.message
        });
    }
});

// Rutas principales
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/zonas', require('./routes/zonas'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/usuarios', require('./routes/usuarios')); // ✅ ACTIVADA

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);

    res.status(error.status || 500).json({
        error: config.nodeEnv === 'production'
            ? 'Error interno del servidor'
            : error.message,
        ...(config.nodeEnv !== 'production' && { stack: error.stack })
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a BD antes de iniciar
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('⚠️  Servidor iniciando sin conexión a BD');
        }

        app.listen(config.port, () => {
            console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
            console.log(`📍 Entorno: ${config.nodeEnv}`);
            console.log(`🔗 Health check: http://localhost:${config.port}/health`);
            console.log(`📡 API base: http://localhost:${config.port}/api`);
            console.log(`\n✅ CORS habilitado para:`);
            console.log(`   - http://localhost:3000`);
            console.log(`   - http://localhost:3001`);
            console.log(`   - http://localhost:5173 (Vite)`);
        });

    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
};

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor...');
    process.exit(0);
});

// Iniciar aplicación
startServer();
