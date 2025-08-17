const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingresoController');
const { authenticateToken } = require('../middleware/auth');
const { validateIngreso, validateId, handleValidationErrors } = require('../middleware/validation');

/**
 * @route GET /api/ingresos
 * @desc Obtener todos los ingresos del usuario autenticado
 * @access Private
 */
router.get('/', 
  authenticateToken,
  ingresoController.getIngresosByUser
);

/**
 * @route GET /api/ingresos/:id
 * @desc Obtener un ingreso por ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  ingresoController.getIngresoById
);

/**
 * @route POST /api/ingresos
 * @desc Crear un nuevo ingreso
 * @access Private
 */
router.post('/', 
  authenticateToken,
  validateIngreso,
  handleValidationErrors,
  ingresoController.createIngreso
);

/**
 * @route PUT /api/ingresos/:id
 * @desc Actualizar un ingreso
 * @access Private
 */
router.put('/:id', 
  authenticateToken,
  validateId,
  validateIngreso,
  handleValidationErrors,
  ingresoController.updateIngreso
);

/**
 * @route DELETE /api/ingresos/:id
 * @desc Eliminar un ingreso
 * @access Private
 */
router.delete('/:id', 
  authenticateToken,
  validateId,
  handleValidationErrors,
  ingresoController.deleteIngreso
);

/**
 * @route GET /api/ingresos/resumen/estadisticas
 * @desc Obtener resumen de ingresos del usuario
 * @access Private
 */
router.get('/resumen/estadisticas', 
  authenticateToken,
  ingresoController.getIngresosResumen
);

module.exports = router;