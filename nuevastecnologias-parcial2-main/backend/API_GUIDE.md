# Guía de API - Plataforma de Pedidos

## 🎯 Puntos Completados

✅ **2.1 Modelos y Base** - Modelos de Usuario, Producto, Pedido, Zona con funciones de consulta
✅ **2.2 Autenticación** - Login, registro, JWT, middleware de roles
✅ **2.3 API de Productos** - CRUD completo con validaciones y permisos

## 🔐 Autenticación

### 1. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@plataforma.com",
  "password": "123456"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre": "Admin Plataforma",
    "email": "admin@plataforma.com",
    "rol": "plataforma",
    "zona_id": null
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

### 2. Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Nuevo Tendero",
  "email": "nuevo@email.com",
  "password": "123456",
  "rol": "tendero",
  "contacto": "3001234567",
  "zona_id": 1
}
```

### 3. Obtener Perfil
```bash
GET /api/auth/profile
Authorization: Bearer <token>
```

### 4. Verificar Token
```bash
GET /api/auth/verify
Authorization: Bearer <token>
```

## 🛒 API de Productos

### 1. Obtener Todos los Productos
```bash
GET /api/productos
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "message": "Productos obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Arroz",
      "descripcion": "Arroz blanco de primera calidad",
      "precio_base": 2500,
      "unidad": "kg",
      "activo": 1,
      "created_at": "2024-10-20T00:46:22.000Z"
    }
  ],
  "total": 8
}
```

### 2. Obtener Producto por ID
```bash
GET /api/productos/1
Authorization: Bearer <token>
```

### 3. Crear Producto (Solo Plataforma)
```bash
POST /api/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio_base": 1500.00,
  "unidad": "unidad"
}
```

### 4. Actualizar Producto (Solo Plataforma)
```bash
PUT /api/productos/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Producto Actualizado",
  "descripcion": "Nueva descripción",
  "precio_base": 2000.00,
  "unidad": "kg"
}
```

### 5. Eliminar Producto (Solo Plataforma)
```bash
DELETE /api/productos/1
Authorization: Bearer <token>
```

## 🗺️ API de Zonas

### Obtener Todas las Zonas
```bash
GET /api/zonas
```

**Respuesta:**
```json
{
  "message": "Zonas obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Norte",
      "descripcion": "Zona norte de la ciudad"
    }
  ],
  "total": 4
}
```

## 👥 Usuarios de Prueba

Todos con password: **123456**

### Plataforma
- **Email:** admin@plataforma.com
- **Rol:** plataforma
- **Permisos:** Crear/editar/eliminar productos, gestionar pedidos

### Proveedores
- **Email:** proveedor1@email.com
- **Email:** proveedor2@email.com
- **Rol:** proveedor
- **Permisos:** Ver pedidos asignados, actualizar estados

### Tenderos
- **Email:** tendero1@email.com (Zona Norte)
- **Email:** tendero2@email.com (Zona Norte)
- **Email:** tendero3@email.com (Zona Sur)
- **Rol:** tendero
- **Permisos:** Crear pedidos, ver sus pedidos, marcar como recibido

## 🔒 Sistema de Permisos

### Roles y Accesos
- **Plataforma:** Acceso completo a productos y gestión de pedidos
- **Proveedor:** Solo pedidos asignados y actualización de estados
- **Tendero:** Solo sus propios pedidos y productos (lectura)

### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🧪 Cómo Probar con Postman/Insomnia

### 1. Login
1. POST a `/api/auth/login`
2. Copiar el `token` de la respuesta

### 2. Configurar Authorization
1. Agregar header: `Authorization: Bearer <token>`
2. Usar este header en todas las requests protegidas

### 3. Probar Productos
1. GET `/api/productos` - Ver todos
2. POST `/api/productos` - Crear (solo plataforma)
3. PUT `/api/productos/1` - Actualizar (solo plataforma)

### 4. Probar Permisos
1. Login como tendero
2. Intentar POST `/api/productos` - Debería dar 403 Forbidden

## 🚀 Próximos Pasos

- [ ] 2.4 API de Pedidos - Tendero (40 min)
- [ ] 2.5 API de Pedidos - Plataforma (30 min)
- [ ] 2.6 API de Pedidos - Proveedor (20 min)

## 📊 Estado del Servidor

- **URL Base:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **Base de Datos:** ✅ Conectada (Clever Cloud MySQL)
- **Autenticación:** ✅ JWT funcionando
- **Productos:** ✅ CRUD completo
- **Validaciones:** ✅ Implementadas