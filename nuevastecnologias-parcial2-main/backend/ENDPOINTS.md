# 📡 Listado Completo de Endpoints - API Plataforma de Pedidos

## 🏥 Endpoints de Sistema

### Health Check
- **GET** `/health` - Estado del servidor y BD
- **GET** `/api` - Información general de la API
- **GET** `/api/test` - Prueba de conexión a BD

## 🔐 Autenticación (`/api/auth`)

### Públicos (no requieren token)
- **POST** `/api/auth/login` - Iniciar sesión
- **POST** `/api/auth/register` - Registrar nuevo usuario

### Protegidos (requieren token)
- **GET** `/api/auth/profile` - Obtener perfil del usuario autenticado
- **GET** `/api/auth/verify` - Verificar validez del token

## 🛒 Productos (`/api/productos`)

### Para todos los usuarios autenticados
- **GET** `/api/productos` - Listar todos los productos
- **GET** `/api/productos/:id` - Obtener producto por ID

### Solo para rol "plataforma"
- **POST** `/api/productos` - Crear nuevo producto
- **PUT** `/api/productos/:id` - Actualizar producto existente
- **DELETE** `/api/productos/:id` - Eliminar producto (soft delete)

## 🗺️ Zonas (`/api/zonas`)

### Públicos (no requieren autenticación)
- **GET** `/api/zonas` - Listar todas las zonas disponibles

## 📋 Resumen por Método HTTP

### GET (Consultas)
```
GET /health
GET /api
GET /api/test
GET /api/auth/profile          [🔒 Token requerido]
GET /api/auth/verify           [🔒 Token requerido]
GET /api/productos             [🔒 Token requerido]
GET /api/productos/:id         [🔒 Token requerido]
GET /api/zonas
```

### POST (Crear)
```
POST /api/auth/login
POST /api/auth/register
POST /api/productos            [🔒 Token + Rol "plataforma"]
```

### PUT (Actualizar)
```
PUT /api/productos/:id         [🔒 Token + Rol "plataforma"]
```

### DELETE (Eliminar)
```
DELETE /api/productos/:id      [🔒 Token + Rol "plataforma"]
```

## 🔑 Niveles de Acceso

### 🌐 Público (sin autenticación)
- `/health`
- `/api`
- `/api/test`
- `/api/auth/login`
- `/api/auth/register`
- `/api/zonas`

### 🔒 Autenticado (cualquier rol con token válido)
- `/api/auth/profile`
- `/api/auth/verify`
- `/api/productos` (GET)
- `/api/productos/:id` (GET)

### 👑 Solo Plataforma (rol "plataforma" + token)
- `/api/productos` (POST, PUT, DELETE)

## 📊 Estadísticas

- **Total de endpoints:** 13
- **Públicos:** 6
- **Protegidos:** 4
- **Solo plataforma:** 3
- **Métodos HTTP:** GET (8), POST (3), PUT (1), DELETE (1)

## 🚧 Próximos Endpoints (Pendientes)

### Pedidos - Tendero
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/mis-pedidos` - Ver mis pedidos
- `PUT /api/pedidos/:id/recibir` - Marcar como recibido

### Pedidos - Plataforma
- `GET /api/pedidos/todos` - Ver todos los pedidos
- `PUT /api/pedidos/consolidar` - Consolidar pedidos
- `PUT /api/pedidos/asignar-proveedor` - Asignar proveedor

### Pedidos - Proveedor
- `GET /api/pedidos/asignados` - Ver pedidos asignados
- `PUT /api/pedidos/:id/estado` - Actualizar estado

## 🧪 Cómo Probar

### 1. Sin autenticación
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/zonas
```

### 2. Con autenticación
```bash
# 1. Login para obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@plataforma.com","password":"123456"}'

# 2. Usar token en requests
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

### 3. Solo plataforma
```bash
# Crear producto (requiere rol plataforma)
curl -X POST http://localhost:3000/api/productos \
  -H "Authorization: Bearer <TOKEN_PLATAFORMA>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Nuevo","descripcion":"Test","precio_base":1000,"unidad":"kg"}'
```