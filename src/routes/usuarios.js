const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/auth');
const { validateUpdateUser, validateId } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/usuarios
 * @desc Obtener todos los usuarios (solo para administradores)
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  usuarioController.getAllUsuarios
);

/**
 * @route GET /api/${PREFIJO}/usuarios/:id
 * @desc Obtener un usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  usuarioController.getUsuarioById
);

/**
 * @route PUT /api/${PREFIJO}/usuarios/:id
 * @desc Actualizar información del usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.put('/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  validateUpdateUser,
  usuarioController.updateUsuario
);

/**
 * @route DELETE /api/${PREFIJO}/usuarios/:id
 * @desc Eliminar cuenta de usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.delete('/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  usuarioController.deleteUsuario
);

/**
 * @route GET /api/${PREFIJO}/usuarios/:id/estadisticas
 * @desc Obtener estadísticas del usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:id/estadisticas', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  usuarioController.getUsuarioEstadisticas
);

module.exports = router;