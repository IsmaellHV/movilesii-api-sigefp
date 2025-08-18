const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { createValidationError } = require('./errorHandler');

// Configurar AJV
const ajv = new Ajv({ allErrors: true, removeAdditional: false });
addFormats(ajv);

// ==================== ESQUEMAS JSON ====================

/**
 * Esquema para registro de usuario (campos del cliente)
 */
const userRegisterSchema = {
  type: 'object',
  properties: {
    nombre: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
    },
    correo: {
      type: 'string',
      format: 'email',
      maxLength: 100
    },
    telefono: {
      type: 'string',
      minLength: 9,
      maxLength: 15,
      pattern: '^[0-9+\\-\\s()]+$'
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 100,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'
    }
  },
  required: ['nombre', 'correo', 'password'],
  additionalProperties: false
};

/**
 * Esquema para login de usuario (campos del cliente)
 */
const userLoginSchema = {
  type: 'object',
  properties: {
    correo: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['correo', 'password'],
  additionalProperties: false
};

/**
 * Esquema para cambio de contraseña
 */
const changePasswordSchema = {
  type: 'object',
  properties: {
    currentPassword: {
      type: 'string',
      minLength: 1
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 100,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'
    },
    confirmPassword: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['currentPassword', 'newPassword', 'confirmPassword'],
  additionalProperties: false
};

/**
 * Esquema para tipos
 */
const typeSchema = {
  type: 'object',
  properties: {
    nombreTipo: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
    },
    categoria: {
      type: 'string',
      enum: ['ingreso', 'gasto']
    },
    descripcion: {
      type: 'string',
      maxLength: 200
    }
  },
  required: ['nombreTipo', 'categoria'],
  additionalProperties: false
};

/**
 * Esquema para ingresos
 */
const ingresoSchema = {
  type: 'object',
  properties: {
    montoIngreso: {
      type: 'number',
      minimum: 0.01
    },
    descripcionIngreso: {
      type: 'string',
      minLength: 3,
      maxLength: 200
    },
    fechaIngreso: {
      type: 'string',
      format: 'date'
    },
    idTipo: {
      type: 'integer',
      minimum: 1
    }
  },
  required: ['montoIngreso', 'descripcionIngreso', 'idTipo'],
  additionalProperties: false
};

/**
 * Esquema para gastos
 */
const gastoSchema = {
  type: 'object',
  properties: {
    montoGasto: {
      type: 'number',
      minimum: 0.01
    },
    descripcionGasto: {
      type: 'string',
      minLength: 3,
      maxLength: 200
    },
    fechaGasto: {
      type: 'string',
      format: 'date'
    },
    idTipo: {
      type: 'integer',
      minimum: 1
    },
    idMetodoPago: {
      type: 'integer',
      minimum: 1
    }
  },
  required: ['montoGasto', 'descripcionGasto', 'idTipo', 'idMetodoPago'],
  additionalProperties: false
};

/**
 * Esquema para actualizar usuario
 */
const updateUserSchema = {
  type: 'object',
  properties: {
    nombreUsuario: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
    },
    apellidoUsuario: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
    },
    correoUsuario: {
      type: 'string',
      format: 'email',
      maxLength: 100
    }
  },
  additionalProperties: false
};

/**
 * Esquema para validar ID en parámetros
 */
const idParamSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[1-9]\\d*$'
    }
  },
  required: ['id'],
  additionalProperties: false
};

/**
 * Esquema para validar categoría en parámetros
 */
const categoriaParamSchema = {
  type: 'object',
  properties: {
    categoria: {
      type: 'string',
      enum: ['Ingreso', 'Gasto', 'MetodoPago']
    }
  },
  required: ['categoria'],
  additionalProperties: false
};

/**
 * Esquema para validar paginación en query
 */
const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: {
      type: 'string',
      pattern: '^[1-9]\\d*$'
    },
    limit: {
      type: 'string',
      pattern: '^([1-9]|[1-9]\\d|100)$'
    }
  },
  additionalProperties: false
};

/**
 * Esquema para validar teléfono en parámetros
 */
const telefonoParamSchema = {
  type: 'object',
  properties: {
    telefono: {
      type: 'string',
      pattern: '^[0-9]{9}$'
    }
  },
  required: ['telefono'],
  additionalProperties: false
};

// ==================== COMPILAR VALIDADORES ====================

const validateUserRegister = ajv.compile(userRegisterSchema);
const validateUserLogin = ajv.compile(userLoginSchema);
const validateChangePassword = ajv.compile(changePasswordSchema);
const validateType = ajv.compile(typeSchema);
const validateIngreso = ajv.compile(ingresoSchema);
const validateGasto = ajv.compile(gastoSchema);
const validateUpdateUser = ajv.compile(updateUserSchema);
const validateIdParam = ajv.compile(idParamSchema);
const validateCategoriaParam = ajv.compile(categoriaParamSchema);
const validatePaginationQuery = ajv.compile(paginationQuerySchema);
const validateTelefonoParam = ajv.compile(telefonoParamSchema);

// ==================== MIDDLEWARE DE VALIDACIÓN ====================

/**
 * Crear middleware de validación AJV
 * @param {Function} validator - Función validadora compilada de AJV
 * @param {string} source - Fuente de datos ('body', 'params', 'query')
 * @returns {Function} Middleware de Express
 */
function createAjvValidator(validator, source = 'body') {
  return (req, res, next) => {
    const data = req[source];
    const valid = validator(data);
    
    if (!valid) {
      const formattedErrors = validator.errors.map(error => {
        let field = error.instancePath ? error.instancePath.substring(1) : error.params?.missingProperty || 'campo';
        let message = error.message;
        
        // Personalizar mensajes según el tipo de error
        switch (error.keyword) {
          case 'required':
            field = error.params.missingProperty;
            message = `El campo '${field}' es requerido y no puede estar vacío`;
            break;
          case 'format':
            if (error.params.format === 'email') {
              message = `El campo '${field}' debe ser un correo electrónico válido`;
            } else {
              message = `El campo '${field}' tiene un formato inválido`;
            }
            break;
          case 'minLength':
            message = `El campo '${field}' debe tener al menos ${error.params.limit} caracteres`;
            break;
          case 'maxLength':
            message = `El campo '${field}' no puede exceder ${error.params.limit} caracteres`;
            break;
          case 'pattern':
            if (field === 'password') {
              message = `El campo '${field}' debe contener al menos una letra minúscula, una mayúscula y un número`;
            } else if (field === 'telefono') {
              message = `El campo '${field}' debe contener solo números, espacios, guiones y paréntesis`;
            } else if (field === 'nombre' || field === 'nombreTipo') {
              message = `El campo '${field}' solo puede contener letras y espacios`;
            } else {
              message = `El campo '${field}' tiene un formato inválido`;
            }
            break;
          case 'minimum':
            message = `El campo '${field}' debe ser mayor o igual a ${error.params.limit}`;
            break;
          case 'enum':
            message = `El campo '${field}' debe ser uno de los siguientes valores: ${error.params.allowedValues.join(', ')}`;
            break;
          case 'additionalProperties':
            message = `El campo '${error.params.additionalProperty}' no está permitido`;
            break;
          case 'type':
            message = `El campo '${field}' debe ser de tipo ${error.params.type}`;
            break;
          default:
            message = `Error en el campo '${field}': ${error.message}`;
        }
        
        return {
          field: field,
          message: message,
          value: error.data,
          location: source
        };
      });
      
      const validationError = createValidationError(formattedErrors);
      return next(validationError);
    }
    
    next();
  };
}

/**
 * Middleware personalizado para validar confirmación de contraseña
 */
function validatePasswordConfirmation(req, res, next) {
  if (req.body.newPassword !== req.body.confirmPassword) {
    const formattedErrors = [{
      field: 'confirmPassword',
      message: 'Las contraseñas no coinciden',
      value: req.body.confirmPassword,
      location: 'body'
    }];
    
    const validationError = createValidationError(formattedErrors);
    return next(validationError);
  }
  
  next();
}

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

// ==================== EXPORTAR VALIDADORES ====================

module.exports = {
  // Validadores compilados para body
  validateUserRegister: createAjvValidator(validateUserRegister),
  validateUserLogin: createAjvValidator(validateUserLogin),
  validateChangePassword: [createAjvValidator(validateChangePassword), validatePasswordConfirmation],
  validateType: createAjvValidator(validateType),
  validateIngreso: createAjvValidator(validateIngreso),
  validateGasto: createAjvValidator(validateGasto),
  validateUpdateUser: createAjvValidator(validateUpdateUser),
  
  // Validadores para parámetros
  validateId: createAjvValidator(validateIdParam, 'params'),
  validateCategoria: createAjvValidator(validateCategoriaParam, 'params'),
  validateTelefono: createAjvValidator(validateTelefonoParam, 'params'),
  
  // Validadores para query parameters
  validatePagination: createAjvValidator(validatePaginationQuery, 'query'),
  
  // Middleware de transformación
  transformUserFields,
  
  // Función para crear validadores personalizados
  createAjvValidator,
  
  // Instancia de AJV para validaciones adicionales
  ajv
};