const Producto = require('../models/Producto');

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    
    res.json({
      message: 'Productos obtenidos exitosamente',
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los productos'
    });
  }
};

// Obtener producto por ID
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findById(id);
    
    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }
    
    res.json({
      message: 'Producto obtenido exitosamente',
      data: producto
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el producto'
    });
  }
};

// Crear nuevo producto (solo plataforma)
const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio_base, unidad } = req.body;
    
    // Verificar si el nombre ya existe
    const nameExists = await Producto.nameExists(nombre);
    if (nameExists) {
      return res.status(400).json({
        error: 'Producto ya existe',
        message: 'Ya existe un producto con este nombre'
      });
    }
    
    // Crear producto
    const productoId = await Producto.create({
      nombre,
      descripcion,
      precio_base,
      unidad
    });
    
    // Obtener producto creado
    const newProducto = await Producto.findById(productoId);
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: newProducto
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear el producto'
    });
  }
};

// Actualizar producto (solo plataforma)
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio_base, unidad } = req.body;
    
    // Verificar si el producto existe
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }
    
    // Verificar si el nuevo nombre ya existe (excluyendo el producto actual)
    if (nombre !== producto.nombre) {
      const nameExists = await Producto.nameExists(nombre, id);
      if (nameExists) {
        return res.status(400).json({
          error: 'Nombre ya existe',
          message: 'Ya existe otro producto con este nombre'
        });
      }
    }
    
    // Actualizar producto
    const updated = await Producto.update(id, {
      nombre,
      descripcion,
      precio_base,
      unidad
    });
    
    if (!updated) {
      return res.status(400).json({
        error: 'No se pudo actualizar',
        message: 'El producto no pudo ser actualizado'
      });
    }
    
    // Obtener producto actualizado
    const updatedProducto = await Producto.findById(id);
    
    res.json({
      message: 'Producto actualizado exitosamente',
      data: updatedProducto
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el producto'
    });
  }
};

// Desactivar producto (solo plataforma)
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el producto existe
    const producto = await Producto.findById(id);
    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        message: `No existe un producto con ID ${id}`
      });
    }
    
    // Desactivar producto
    const deactivated = await Producto.deactivate(id);
    
    if (!deactivated) {
      return res.status(400).json({
        error: 'No se pudo eliminar',
        message: 'El producto no pudo ser eliminado'
      });
    }
    
    res.json({
      message: 'Producto eliminado exitosamente',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el producto'
    });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};