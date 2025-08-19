const express = require('express');
const router = express.Router();
const tipoController = require('../controllers/tipoController');
const { authenticateToken } = require('../middleware/auth');
const { validateType, validateId } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/tipos
 * @desc Obtener todos los tipos
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  tipoController.getAllTipos
);

/**
 * @route GET /api/${PREFIJO}/tipos/categoria/:categoria
 * @desc Obtener tipos por categoría (Ingreso, Gasto, MetodoPago)
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/categoria/:categoria', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  tipoController.getTiposByCategoria
);

/**
 * @route GET /api/${PREFIJO}/tipos/:id
 * @desc Obtener un tipo por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  tipoController.getTipoById
);

/**
 * @route POST /api/${PREFIJO}/tipos
 * @desc Crear un nuevo tipo
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.post('/', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateType,
  tipoController.createTipo
);

/**
 * @route PUT /api/${PREFIJO}/tipos/:id
 * @desc Actualizar un tipo
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.put('/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  validateType,
  tipoController.updateTipo
);

/**
 * @route DELETE /api/${PREFIJO}/tipos/:id
 * @desc Eliminar un tipo
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.delete('/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  tipoController.deleteTipo
);

module.exports = router;