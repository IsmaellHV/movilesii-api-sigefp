const { body, param, query, validationResult } = require('express-validator');
const { createValidationError } = require('./errorHandler');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log('errors', errors);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));
    
    const validationError = createValidationError(formattedErrors);
    return next(validationError);
  }
  
  next();
};

// ==================== VALIDACIONES DE AUTENTICACIÓN ====================

/**
 * Validaciones para registro de usuario (campos originales del sistema)
 */
const validateRegister = [
  body('nombreUsuario')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('apellidoUsuario')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
    
  body('correoUsuario')
    .trim()
    .notEmpty()
    .withMessage('El correo es requerido')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),
    
  body('passwordUsuario')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contraseña debe tener entre 6 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
    
  handleValidationErrors
];

/**
 * Validaciones para registro de usuario (campos del cliente)
 */
const validateUserRegister = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo es requerido')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),
    
  body('telefono')
    .optional()
    .trim()
    .isLength({ min: 9, max: 15 })
    .withMessage('El teléfono debe tener entre 9 y 15 caracteres')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono solo puede contener números, espacios, paréntesis, guiones y el símbolo +'),
    
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contraseña debe tener entre 6 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
    
  handleValidationErrors
];

/**
 * Middleware para transformar campos del cliente a formato del sistema
 */
const transformUserFields = (req, res, next) => {
  if (req.body.nombre) {
    req.body.nombreUsuario = req.body.nombre;
    req.body.apellidoUsuario = req.body.nombre; // Si no hay apellido separado, usar el nombre
  }
  if (req.body.correo) {
    req.body.correoUsuario = req.body.correo;
  }
  if (req.body.password) {
    req.body.passwordUsuario = req.body.password;
  }
  // El teléfono no se usa en el controlador actual, pero lo mantenemos para futuras implementaciones
  next();
};

/**
 * Validaciones para login (campos del cliente)
 */
const validateUserLogin = [
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo es requerido')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
    
  handleValidationErrors
];

/**
 * Validaciones para login
 */
const validateLogin = [
  body('correoUsuario')
    .trim()
    .notEmpty()
    .withMessage('El correo es requerido')
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
    
  body('passwordUsuario')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
    
  handleValidationErrors
];

/**
 * Validaciones para cambio de contraseña
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
    
  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6, max: 100 })
    .withMessage('La nueva contraseña debe tener entre 6 y 100 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
    
  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
    
  handleValidationErrors
];

// ==================== VALIDACIONES DE USUARIO ====================

/**
 * Validaciones para actualizar usuario
 */
const validateUpdateUser = [
  body('nombreUsuario')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
    
  body('apellidoUsuario')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
    
  body('correoUsuario')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('El correo no puede exceder 100 caracteres'),
    
  handleValidationErrors
];

// ==================== VALIDACIONES DE TIPOS ====================

/**
 * Validaciones para crear/actualizar tipo
 */
const validateType = [
  body('nombreTipo')
    .trim()
    .notEmpty()
    .withMessage('El nombre del tipo es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    
  body('categoria')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isIn(['Ingreso', 'Gasto', 'MetodoPago'])
    .withMessage('La categoría debe ser: Ingreso, Gasto o MetodoPago'),
    
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede exceder 200 caracteres'),
    
  handleValidationErrors
];

// ==================== VALIDACIONES DE INGRESOS ====================

/**
 * Validaciones para crear/actualizar ingreso
 */
const validateIngreso = [
  body('montoIngreso')
    .notEmpty()
    .withMessage('El monto es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0'),
    
  body('descripcionIngreso')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 200 })
    .withMessage('La descripción debe tener entre 3 y 200 caracteres'),
    
  body('fechaIngreso')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('La fecha no puede ser futura');
      }
      return true;
    }),
    
  body('idTipo')
    .notEmpty()
    .withMessage('El tipo de ingreso es requerido')
    .isInt({ min: 1 })
    .withMessage('El tipo de ingreso debe ser un número entero válido'),
    
  handleValidationErrors
];

// ==================== VALIDACIONES DE GASTOS ====================

/**
 * Validaciones para crear/actualizar gasto
 */
const validateGasto = [
  body('montoGasto')
    .notEmpty()
    .withMessage('El monto es requerido')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser un número positivo mayor a 0'),
    
  body('descripcionGasto')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 3, max: 200 })
    .withMessage('La descripción debe tener entre 3 y 200 caracteres'),
    
  body('fechaGasto')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('La fecha no puede ser futura');
      }
      return true;
    }),
    
  body('idTipo')
    .notEmpty()
    .withMessage('El tipo de gasto es requerido')
    .isInt({ min: 1 })
    .withMessage('El tipo de gasto debe ser un número entero válido'),
    
  body('idMetodoPago')
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .isInt({ min: 1 })
    .withMessage('El método de pago debe ser un número entero válido'),
    
  handleValidationErrors
];

// ==================== VALIDACIONES DE PARÁMETROS ====================

/**
 * Validación para parámetros ID
 */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
    
  handleValidationErrors
];

/**
 * Validación para parámetros de teléfono
 */
const validateTelefono = [
  param('telefono')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono solo puede contener números, +, -, espacios y paréntesis')
    .isLength({ min: 9, max: 15 })
    .withMessage('El teléfono debe tener entre 9 y 15 caracteres'),
    
  handleValidationErrors
];

/**
 * Validación para parámetros de categoría
 */
const validateCategoria = [
  param('categoria')
    .isIn(['Ingreso', 'Gasto', 'MetodoPago'])
    .withMessage('La categoría debe ser: Ingreso, Gasto o MetodoPago'),
    
  handleValidationErrors
];

// ==================== VALIDACIONES DE QUERY PARAMETERS ====================

/**
 * Validaciones para paginación
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
    
  handleValidationErrors
];

/**
 * Validaciones para filtros de fecha
 */
const validateDateFilters = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe tener formato válido (YYYY-MM-DD)'),
    
  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe tener formato válido (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.fechaInicio && value) {
        const inicio = new Date(req.query.fechaInicio);
        const fin = new Date(value);
        if (fin < inicio) {
          throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
        }
      }
      return true;
    }),
    
  handleValidationErrors
];

/**
 * Validaciones para búsqueda
 */
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),
    
  handleValidationErrors
];

/**
 * Validaciones para filtros de tipo
 */
const validateTypeFilters = [
  query('tipoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El tipo debe ser un número entero positivo'),
    
  query('metodoPagoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El método de pago debe ser un número entero positivo'),
    
  handleValidationErrors
];

module.exports = {
  // Middleware
  handleValidationErrors,
  transformUserFields,
  
  // Autenticación
  validateRegister,
  validateUserRegister,
  validateLogin,
  validateUserLogin,
  validateChangePassword,
  
  // Usuario
  validateUpdateUser,
  
  // Tipos
  validateType,
  
  // Ingresos y Gastos
  validateIngreso,
  validateGasto,
  
  // Parámetros
  validateId,
  validateTelefono,
  validateCategoria,
  
  // Query parameters
  validatePagination,
  validateDateFilters,
  validateSearch,
  validateTypeFilters
};