const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const { authenticateToken } = require('../middleware/auth');
const { validateGasto, validateId, validateTelefono } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/gastos
 * @desc Obtener todos los gastos del usuario autenticado
 * @access Private
 */
router.get('/', 
  authenticateToken,
  gastoController.getGastosByUser
);

/**
 * @route GET /api/${PREFIJO}/gastos/telefono/:telefono
 * @desc Obtener gastos por número de teléfono
 * @access Private
 */
router.get('/telefono/:telefono', 
  authenticateToken,
  validateTelefono,
  gastoController.getGastosByTelefono
);

/**
 * @route GET /api/${PREFIJO}/gastos/:id
 * @desc Obtener un gasto por ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  validateId,
  gastoController.getGastoById
);

/**
 * @route POST /api/${PREFIJO}/gastos
 * @desc Crear un nuevo gasto
 * @access Private
 */
router.post('/', 
  authenticateToken,
  validateGasto,
  gastoController.createGasto
);

/**
 * @route PUT /api/${PREFIJO}/gastos/:id
 * @desc Actualizar un gasto
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  validateId,
  validateGasto,
  gastoController.updateGasto
);

/**
 * @route DELETE /api/${PREFIJO}/gastos/:id
 * @desc Eliminar un gasto
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  validateId,
  gastoController.deleteGasto
);

/**
 * @route GET /api/${PREFIJO}/gastos/resumen/estadisticas
 * @desc Obtener resumen de gastos del usuario
 * @access Private
 */
router.get('/resumen/estadisticas', 
  authenticateToken,
  gastoController.getGastosResumen
);

module.exports = router;