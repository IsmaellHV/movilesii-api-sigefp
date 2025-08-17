const express = require('express');
const router = express.Router();
const tipoController = require('../controllers/tipoController');
const { authenticateToken } = require('../middleware/auth');
const { validateType, validateId, handleValidationErrors } = require('../middleware/validation');

/**
 * @route GET /api/tipos
 * @desc Obtener todos los tipos
 * @access Private
 */
router.get('/', 
  authenticateToken,
  tipoController.getAllTipos
);

/**
 * @route GET /api/tipos/categoria/:categoria
 * @desc Obtener tipos por categoría (Ingreso, Gasto, MetodoPago)
 * @access Private
 */
router.get('/categoria/:categoria', 
  authenticateToken,
  tipoController.getTiposByCategoria
);

/**
 * @route GET /api/tipos/:id
 * @desc Obtener un tipo por ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  tipoController.getTipoById
);

/**
 * @route POST /api/tipos
 * @desc Crear un nuevo tipo
 * @access Private
 */
router.post('/', 
  authenticateToken,
  validateType,
  handleValidationErrors,
  tipoController.createTipo
);

/**
 * @route PUT /api/tipos/:id
 * @desc Actualizar un tipo
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  validateId,
  validateType,
  handleValidationErrors,
  tipoController.updateTipo
);

/**
 * @route DELETE /api/tipos/:id
 * @desc Eliminar un tipo
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  tipoController.deleteTipo
);

module.exports = router;