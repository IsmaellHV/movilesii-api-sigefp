/**
 * Middleware centralizado para manejo de errores
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error para debugging
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Error de validación de Mongoose (si se usa en el futuro)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: `Error de validación: ${message}`,
      type: 'VALIDATION_ERROR'
    };
  }

  // Error de duplicado de clave (MySQL)
  if (err.code === 'ER_DUP_ENTRY') {
    let message = 'Recurso duplicado';
    
    // Extraer información específica del error de duplicado
    if (err.sqlMessage) {
      if (err.sqlMessage.includes('correo')) {
        message = 'El correo electrónico ya está registrado';
      } else if (err.sqlMessage.includes('telefono')) {
        message = 'El número de teléfono ya está registrado';
      } else if (err.sqlMessage.includes('nombre')) {
        message = 'Ya existe un registro con ese nombre';
      }
    }
    
    error = {
      statusCode: 409,
      message,
      type: 'DUPLICATE_ENTRY',
      field: extractDuplicateField(err.sqlMessage)
    };
  }

  // Error de clave foránea (MySQL)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = {
      statusCode: 400,
      message: 'Referencia inválida: el recurso relacionado no existe',
      type: 'FOREIGN_KEY_ERROR'
    };
  }

  // Error de conexión a la base de datos
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    error = {
      statusCode: 503,
      message: 'Error de conexión a la base de datos',
      type: 'DATABASE_CONNECTION_ERROR'
    };
  }

  // Error de sintaxis SQL
  if (err.code === 'ER_PARSE_ERROR' || err.code === 'ER_BAD_FIELD_ERROR') {
    error = {
      statusCode: 500,
      message: 'Error interno del servidor',
      type: 'SQL_SYNTAX_ERROR'
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token de autenticación inválido',
      type: 'INVALID_TOKEN'
    };
  }

  // Error de token expirado
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token de autenticación expirado',
      type: 'TOKEN_EXPIRED'
    };
  }

  // Error de validación de express-validator
  if (err.type === 'VALIDATION_ERROR' && err.errors) {
    error = {
      statusCode: 400,
      message: 'Errores de validación',
      type: 'VALIDATION_ERROR',
      errors: err.errors
    };
  }

  // Error de archivo no encontrado
  if (err.code === 'ENOENT') {
    error = {
      statusCode: 404,
      message: 'Archivo no encontrado',
      type: 'FILE_NOT_FOUND'
    };
  }

  // Error de límite de tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 413,
      message: 'El archivo es demasiado grande',
      type: 'FILE_TOO_LARGE'
    };
  }

  // Error de tipo de archivo no permitido
  if (err.code === 'INVALID_FILE_TYPE') {
    error = {
      statusCode: 400,
      message: 'Tipo de archivo no permitido',
      type: 'INVALID_FILE_TYPE'
    };
  }

  // Error de rate limiting
  if (err.statusCode === 429) {
    error = {
      statusCode: 429,
      message: 'Demasiadas solicitudes, intenta más tarde',
      type: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Error personalizado de la aplicación
  if (err.isOperational) {
    error = {
      statusCode: err.statusCode || 400,
      message: err.message,
      type: err.type || 'OPERATIONAL_ERROR',
      errors: err.errors // Preservar errores de validación específicos
    };
  }

  // Error por defecto
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';
  const type = error.type || 'INTERNAL_SERVER_ERROR';

  // Respuesta de error
  const errorResponse = {
    success: false,
    message,
    error: type,
    timestamp: new Date().toISOString()
  };

  // Agregar información adicional en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      originalError: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      path: req.path,
      method: req.method
    };
  }

  // Agregar errores de validación si existen
  if (error.errors) {
    errorResponse.validationErrors = error.errors;
  }

  // Agregar campo duplicado si existe
  if (error.field) {
    errorResponse.duplicateField = error.field;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Función para extraer el campo duplicado del mensaje de error de MySQL
 * @param {string} sqlMessage - Mensaje de error SQL
 * @returns {string} Campo duplicado
 */
function extractDuplicateField(sqlMessage) {
  if (!sqlMessage) return null;
  
  const match = sqlMessage.match(/for key '([^']+)'/i);
  if (match && match[1]) {
    // Extraer el nombre del campo del índice
    const indexName = match[1];
    if (indexName.includes('correo')) return 'correo';
    if (indexName.includes('telefono')) return 'telefono';
    if (indexName.includes('nombre')) return 'nombre';
    return indexName;
  }
  
  return null;
}

/**
 * Clase para errores operacionales personalizados
 */
class AppError extends Error {
  constructor(message, statusCode, type = 'OPERATIONAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Función para crear errores de validación
 * @param {Array} errors - Array de errores de validación
 * @returns {AppError} Error de validación
 */
function createValidationError(errors) {
  const error = new AppError('Errores de validación', 400, 'VALIDATION_ERROR');
  error.errors = errors;
  return error;
}

/**
 * Función para crear errores de recurso no encontrado
 * @param {string} resource - Nombre del recurso
 * @returns {AppError} Error de recurso no encontrado
 */
function createNotFoundError(resource = 'Recurso') {
  return new AppError(`${resource} no encontrado`, 404, 'RESOURCE_NOT_FOUND');
}

/**
 * Función para crear errores de acceso denegado
 * @param {string} message - Mensaje personalizado
 * @returns {AppError} Error de acceso denegado
 */
function createForbiddenError(message = 'Acceso denegado') {
  return new AppError(message, 403, 'FORBIDDEN_ACCESS');
}

/**
 * Función para crear errores de conflicto
 * @param {string} message - Mensaje personalizado
 * @returns {AppError} Error de conflicto
 */
function createConflictError(message = 'Conflicto de recursos') {
  return new AppError(message, 409, 'RESOURCE_CONFLICT');
}

module.exports = {
  errorHandler,
  AppError,
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  createConflictError
};