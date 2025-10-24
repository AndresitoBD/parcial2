# Backend - Plataforma de Pedidos

## Estado Actual ✅

### Puntos Completados
- ✅ **1.3** Express server configurado
- ✅ **1.3** CORS y middleware básico configurado
- ✅ **1.3** Conexión a BD establecida (Clever Cloud MySQL)
- ✅ **1.3** Endpoint de salud funcionando
- ✅ **1.3** Datos iniciales insertados
- ✅ **2.1** Modelos y Base (Usuario, Producto, Pedido, Zona)
- ✅ **2.2** Autenticación (JWT, login, registro, middleware)
- ✅ **2.3** API de Productos (CRUD completo con permisos)

## Endpoints Disponibles

### Health Check
```
GET /health
```
Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2024-10-20T00:46:21.000Z",
  "uptime": 123.45,
  "environment": "development",
  "database": "connected",
  "version": "1.0.0"
}
```

### API Info
```
GET /api
```

### Test Database
```
GET /api/test
```
Respuesta:
```json
{
  "message": "Conexión a BD exitosa",
  "data": {
    "zonas": 4,
    "productos": 8,
    "usuarios": 6
  },
  "timestamp": "2024-10-20T00:46:21.000Z"
}
```

## Datos de Prueba

### Usuarios (password: 123456)
- `admin@plataforma.com` - Rol: plataforma
- `proveedor1@email.com` - Rol: proveedor
- `proveedor2@email.com` - Rol: proveedor  
- `tendero1@email.com` - Rol: tendero (Zona Norte)
- `tendero2@email.com` - Rol: tendero (Zona Norte)
- `tendero3@email.com` - Rol: tendero (Zona Sur)

### Zonas
- Norte, Sur, Centro, Oriente

### Productos
- Arroz, Frijol, Aceite, Azúcar, Sal, Pasta, Leche, Pan

## Cómo Probar

1. **Servidor corriendo**: `npm start`
2. **Health check**: Abrir http://localhost:3000/health
3. **API info**: Abrir http://localhost:3000/api
4. **Test BD**: Abrir http://localhost:3000/api/test

## Próximos Pasos (Fase 2)

- ✅ 2.1 Modelos y Base (30 min)
- ✅ 2.2 Autenticación (30 min)
- ✅ 2.3 API de Productos (20 min)
- [ ] 2.4 API de Pedidos - Tendero (40 min)
- [ ] 2.5 API de Pedidos - Plataforma (30 min)
- [ ] 2.6 API de Pedidos - Proveedor (20 min)

## Configuración

### Variables de Entorno (.env)
```
DB_HOST=bsna0tcrd7otpgvttebb-mysql.services.clever-cloud.com
DB_PORT=3306
DB_NAME=bsna0tcrd7otpgvttebb
DB_USER=u26b3ek11uqehcgv
DB_PASSWORD=1GNefic1tk2vhKdnx1rN
JWT_SECRET=mi_jwt_secret_super_seguro_para_parcial_2024
PORT=3000
NODE_ENV=development
```