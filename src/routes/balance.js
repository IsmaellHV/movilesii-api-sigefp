const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/${PREFIJO}/balance/:userId
 * @desc Obtener balance del usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  balanceController.getBalanceByUser
);

/**
 * @route GET /api/${PREFIJO}/balance/:userId/resumen
 * @desc Obtener resumen financiero completo del usuario por ID
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/resumen', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  balanceController.getResumenFinanciero
);

/**
 * @route GET /api/${PREFIJO}/balance/:userId/estadisticas/mensuales
 * @desc Obtener estadísticas mensuales de ingresos y gastos por ID de usuario
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/estadisticas/mensuales', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  balanceController.getEstadisticasMensuales
);

/**
 * @route GET /api/${PREFIJO}/balance/:userId/periodo
 * @desc Obtener balance filtrado por período de fechas por ID de usuario
 * @query fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @query fechaFin - Fecha de fin (YYYY-MM-DD)
 * @access Public (TEMPORAL: Autenticación deshabilitada para pruebas)
 */
router.get('/:userId/periodo', 
  // authenticateToken, // TEMPORAL: Autenticación deshabilitada para pruebas
  balanceController.getBalanceByUser
);

module.exports = router;