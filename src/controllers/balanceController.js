const { executeStoredProcedure, executeQuery } = require('../config/database');

// Calcular balance del usuario usando stored procedure
const getBalanceByUser = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    // Ejecutar stored procedure para calcular balance
    const balance = await executeStoredProcedure('CalcularBalance', [idUsuario]);

    // Si se proporcionan fechas, calcular balance filtrado
    let balanceFiltrado = null;
    if (fechaInicio || fechaFin) {
      let queryIngresos = 'SELECT COALESCE(SUM(montoIngreso), 0) as totalIngresos FROM INGRESO WHERE idUsuario = ?';
      let queryGastos = 'SELECT COALESCE(SUM(montoGasto), 0) as totalGastos FROM GASTO WHERE idUsuario = ?';
      const paramsIngresos = [idUsuario];
      const paramsGastos = [idUsuario];

      if (fechaInicio) {
        queryIngresos += ' AND fechaIngreso >= ?';
        queryGastos += ' AND fechaGasto >= ?';
        paramsIngresos.push(fechaInicio);
        paramsGastos.push(fechaInicio);
      }

      if (fechaFin) {
        queryIngresos += ' AND fechaIngreso <= ?';
        queryGastos += ' AND fechaGasto <= ?';
        paramsIngresos.push(fechaFin);
        paramsGastos.push(fechaFin);
      }

      const [ingresosFiltrados, gastosFiltrados] = await Promise.all([
        executeQuery(queryIngresos, paramsIngresos),
        executeQuery(queryGastos, paramsGastos)
      ]);

      balanceFiltrado = {
        totalIngresos: parseFloat(ingresosFiltrados[0].totalIngresos),
        totalGastos: parseFloat(gastosFiltrados[0].totalGastos),
        balance: parseFloat(ingresosFiltrados[0].totalIngresos) - parseFloat(gastosFiltrados[0].totalGastos),
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null
      };
    }

    res.json({
      success: true,
      data: {
        balanceGeneral: balance[0],
        balanceFiltrado
      }
    });
  } catch (error) {
    console.error('Error calculando balance:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener resumen financiero detallado
const getResumenFinanciero = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    // Construir consultas base
    let whereClause = 'WHERE idUsuario = ?';
    const params = [idUsuario];

    if (fechaInicio) {
      whereClause += ' AND (fechaIngreso >= ? OR fechaGasto >= ?)';
      params.push(fechaInicio, fechaInicio);
    }

    if (fechaFin) {
      whereClause += ' AND (fechaIngreso <= ? OR fechaGasto <= ?)';
      params.push(fechaFin, fechaFin);
    }

    // Obtener resumen de ingresos por tipo
    const resumenIngresos = await executeQuery(`
      SELECT 
        t.nombreTipo,
        COUNT(*) as cantidad,
        SUM(i.montoIngreso) as total,
        AVG(i.montoIngreso) as promedio
      FROM INGRESO i
      INNER JOIN TIPO t ON i.idTipo = t.idTipo
      ${whereClause.replace('fechaGasto', 'fechaIngreso')}
      GROUP BY t.idTipo, t.nombreTipo
      ORDER BY total DESC
    `, params.filter((_, index) => index === 0 || index === 1 || index === 3));

    // Obtener resumen de gastos por tipo
    const resumenGastos = await executeQuery(`
      SELECT 
        t.nombreTipo,
        COUNT(*) as cantidad,
        SUM(g.montoGasto) as total,
        AVG(g.montoGasto) as promedio
      FROM GASTO g
      INNER JOIN TIPO t ON g.idTipo = t.idTipo
      ${whereClause.replace('fechaIngreso', 'fechaGasto')}
      GROUP BY t.idTipo, t.nombreTipo
      ORDER BY total DESC
    `, params.filter((_, index) => index === 0 || index === 2 || index === 4));

    // Obtener resumen de gastos por método de pago
    const resumenMetodosPago = await executeQuery(`
      SELECT 
        mp.nombreTipo as metodoPago,
        COUNT(*) as cantidad,
        SUM(g.montoGasto) as total,
        AVG(g.montoGasto) as promedio
      FROM GASTO g
      INNER JOIN TIPO mp ON g.idMetodoPago = mp.idTipo
      ${whereClause.replace('fechaIngreso', 'fechaGasto')}
      GROUP BY mp.idTipo, mp.nombreTipo
      ORDER BY total DESC
    `, params.filter((_, index) => index === 0 || index === 2 || index === 4));

    // Calcular balance usando stored procedure
    const balance = await executeStoredProcedure('CalcularBalance', [idUsuario]);

    // Obtener transacciones recientes
    const transaccionesRecientes = await executeQuery(`
      SELECT 
        'ingreso' as tipo,
        i.descripcionIngreso as descripcion,
        i.montoIngreso as monto,
        DATE_FORMAT(i.fechaIngreso, '%Y-%m-%d') as fecha,
        t.nombreTipo as categoria
      FROM INGRESO i
      INNER JOIN TIPO t ON i.idTipo = t.idTipo
      WHERE i.idUsuario = ?
      UNION ALL
      SELECT 
        'gasto' as tipo,
        g.descripcionGasto as descripcion,
        g.montoGasto as monto,
        DATE_FORMAT(g.fechaGasto, '%Y-%m-%d') as fecha,
        t.nombreTipo as categoria
      FROM GASTO g
      INNER JOIN TIPO t ON g.idTipo = t.idTipo
      WHERE g.idUsuario = ?
      ORDER BY fecha DESC
      LIMIT 10
    `, [idUsuario, idUsuario]);

    res.json({
      success: true,
      data: {
        balance: balance[0],
        resumenIngresos,
        resumenGastos,
        resumenMetodosPago,
        transaccionesRecientes,
        periodo: {
          fechaInicio: fechaInicio || null,
          fechaFin: fechaFin || null
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen financiero:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas mensuales
const getEstadisticasMensuales = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { año = new Date().getFullYear() } = req.query;

    // Obtener estadísticas mensuales de ingresos
    const estadisticasIngresos = await executeQuery(`
      SELECT 
        MONTH(fechaIngreso) as mes,
        MONTHNAME(fechaIngreso) as nombreMes,
        COUNT(*) as cantidad,
        SUM(montoIngreso) as total
      FROM INGRESO
      WHERE idUsuario = ? AND YEAR(fechaIngreso) = ?
      GROUP BY MONTH(fechaIngreso), MONTHNAME(fechaIngreso)
      ORDER BY mes
    `, [idUsuario, año]);

    // Obtener estadísticas mensuales de gastos
    const estadisticasGastos = await executeQuery(`
      SELECT 
        MONTH(fechaGasto) as mes,
        MONTHNAME(fechaGasto) as nombreMes,
        COUNT(*) as cantidad,
        SUM(montoGasto) as total
      FROM GASTO
      WHERE idUsuario = ? AND YEAR(fechaGasto) = ?
      GROUP BY MONTH(fechaGasto), MONTHNAME(fechaGasto)
      ORDER BY mes
    `, [idUsuario, año]);

    // Combinar estadísticas por mes
    const estadisticasCombinadas = [];
    for (let mes = 1; mes <= 12; mes++) {
      const ingresoMes = estadisticasIngresos.find(e => e.mes === mes) || { cantidad: 0, total: 0 };
      const gastoMes = estadisticasGastos.find(e => e.mes === mes) || { cantidad: 0, total: 0 };
      
      const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      estadisticasCombinadas.push({
        mes,
        nombreMes: nombresMeses[mes - 1],
        ingresos: {
          cantidad: ingresoMes.cantidad,
          total: parseFloat(ingresoMes.total || 0)
        },
        gastos: {
          cantidad: gastoMes.cantidad,
          total: parseFloat(gastoMes.total || 0)
        },
        balance: parseFloat(ingresoMes.total || 0) - parseFloat(gastoMes.total || 0)
      });
    }

    res.json({
      success: true,
      data: {
        año: parseInt(año),
        estadisticasMensuales: estadisticasCombinadas
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas mensuales:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getBalanceByUser,
  getResumenFinanciero,
  getEstadisticasMensuales
};