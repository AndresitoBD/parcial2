# Flujos de Usuario - Plataforma de Pedidos

## Flujo Principal del Sistema

### 1. Flujo del Tendero

#### 1.1 Registro
1. Tendero accede a la plataforma
2. Se registra con: nombre, email, password, zona, contacto
3. Sistema valida datos y crea cuenta
4. Redirección a dashboard

#### 1.2 Crear Pedido
1. Tendero ve lista de productos disponibles
2. Selecciona productos y cantidades
3. Sistema valida que no tenga pedido activo
4. Confirma pedido → Estado: "pendiente"
5. Sistema calcula fecha límite (72 horas)

#### 1.3 Consultar Estado
1. Tendero ve sus pedidos en dashboard
2. Estados posibles:
   - **Pendiente**: Esperando consolidación
   - **Consolidación**: Agrupándose con otros pedidos
   - **Asignación**: Buscando proveedor
   - **Despacho**: Enviado por proveedor
   - **Enviado**: En camino
   - **Entregado**: Llegó a la zona
   - **Recibido**: Confirmado por tendero

#### 1.4 Marcar como Recibido
1. Cuando llega el pedido, tendero marca productos como recibidos
2. Sistema actualiza estado a "recibido"
3. Tendero puede hacer nuevo pedido

### 2. Flujo de la Plataforma Central

#### 2.1 Monitoreo de Pedidos
1. Ve todos los pedidos de todas las zonas
2. Filtra por zona, estado, fecha
3. Identifica pedidos listos para consolidar

#### 2.2 Consolidación por Zona
1. Selecciona pedidos "pendientes" de una zona
2. Agrupa productos iguales (suma cantidades)
3. Cambia estado a "consolidación"
4. Crea pedido consolidado

#### 2.3 Asignación de Proveedor
1. Ve pedidos en "consolidación"
2. Selecciona proveedor disponible
3. Asigna pedido consolidado al proveedor
4. Cambia estado a "asignación"
5. Notifica al proveedor

#### 2.4 Gestión de Productos
1. Puede crear nuevos productos
2. Actualizar precios y disponibilidad
3. Desactivar productos

### 3. Flujo del Proveedor

#### 3.1 Recibir Pedidos Consolidados
1. Ve pedidos asignados en su dashboard
2. Revisa detalles: zona, productos, cantidades
3. Acepta o rechaza pedido

#### 3.2 Actualizar Estados
1. **En preparación**: Preparando productos
2. **Enviado**: Despachó hacia la zona
3. **Entregado**: Llegó a punto de distribución

#### 3.3 Consultas
1. Puede filtrar pedidos por zona
2. Ver histórico de entregas
3. Estadísticas de desempeño

## Reglas de Negocio Importantes

### Restricciones del Tendero
- ✅ Solo puede tener **1 pedido activo** a la vez
- ✅ No puede crear pedido si tiene uno en estados: pendiente, consolidación, asignación, despacho, enviado, entregado
- ✅ Solo puede crear nuevo pedido después de marcar el anterior como "recibido"

### Lógica de Consolidación
- ✅ Se consolidan pedidos de la **misma zona**
- ✅ Solo pedidos en estado "pendiente"
- ✅ Tiempo máximo de espera: **72 horas**
- ✅ Si pasan 72 horas, se consolida automáticamente

### Estados del Sistema
```
Tendero crea pedido → PENDIENTE
↓
Plataforma consolida → CONSOLIDACIÓN  
↓
Plataforma asigna → ASIGNACIÓN
↓
Proveedor acepta → DESPACHO
↓
Proveedor envía → ENVIADO
↓
Proveedor entrega → ENTREGADO
↓
Tendero confirma → RECIBIDO ✅
```

## Casos de Uso Específicos

### Caso 1: Pedido Individual
- 1 tendero de zona Norte pide arroz
- Espera 72 horas por más pedidos
- Si no hay más, se consolida solo
- Se asigna a proveedor

### Caso 2: Pedidos Múltiples
- 3 tenderos de zona Sur piden diferentes productos
- Plataforma consolida todos en un envío
- 1 proveedor recibe pedido consolidado
- Entrega a los 3 tenderos

### Caso 3: Productos Repetidos
- Tendero A pide 5kg arroz
- Tendero B pide 3kg arroz  
- Tendero C pide 2kg frijol
- Consolidado: 8kg arroz + 2kg frijol

## Validaciones Importantes

### Frontend
- Campos obligatorios en formularios
- Validar cantidades > 0
- Confirmar acciones importantes
- Mostrar estados de carga

### Backend
- Validar JWT en rutas protegidas
- Verificar roles para acciones específicas
- Validar que tendero no tenga pedido activo
- Verificar que productos existan
- Validar cantidades y precios

### Base de Datos
- Claves foráneas para integridad
- Índices para consultas rápidas
- Constraints para evitar datos inválidos
- Timestamps para auditoría

## Pantallas Principales

### Tendero
1. **Login/Registro**
2. **Dashboard**: Resumen + botón "Nuevo Pedido"
3. **Nuevo Pedido**: Lista productos + cantidades
4. **Mis Pedidos**: Estado actual + botón "Recibido"

### Plataforma
1. **Dashboard**: Todos los pedidos + filtros
2. **Consolidar**: Seleccionar pedidos por zona
3. **Asignar**: Elegir proveedor para consolidado
4. **Productos**: CRUD de productos

### Proveedor
1. **Dashboard**: Pedidos asignados
2. **Detalle Pedido**: Productos + actualizar estado
3. **Consultas**: Filtros por zona/fecha