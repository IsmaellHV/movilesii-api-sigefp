const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para autenticación
const validateRegister = [
  body('nombreUsuario')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('El nombre debe tener entre 2 y 30 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('apellidoUsuario')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('El apellido debe tener entre 2 y 30 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('correoUsuario')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .isLength({ max: 200 })
    .withMessage('El correo no puede exceder 200 caracteres')
    .normalizeEmail(),
  
  body('passwordUsuario')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  handleValidationErrors
];

const validateLogin = [
  body('correoUsuario')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  
  body('passwordUsuario')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

const validateChangePassword = [
  body('passwordActual')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('passwordNueva')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  handleValidationErrors
];

// Validaciones para tipos
const validateTipo = [
  body('nombreTipo')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre del tipo debe tener entre 1 y 50 caracteres'),
  
  body('categoria')
    .isIn(['Ingreso', 'Gasto', 'MetodoPago'])
    .withMessage('La categoría debe ser: Ingreso, Gasto o MetodoPago'),
  
  handleValidationErrors
];

// Validaciones para ingresos
const validateIngreso = [
  body('monto')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0')
    .custom((value) => {
      if (value > 999999999.99) {
        throw new Error('El monto no puede exceder 999,999,999.99');
      }
      return true;
    }),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
  
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)')
    .toDate(),
  
  body('idTipo')
    .isInt({ min: 1 })
    .withMessage('El ID del tipo debe ser un número entero positivo'),
  
  handleValidationErrors
];

// Validaciones para gastos
const validateGasto = [
  body('monto')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0')
    .custom((value) => {
      if (value > 999999999.99) {
        throw new Error('El monto no puede exceder 999,999,999.99');
      }
      return true;
    }),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede exceder 255 caracteres'),
  
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)')
    .toDate(),
  
  body('fechaRecordatorio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de recordatorio debe tener formato válido (YYYY-MM-DD)')
    .toDate(),
  
  body('idMetodoPago')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del método de pago debe ser un número entero positivo'),
  
  body('idTipo')
    .isInt({ min: 1 })
    .withMessage('El ID del tipo debe ser un número entero positivo'),
  
  body('telefonoPago')
    .optional()
    .trim()
    .isLength({ max: 15 })
    .withMessage('El teléfono de pago no puede exceder 15 caracteres')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono de pago solo puede contener números, +, -, espacios y paréntesis'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ID
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  
  handleValidationErrors
];

// Validación para teléfono en consultas
const validateTelefono = [
  param('telefono')
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage('El teléfono debe tener entre 1 y 15 caracteres')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono solo puede contener números, +, -, espacios y paréntesis'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateTipo,
  validateIngreso,
  validateGasto,
  validateId,
  validateTelefono,
  handleValidationErrors
};