const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/auth');
const { validateUpdateUser, validateId, handleValidationErrors } = require('../middleware/validation');

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios (solo para administradores)
 * @access Private
 */
router.get('/', 
  authenticateToken,
  usuarioController.getAllUsuarios
);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener un usuario por ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  usuarioController.getUsuarioById
);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar información del usuario
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  validateId,
  validateUpdateUser,
  handleValidationErrors,
  usuarioController.updateUsuario
);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar cuenta de usuario
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  usuarioController.deleteUsuario
);

/**
 * @route GET /api/usuarios/:id/estadisticas
 * @desc Obtener estadísticas del usuario
 * @access Private
 */
router.get('/:id/estadisticas', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  usuarioController.getUsuarioEstadisticas
);

module.exports = router;