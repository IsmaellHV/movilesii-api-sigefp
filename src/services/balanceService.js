const { executeStoredProcedure, executeQuery } = require('../config/database');

class BalanceService {
  /**
   * Calcular balance del usuario utilizando stored procedure
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Balance del usuario
   */
  async calcularBalanceUsuario(idUsuario) {
    try {
      const result = await executeStoredProcedure('sp_balance_usuario', [idUsuario]);
      
      return {
        success: true,
        data: result[0] || [],
        message: 'Balance calculado exitosamente'
      };
    } catch (error) {
      console.error('Error en calcularBalanceUsuario:', error);
      throw new Error(`Error al calcular balance: ${error.message}`);
    }
  }

  /**
   * Obtener balance filtrado por fechas
   * @param {number} idUsuario - ID del usuario
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} - Balance filtrado
   */
  async obtenerBalancePorPeriodo(idUsuario, fechaInicio, fechaFin) {
    try {
      // Calcular ingresos en el período
      const ingresosQuery = `
        SELECT 
          COALESCE(SUM(montoIngreso), 0) as totalIngresos,
          COUNT(*) as cantidadIngresos
        FROM INGRESO 
        WHERE idUsuario = ? 
          AND fechaIngreso >= ? 
          AND fechaIngreso <= ?
      `;
      
      // Calcular gastos en el período
      const gastosQuery = `
        SELECT 
          COALESCE(SUM(montoGasto), 0) as totalGastos,
          COUNT(*) as cantidadGastos
        FROM GASTO 
        WHERE idUsuario = ? 
          AND fechaGasto >= ? 
          AND fechaGasto <= ?
      `;
      
      const [ingresos, gastos] = await Promise.all([
        executeQuery(ingresosQuery, [idUsuario, fechaInicio, fechaFin]),
        executeQuery(gastosQuery, [idUsuario, fechaInicio, fechaFin])
      ]);
      
      const totalIngresos = parseFloat(ingresos[0].totalIngresos);
      const totalGastos = parseFloat(gastos[0].totalGastos);
      const balance = totalIngresos - totalGastos;
      
      return {
        success: true,
        data: {
          periodo: {
            fechaInicio,
            fechaFin
          },
          ingresos: {
            total: totalIngresos,
            cantidad: ingresos[0].cantidadIngresos
          },
          gastos: {
            total: totalGastos,
            cantidad: gastos[0].cantidadGastos
          },
          balance: balance,
          estado: balance >= 0 ? 'positivo' : 'negativo'
        },
        message: 'Balance por período obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerBalancePorPeriodo:', error);
      throw new Error(`Error al obtener balance por período: ${error.message}`);
    }
  }

  /**
   * Obtener resumen financiero completo del usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Resumen financiero detallado
   */
  async obtenerResumenFinanciero(idUsuario) {
    try {
      // Balance general
      const balanceGeneral = await this.calcularBalanceUsuario(idUsuario);
      
      // Ingresos por tipo
      const ingresosPorTipoQuery = `
        SELECT 
          t.nombreTipo,
          COUNT(*) as cantidad,
          SUM(i.montoIngreso) as total,
          AVG(i.montoIngreso) as promedio
        FROM INGRESO i
        INNER JOIN TIPO t ON i.idTipo = t.idTipo
        WHERE i.idUsuario = ?
        GROUP BY t.idTipo, t.nombreTipo
        ORDER BY total DESC
      `;
      
      // Gastos por tipo
      const gastosPorTipoQuery = `
        SELECT 
          t.nombreTipo,
          COUNT(*) as cantidad,
          SUM(g.montoGasto) as total,
          AVG(g.montoGasto) as promedio
        FROM GASTO g
        INNER JOIN TIPO t ON g.idTipo = t.idTipo
        WHERE g.idUsuario = ?
        GROUP BY t.idTipo, t.nombreTipo
        ORDER BY total DESC
      `;
      
      // Gastos por método de pago
      const gastosPorMetodoQuery = `
        SELECT 
          t.nombreTipo as metodoPago,
          COUNT(*) as cantidad,
          SUM(g.montoGasto) as total,
          AVG(g.montoGasto) as promedio
        FROM GASTO g
        INNER JOIN TIPO t ON g.idMetodoPago = t.idTipo
        WHERE g.idUsuario = ?
        GROUP BY t.idTipo, t.nombreTipo
        ORDER BY total DESC
      `;
      
      // Transacciones recientes (últimas 10)
      const transaccionesRecientesQuery = `
        (
          SELECT 
            'ingreso' as tipo,
            i.montoIngreso as monto,
            i.descripcionIngreso as descripcion,
            t.nombreTipo as categoria,
            i.fechaIngreso as fecha,
            i.fechaRegistro
          FROM INGRESO i
          INNER JOIN TIPO t ON i.idTipo = t.idTipo
          WHERE i.idUsuario = ?
        )
        UNION ALL
        (
          SELECT 
            'gasto' as tipo,
            g.montoGasto as monto,
            g.descripcionGasto as descripcion,
            t.nombreTipo as categoria,
            g.fechaGasto as fecha,
            g.fechaRegistro
          FROM GASTO g
          INNER JOIN TIPO t ON g.idTipo = t.idTipo
          WHERE g.idUsuario = ?
        )
        ORDER BY fechaRegistro DESC
        LIMIT 10
      `;
      
      const [ingresosPorTipo, gastosPorTipo, gastosPorMetodo, transaccionesRecientes] = await Promise.all([
        executeQuery(ingresosPorTipoQuery, [idUsuario]),
        executeQuery(gastosPorTipoQuery, [idUsuario]),
        executeQuery(gastosPorMetodoQuery, [idUsuario]),
        executeQuery(transaccionesRecientesQuery, [idUsuario, idUsuario])
      ]);
      
      return {
        success: true,
        data: {
          balanceGeneral: balanceGeneral.data,
          ingresosPorTipo,
          gastosPorTipo,
          gastosPorMetodoPago: gastosPorMetodo,
          transaccionesRecientes
        },
        message: 'Resumen financiero obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerResumenFinanciero:', error);
      throw new Error(`Error al obtener resumen financiero: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas mensuales de ingresos y gastos
   * @param {number} idUsuario - ID del usuario
   * @param {number} meses - Número de meses hacia atrás (por defecto 12)
   * @returns {Promise<Object>} - Estadísticas mensuales
   */
  async obtenerEstadisticasMensuales(idUsuario, meses = 12) {
    try {
      const estadisticasQuery = `
        SELECT 
          DATE_FORMAT(fecha, '%Y-%m') as mes,
          SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as totalIngresos,
          SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as totalGastos,
          COUNT(CASE WHEN tipo = 'ingreso' THEN 1 END) as cantidadIngresos,
          COUNT(CASE WHEN tipo = 'gasto' THEN 1 END) as cantidadGastos
        FROM (
          SELECT 
            'ingreso' as tipo,
            montoIngreso as monto,
            fechaIngreso as fecha
          FROM INGRESO 
          WHERE idUsuario = ? 
            AND fechaIngreso >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
          
          UNION ALL
          
          SELECT 
            'gasto' as tipo,
            montoGasto as monto,
            fechaGasto as fecha
          FROM GASTO 
          WHERE idUsuario = ? 
            AND fechaGasto >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        ) as transacciones
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        ORDER BY mes DESC
      `;
      
      const estadisticas = await executeQuery(estadisticasQuery, [idUsuario, meses, idUsuario, meses]);
      
      // Calcular balance mensual
      const estadisticasConBalance = estadisticas.map(mes => ({
        ...mes,
        balance: parseFloat(mes.totalIngresos) - parseFloat(mes.totalGastos),
        totalIngresos: parseFloat(mes.totalIngresos),
        totalGastos: parseFloat(mes.totalGastos)
      }));
      
      return {
        success: true,
        data: {
          estadisticasMensuales: estadisticasConBalance,
          periodo: `Últimos ${meses} meses`
        },
        message: 'Estadísticas mensuales obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticasMensuales:', error);
      throw new Error(`Error al obtener estadísticas mensuales: ${error.message}`);
    }
  }

  /**
   * Obtener tendencias de gastos e ingresos
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Tendencias financieras
   */
  async obtenerTendenciasFinancieras(idUsuario) {
    try {
      const tendenciasQuery = `
        SELECT 
          YEAR(fecha) as año,
          MONTH(fecha) as mes,
          tipo,
          SUM(monto) as total,
          COUNT(*) as cantidad,
          AVG(monto) as promedio
        FROM (
          SELECT 
            'ingreso' as tipo,
            montoIngreso as monto,
            fechaIngreso as fecha
          FROM INGRESO 
          WHERE idUsuario = ? 
            AND fechaIngreso >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          
          UNION ALL
          
          SELECT 
            'gasto' as tipo,
            montoGasto as monto,
            fechaGasto as fecha
          FROM GASTO 
          WHERE idUsuario = ? 
            AND fechaGasto >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        ) as transacciones
        GROUP BY YEAR(fecha), MONTH(fecha), tipo
        ORDER BY año DESC, mes DESC, tipo
      `;
      
      const tendencias = await executeQuery(tendenciasQuery, [idUsuario, idUsuario]);
      
      return {
        success: true,
        data: {
          tendencias,
          periodo: 'Últimos 6 meses'
        },
        message: 'Tendencias financieras obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerTendenciasFinancieras:', error);
      throw new Error(`Error al obtener tendencias financieras: ${error.message}`);
    }
  }
}

module.exports = new BalanceService();