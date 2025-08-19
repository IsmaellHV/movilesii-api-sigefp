const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Middleware para autenticar tokens JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN',
      });
    }

    // Verificar el token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al request
    req.user = {
      id: decoded.id,
      correo: decoded.correo,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      telefono: decoded.telefono,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);

    // Manejar diferentes tipos de errores JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token no válido aún',
        error: 'TOKEN_NOT_ACTIVE',
        date: error.date,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor en autenticación',
      error: 'AUTHENTICATION_ERROR',
    });
  }
};

/**
 * Middleware opcional para autenticación
 * No falla si no hay token, pero agrega información del usuario si existe
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        req.user = {
          id: decoded.id,
          correo: decoded.correo,
          nombre: decoded.nombre,
          apellido: decoded.apellido,
          telefono: decoded.telefono,
          iat: decoded.iat,
          exp: decoded.exp,
        };
      } catch (error) {
        // Si el token es inválido, simplemente no agregar usuario
        console.log('Token opcional inválido:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    next(); // Continuar sin autenticación
  }
};

/**
 * Middleware para verificar que el usuario solo acceda a sus propios recursos
 * @param {string} paramName - Nombre del parámetro que contiene el ID del usuario
 */
const verifyOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const resourceUserId = req.params[paramName];
      const authenticatedUserId = req.user.id;

      // Convertir a string para comparación
      if (String(resourceUserId) !== String(authenticatedUserId)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
          error: 'FORBIDDEN_ACCESS',
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de propiedad:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'OWNERSHIP_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Middleware para verificar roles (para futuras implementaciones)
 * @param {Array} allowedRoles - Array de roles permitidos
 */
const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role || 'user';

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos suficientes para realizar esta acción',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'ROLE_VERIFICATION_ERROR',
      });
    }
  };
};

/**
 * Función para generar tokens JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (default: 24h)
 * @returns {string} Token JWT
 */
const generateToken = (payload, expiresIn = '24h') => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      issuer: 'api-financiera',
      audience: 'app-financiera',
    });
  } catch (error) {
    console.error('Error al generar token:', error);
    throw new Error('Error al generar token de autenticación');
  }
};

/**
 * Función para generar refresh token
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Refresh token JWT
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'api-financiera',
      audience: 'app-financiera',
    });
  } catch (error) {
    console.error('Error al generar refresh token:', error);
    throw new Error('Error al generar refresh token');
  }
};

/**
 * Función para verificar refresh token
 * @param {string} token - Refresh token a verificar
 * @returns {Object} Payload decodificado
 */
const verifyRefreshToken = async (token) => {
  try {
    return await promisify(jwt.verify)(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    console.error('Error al verificar refresh token:', error);
    throw new Error('Refresh token inválido o expirado');
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  verifyOwnership,
  verifyRole,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
};
