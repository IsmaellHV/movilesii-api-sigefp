const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegister, validateUserLogin, validateChangePassword, transformUserFields } = require('../middleware/ajvValidation');

/**
 * @route POST /api/${PREFIJO}/auth/register
 * @desc Registrar un nuevo usuario
 * @access Public
 */
router.post('/register', 
  validateUserRegister,
  transformUserFields,
  authController.register
);

/**
 * @route POST /api/${PREFIJO}/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', 
  validateUserLogin,
  transformUserFields,
  authController.login
);

/**
 * @route GET /api/${PREFIJO}/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

/**
 * @route PUT /api/${PREFIJO}/auth/change-password
 * @desc Cambiar contraseña del usuario
 * @access Private
 */
router.put('/change-password', 
  authenticateToken,
  validateChangePassword,
  authController.changePassword
);

/**
 * @route POST /api/${PREFIJO}/auth/refresh
 * @desc Refrescar token de acceso
 * @access Private
 */
router.post('/refresh', 
  authenticateToken,
  authController.refreshToken
);

module.exports = router;