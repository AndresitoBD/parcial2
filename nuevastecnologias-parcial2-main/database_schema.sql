-- Base de datos para plataforma de pedidos de tenderos
-- Esquema básico para MySQL

-- Tabla de zonas
CREATE TABLE zonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (tenderos, plataforma, proveedores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('tendero', 'plataforma', 'proveedor') NOT NULL,
    contacto VARCHAR(50),
    zona_id INT,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(20) DEFAULT 'unidad',
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos individuales (por tendero)
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tendero_id INT NOT NULL,
    zona_id INT NOT NULL,
    estado ENUM('pendiente', 'consolidacion', 'asignacion', 'despacho', 'enviado', 'entregado', 'recibido') DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite TIMESTAMP NULL,
    proveedor_id INT NULL
);

-- Tabla de detalles de pedidos (productos específicos)
CREATE TABLE pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    recibido TINYINT(1) DEFAULT 0
);

-- Tabla de pedidos consolidados (agrupados por zona)
CREATE TABLE pedidos_consolidados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zona_id INT NOT NULL,
    proveedor_id INT NULL,
    estado ENUM('consolidacion', 'asignado', 'preparacion', 'enviado', 'entregado') DEFAULT 'consolidacion',
    fecha_consolidacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_estimada TIMESTAMP NULL,
    total DECIMAL(10,2) DEFAULT 0.00
);

-- Tabla de detalles consolidados (productos agrupados)
CREATE TABLE consolidado_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_consolidado_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad_total INT NOT NULL,
    precio_promedio DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla intermedia para relacionar pedidos individuales con consolidados
CREATE TABLE pedidos_en_consolidado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    pedido_consolidado_id INT NOT NULL,
    fecha_inclusion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO zonas (nombre, descripcion) VALUES 
('Norte', 'Zona norte de la ciudad'),
('Sur', 'Zona sur de la ciudad'),
('Centro', 'Zona centro de la ciudad'),
('Oriente', 'Zona oriente de la ciudad');

INSERT INTO productos (nombre, descripcion, precio_base, unidad) VALUES 
('Arroz', 'Arroz blanco de primera calidad', 2500.00, 'kg'),
('Frijol', 'Frijol rojo premium', 3200.00, 'kg'),
('Aceite', 'Aceite vegetal', 4500.00, 'litro'),
('Azúcar', 'Azúcar refinada', 2800.00, 'kg'),
('Sal', 'Sal de mesa', 1200.00, 'kg'),
('Pasta', 'Pasta alimenticia', 1800.00, 'paquete'),
('Leche', 'Leche entera', 3500.00, 'litro'),
('Pan', 'Pan de mesa', 2200.00, 'unidad');

-- Usuarios de ejemplo (password: "123456" hasheado con bcrypt)
-- INSERT INTO usuarios (nombre, email, password, rol, contacto, zona_id) VALUES 
-- ('Admin Plataforma', 'admin@plataforma.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'plataforma', '3001234567', NULL),
-- ('Proveedor Norte', 'proveedor1@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'proveedor', '3001111111', NULL),
-- ('Proveedor Sur', 'proveedor2@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'proveedor', '3002222222', NULL),
-- ('Tendero Juan', 'tendero1@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tendero', '3003333333', 1),
-- ('Tendero María', 'tendero2@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tendero', '3004444444', 1),
-- ('Tendero Carlos', 'tendero3@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tendero', '3005555555', 2);