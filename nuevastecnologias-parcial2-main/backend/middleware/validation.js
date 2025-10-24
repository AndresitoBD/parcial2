const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validaciones para registro de usuario
const validateUserRegistration = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
  body('rol')
    .isIn(['tendero', 'proveedor', 'plataforma'])
    .withMessage('El rol debe ser: tendero, proveedor o plataforma'),
    
  body('contacto')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('El contacto no puede exceder 50 caracteres'),
    
  body('zona_id')
    .if(body('rol').equals('tendero'))
    .isInt({ min: 1 })
    .withMessage('Los tenderos deben tener una zona asignada'),
    
  handleValidationErrors
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
    
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
    
  handleValidationErrors
];

// Validaciones para productos
const validateProduct = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
    
  body('precio_base')
    .isFloat({ min: 0.01 })
    .withMessage('El precio debe ser un número mayor a 0'),
    
  body('unidad')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('La unidad debe tener entre 1 y 20 caracteres'),
    
  handleValidationErrors
];

// Validaciones para pedidos
const validatePedido = [
  body('productos')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
    
  body('productos.*.producto_id')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
    
  body('productos.*.cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
    
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateLogin,
  validateProduct,
  validatePedido
};