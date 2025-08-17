const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin, validateChangePassword, handleValidationErrors } = require('../middleware/validation');

/**
 * @route POST /api/auth/register
 * @desc Registrar un nuevo usuario
 * @access Public
 */
router.post('/register', 
  validateRegister,
  handleValidationErrors,
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', 
  validateLogin,
  handleValidationErrors,
  authController.login
);

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

/**
 * @route PUT /api/auth/change-password
 * @desc Cambiar contraseña del usuario
 * @access Private
 */
router.put('/change-password', 
  authenticateToken,
  validateChangePassword,
  handleValidationErrors,
  authController.changePassword
);

/**
 * @route POST /api/auth/refresh
 * @desc Refrescar token de acceso
 * @access Private
 */
router.post('/refresh', 
  authenticateToken,
  authController.refreshToken
);

module.exports = router;