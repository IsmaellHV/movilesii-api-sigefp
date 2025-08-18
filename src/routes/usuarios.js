const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/auth');
const { validateUpdateUser, validateId } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/usuarios
 * @desc Obtener todos los usuarios (solo para administradores)
 * @access Private
 */
router.get('/', 
  authenticateToken,
  usuarioController.getAllUsuarios
);

/**
 * @route GET /api/${PREFIJO}/usuarios/:id
 * @desc Obtener un usuario por ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  validateId,
  usuarioController.getUsuarioById
);

/**
 * @route PUT /api/${PREFIJO}/usuarios/:id
 * @desc Actualizar información del usuario
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  validateId,
  validateUpdateUser,
  usuarioController.updateUsuario
);

/**
 * @route DELETE /api/${PREFIJO}/usuarios/:id
 * @desc Eliminar cuenta de usuario
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  validateId,
  usuarioController.deleteUsuario
);

/**
 * @route GET /api/${PREFIJO}/usuarios/:id/estadisticas
 * @desc Obtener estadísticas del usuario
 * @access Private
 */
router.get('/:id/estadisticas', 
  authenticateToken,
  validateId,
  usuarioController.getUsuarioEstadisticas
);

module.exports = router;