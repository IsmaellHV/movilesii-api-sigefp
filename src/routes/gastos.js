const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const { authenticateToken } = require('../middleware/auth');
const { validateGasto, validateId, validateTelefono } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/gastos/:userId
 * @desc Obtener todos los gastos del usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  gastoController.getGastosByUser
);

/**
 * @route GET /api/${PREFIJO}/gastos/:userId/telefono/:telefono
 * @desc Obtener gastos por número de teléfono y ID de usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/telefono/:telefono', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateTelefono,
  gastoController.getGastosByTelefono
);

/**
 * @route GET /api/${PREFIJO}/gastos/:userId/gasto/:id
 * @desc Obtener un gasto por ID y usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/gasto/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  gastoController.getGastoById
);

/**
 * @route POST /api/${PREFIJO}/gastos/:userId
 * @desc Crear un nuevo gasto para el usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.post('/:userId', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateGasto,
  gastoController.createGasto
);

/**
 * @route PUT /api/${PREFIJO}/gastos/:userId/gasto/:id
 * @desc Actualizar un gasto del usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.put('/:userId/gasto/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  validateGasto,
  gastoController.updateGasto
);

/**
 * @route DELETE /api/${PREFIJO}/gastos/:userId/gasto/:id
 * @desc Eliminar un gasto del usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.delete('/:userId/gasto/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  gastoController.deleteGasto
);

/**
 * @route GET /api/${PREFIJO}/gastos/:userId/resumen/estadisticas
 * @desc Obtener resumen de gastos del usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/resumen/estadisticas', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  gastoController.getGastosResumen
);

module.exports = router;