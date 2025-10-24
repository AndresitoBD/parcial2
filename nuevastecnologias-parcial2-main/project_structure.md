# Estructura del Proyecto - Plataforma de Pedidos

```
parcial-pedidos/
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuración de BD
│   │   └── config.js            # Variables de entorno
│   ├── controllers/
│   │   ├── authController.js    # Login/registro
│   │   ├── pedidoController.js  # Gestión de pedidos
│   │   ├── productoController.js # Gestión de productos
│   │   └── usuarioController.js # Gestión de usuarios
│   ├── models/
│   │   ├── Usuario.js           # Modelo de usuario
│   │   ├── Producto.js          # Modelo de producto
│   │   ├── Pedido.js            # Modelo de pedido
│   │   └── Zona.js              # Modelo de zona
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── pedidos.js           # Rutas de pedidos
│   │   ├── productos.js         # Rutas de productos
│   │   └── usuarios.js          # Rutas de usuarios
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   └── validation.js        # Validaciones
│   ├── utils/
│   │   └── helpers.js           # Funciones auxiliares
│   ├── package.json
│   └── server.js                # Servidor principal
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   └── Loading.js
│   │   │   ├── tendero/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── NuevoPedido.js
│   │   │   │   └── MisPedidos.js
│   │   │   ├── plataforma/
│   │   │   │   ├── Dashboard.js
│   │   │   │   ├── GestionPedidos.js
│   │   │   │   └── GestionProductos.js
│   │   │   └── proveedor/
│   │   │       ├── Dashboard.js
│   │   │       └── PedidosAsignados.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Home.js
│   │   ├── services/
│   │   │   └── api.js            # Configuración de API
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Hook de autenticación
│   │   ├── context/
│   │   │   └── AuthContext.js    # Context de usuario
│   │   ├── utils/
│   │   │   └── constants.js      # Constantes
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── database/
│   ├── schema.sql               # Esquema de BD
│   └── seed_data.sql            # Datos iniciales
├── docs/
│   ├── api_endpoints.md         # Documentación de APIs
│   └── user_flows.md            # Flujos de usuario
├── .gitpod.yml                  # Configuración de Gitpod
├── README.md
└── package.json                 # Scripts generales
```

## Componentes Principales por Rol

### Tendero
- **Dashboard**: Resumen de pedidos activos
- **Nuevo Pedido**: Selección de productos y cantidades
- **Mis Pedidos**: Estado de pedidos y marcar como recibido

### Plataforma Central
- **Dashboard**: Vista general de todos los pedidos
- **Gestión de Pedidos**: Consolidar y asignar proveedores
- **Gestión de Productos**: CRUD de productos

### Proveedor
- **Dashboard**: Pedidos consolidados asignados
- **Actualizar Estados**: Cambiar estado de envíos
- **Consultas**: Ver pedidos por zona/tienda

## APIs Principales

### Autenticación
- POST /api/auth/login
- POST /api/auth/register

### Pedidos
- GET /api/pedidos (por rol)
- POST /api/pedidos (crear pedido)
- PUT /api/pedidos/:id/estado
- PUT /api/pedidos/:id/recibir

### Productos
- GET /api/productos
- POST /api/productos (solo plataforma)

### Consolidación
- POST /api/pedidos/consolidar
- PUT /api/pedidos/asignar-proveedor