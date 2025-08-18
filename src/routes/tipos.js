const express = require('express');
const router = express.Router();
const tipoController = require('../controllers/tipoController');
const { authenticateToken } = require('../middleware/auth');
const { validateType, validateId } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/tipos
 * @desc Obtener todos los tipos
 * @access Private
 */
router.get('/', 
  authenticateToken,
  tipoController.getAllTipos
);

/**
 * @route GET /api/${PREFIJO}/tipos/categoria/:categoria
 * @desc Obtener tipos por categoría (Ingreso, Gasto, MetodoPago)
 * @access Private
 */
router.get('/categoria/:categoria', 
  authenticateToken,
  tipoController.getTiposByCategoria
);

/**
 * @route GET /api/${PREFIJO}/tipos/:id
 * @desc Obtener un tipo por ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  validateId,
  tipoController.getTipoById
);

/**
 * @route POST /api/${PREFIJO}/tipos
 * @desc Crear un nuevo tipo
 * @access Private
 */
router.post('/', 
  authenticateToken,
  validateType,
  tipoController.createTipo
);

/**
 * @route PUT /api/${PREFIJO}/tipos/:id
 * @desc Actualizar un tipo
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  validateId,
  validateType,
  tipoController.updateTipo
);

/**
 * @route DELETE /api/${PREFIJO}/tipos/:id
 * @desc Eliminar un tipo
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  validateId,
  tipoController.deleteTipo
);

module.exports = router;