# Plan de Trabajo Detallado - Parcial Pedidos

## Cronograma Sugerido (6 horas total)

### FASE 1: Setup y Configuración (1 hora)

#### 1.1 Configuración del entorno (20 min)
- [ ] Crear repositorio en GitHub
- [ ] Configurar .gitpod.yml para desarrollo
- [ ] Crear estructura de carpetas backend/frontend
- [ ] Instalar dependencias básicas

#### 1.2 Base de datos (25 min)
- [ ] Configurar base de datos MySQL/PostgreSQL online
- [ ] Ejecutar script de creación de tablas
- [ ] Insertar datos de prueba
- [ ] Probar conexión desde Node.js

#### 1.3 Backend inicial (15 min)
- [ ] Configurar Express server
- [ ] Configurar CORS y middleware básico
- [ ] Crear conexión a BD
- [ ] Probar endpoint de salud

### FASE 2: Backend Development (2.5 horas)

#### 2.1 Modelos y Base (30 min)
- [ ] Crear modelos de Usuario, Producto, Pedido
- [ ] Configurar conexión a BD con pool
- [ ] Crear funciones base de consulta

#### 2.2 Autenticación (30 min)
- [ ] Implementar registro de usuarios
- [ ] Implementar login con JWT
- [ ] Middleware de autenticación
- [ ] Validación de roles

#### 2.3 API de Productos (20 min)
- [ ] GET /api/productos (listar)
- [ ] POST /api/productos (crear - solo plataforma)
- [ ] Validaciones básicas

#### 2.4 API de Pedidos - Tendero (40 min)
- [ ] POST /api/pedidos (crear pedido)
- [ ] GET /api/pedidos/mis-pedidos
- [ ] PUT /api/pedidos/:id/recibir
- [ ] Validar un pedido activo por tendero

#### 2.5 API de Pedidos - Plataforma (30 min)
- [ ] GET /api/pedidos/todos
- [ ] PUT /api/pedidos/consolidar
- [ ] PUT /api/pedidos/asignar-proveedor
- [ ] Lógica de consolidación por zona

#### 2.6 API de Pedidos - Proveedor (20 min)
- [ ] GET /api/pedidos/asignados
- [ ] PUT /api/pedidos/:id/estado
- [ ] Consultas por zona/tienda

### FASE 3: Frontend Development (2 horas)

#### 3.1 Setup React y Routing (20 min)
- [ ] Configurar React Router
- [ ] Crear AuthContext
- [ ] Configurar servicios de API
- [ ] Componentes base (Header, Loading)

#### 3.2 Autenticación (25 min)
- [ ] Página de Login
- [ ] Página de Registro
- [ ] Hook useAuth
- [ ] Protección de rutas

#### 3.3 Dashboard Tendero (35 min)
- [ ] Vista de productos disponibles
- [ ] Formulario de nuevo pedido
- [ ] Lista de mis pedidos
- [ ] Marcar productos como recibidos

#### 3.4 Dashboard Plataforma (30 min)
- [ ] Vista de todos los pedidos
- [ ] Botones de consolidación
- [ ] Asignación de proveedores
- [ ] Gestión de productos

#### 3.5 Dashboard Proveedor (20 min)
- [ ] Vista de pedidos asignados
- [ ] Actualización de estados
- [ ] Filtros por zona

#### 3.6 Estilos y UX (10 min)
- [ ] CSS básico responsive
- [ ] Estados de carga
- [ ] Mensajes de error/éxito

### FASE 4: Integración y Testing (30 min)

#### 4.1 Pruebas de flujo completo (20 min)
- [ ] Registro de tendero → pedido → consolidación → entrega
- [ ] Validar restricciones (un pedido activo, 72 horas)
- [ ] Probar todos los roles

#### 4.2 Ajustes finales (10 min)
- [ ] Corregir bugs encontrados
- [ ] Optimizar consultas lentas
- [ ] Validar que corre en Gitpod

## Checklist de Entregables

### Funcionalidad Mínima Requerida
- [ ] Registro de tenderos por zona
- [ ] Creación de pedidos (selección de productos)
- [ ] Consolidación por zona
- [ ] Asignación de proveedores
- [ ] Actualización de estados
- [ ] Restricción: un pedido activo por tendero
- [ ] Manejo de plazos (72 horas)

### Criterios de Evaluación
- [ ] **Proyecto completo**: Carpetas organizadas frontend/backend
- [ ] **Ejecución funcional**: Corre sin errores, vistas interactivas
- [ ] **Funcionalidad mínima**: Todos los flujos principales funcionan
- [ ] **Video demostrativo**: 5 min mostrando flujo completo
- [ ] **Diseño UX**: Interfaz clara y funcional

### Archivos de Entrega
- [ ] Carpeta comprimida del proyecto
- [ ] Script SQL de la base de datos
- [ ] Video de demostración (máx 5 min)
- [ ] Capturas de pantalla principales
- [ ] README con instrucciones de instalación

## Consejos para el Desarrollo

1. **Empezar simple**: Implementar funcionalidad básica primero
2. **Probar frecuentemente**: Cada endpoint y componente
3. **Datos de prueba**: Crear usuarios y productos de ejemplo
4. **Estados claros**: Usar enums para estados de pedidos
5. **Validaciones**: Tanto frontend como backend
6. **Error handling**: Manejar errores de red y BD
7. **Responsive**: Que funcione en móvil y desktop

## Tecnologías Específicas

### Backend
- Node.js + Express
- MySQL/PostgreSQL (online)
- JWT para autenticación
- bcrypt para passwords
- cors, helmet para seguridad

### Frontend  
- React 18 con Hooks
- React Router v6
- Fetch API (no axios para simplicidad)
- CSS modules o styled-components
- Context API para estado global

### Base de Datos Online Recomendadas
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL/MySQL)
- **Aiven** (PostgreSQL/MySQL)