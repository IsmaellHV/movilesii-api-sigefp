const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingresoController');
const { authenticateToken } = require('../middleware/auth');
const { validateIngreso, validateId } = require('../middleware/ajvValidation');

/**
 * @route GET /api/${PREFIJO}/ingresos/:userId
 * @desc Obtener todos los ingresos del usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  ingresoController.getIngresosByUser
);

/**
 * @route GET /api/${PREFIJO}/ingresos/:userId/ingreso/:id
 * @desc Obtener un ingreso por ID y usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/ingreso/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  ingresoController.getIngresoById
);

/**
 * @route POST /api/${PREFIJO}/ingresos/:userId
 * @desc Crear un nuevo ingreso para el usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.post('/:userId', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateIngreso,
  ingresoController.createIngreso
);

/**
 * @route PUT /api/${PREFIJO}/ingresos/:userId/ingreso/:id
 * @desc Actualizar un ingreso del usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.put('/:userId/ingreso/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  validateIngreso,
  ingresoController.updateIngreso
);

/**
 * @route DELETE /api/${PREFIJO}/ingresos/:userId/ingreso/:id
 * @desc Eliminar un ingreso del usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.delete('/:userId/ingreso/:id', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  validateId,
  ingresoController.deleteIngreso
);

/**
 * @route GET /api/${PREFIJO}/ingresos/:userId/resumen/estadisticas
 * @desc Obtener resumen de ingresos del usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/resumen/estadisticas', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  ingresoController.getIngresosResumen
);

module.exports = router;