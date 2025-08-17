const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @route GET /api/balance
 * @desc Obtener balance del usuario autenticado
 * @access Private
 */
router.get('/', 
  authenticateToken,
  balanceController.getBalanceByUser
);

/**
 * @route GET /api/balance/resumen
 * @desc Obtener resumen financiero completo del usuario
 * @access Private
 */
router.get('/resumen', 
  authenticateToken,
  balanceController.getResumenFinanciero
);

/**
 * @route GET /api/balance/estadisticas/mensuales
 * @desc Obtener estadísticas mensuales de ingresos y gastos
 * @access Private
 */
router.get('/estadisticas/mensuales', 
  authenticateToken,
  balanceController.getEstadisticasMensuales
);

/**
 * @route GET /api/balance/periodo
 * @desc Obtener balance filtrado por período de fechas
 * @query fechaInicio - Fecha de inicio (YYYY-MM-DD)
 * @query fechaFin - Fecha de fin (YYYY-MM-DD)
 * @access Private
 */
router.get('/periodo', 
  authenticateToken,
  balanceController.getBalanceByUser
);

module.exports = router;