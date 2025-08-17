const { executeStoredProcedure, executeQuery } = require('../config/database');

class GastoService {
  /**
   * Insertar un nuevo gasto utilizando stored procedure
   * @param {Object} gastoData - Datos del gasto
   * @returns {Promise<Object>} - Resultado de la inserción
   */
  async insertarGasto(gastoData) {
    try {
      const { idUsuario, idTipo, idMetodoPago, montoGasto, descripcionGasto, fechaGasto, telefonoGasto } = gastoData;
      
      const result = await executeStoredProcedure('sp_insertar_gasto', [
        idUsuario,
        idTipo,
        idMetodoPago,
        montoGasto,
        descripcionGasto,
        fechaGasto,
        telefonoGasto
      ]);
      
      return {
        success: true,
        data: result[0],
        message: 'Gasto insertado exitosamente'
      };
    } catch (error) {
      console.error('Error en insertarGasto:', error);
      throw new Error(`Error al insertar gasto: ${error.message}`);
    }
  }

  /**
   * Eliminar un gasto utilizando stored procedure
   * @param {number} idGasto - ID del gasto a eliminar
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async eliminarGasto(idGasto) {
    try {
      const result = await executeStoredProcedure('sp_eliminar_gasto', [idGasto]);
      
      return {
        success: true,
        data: result[0],
        message: 'Gasto eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminarGasto:', error);
      throw new Error(`Error al eliminar gasto: ${error.message}`);
    }
  }

  /**
   * Listar gastos por usuario utilizando stored procedure
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Lista de gastos
   */
  async listarGastosPorUsuario(idUsuario) {
    try {
      const result = await executeStoredProcedure('sp_listar_gastos_por_usuario', [idUsuario]);
      
      return {
        success: true,
        data: result[0] || [],
        message: 'Gastos obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en listarGastosPorUsuario:', error);
      throw new Error(`Error al listar gastos: ${error.message}`);
    }
  }

  /**
   * Listar gastos por teléfono utilizando stored procedure
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<Object>} - Lista de gastos
   */
  async listarGastosPorTelefono(telefono) {
    try {
      const result = await executeStoredProcedure('sp_listar_gastos_por_telefono', [telefono]);
      
      return {
        success: true,
        data: result[0] || [],
        message: 'Gastos por teléfono obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en listarGastosPorTelefono:', error);
      throw new Error(`Error al listar gastos por teléfono: ${error.message}`);
    }
  }

  /**
   * Obtener un gasto por ID
   * @param {number} idGasto - ID del gasto
   * @param {number} idUsuario - ID del usuario (para verificar permisos)
   * @returns {Promise<Object>} - Datos del gasto
   */
  async obtenerGastoPorId(idGasto, idUsuario) {
    try {
      const query = `
        SELECT 
          g.idGasto,
          g.idUsuario,
          g.idTipo,
          t.nombreTipo,
          t.categoriaTipo,
          g.idMetodoPago,
          mp.nombreTipo as nombreMetodoPago,
          g.montoGasto,
          g.descripcionGasto,
          g.telefonoGasto,
          DATE_FORMAT(g.fechaGasto, '%Y-%m-%d') as fechaGasto,
          DATE_FORMAT(g.fechaRegistro, '%Y-%m-%d %H:%i:%s') as fechaRegistro
        FROM GASTO g
        INNER JOIN TIPO t ON g.idTipo = t.idTipo
        INNER JOIN TIPO mp ON g.idMetodoPago = mp.idTipo
        WHERE g.idGasto = ? AND g.idUsuario = ?
      `;
      
      const result = await executeQuery(query, [idGasto, idUsuario]);
      
      if (result.length === 0) {
        throw new Error('Gasto no encontrado o no tienes permisos para acceder a él');
      }
      
      return {
        success: true,
        data: result[0],
        message: 'Gasto obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerGastoPorId:', error);
      throw new Error(`Error al obtener gasto: ${error.message}`);
    }
  }

  /**
   * Actualizar un gasto
   * @param {number} idGasto - ID del gasto
   * @param {Object} gastoData - Nuevos datos del gasto
   * @param {number} idUsuario - ID del usuario (para verificar permisos)
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async actualizarGasto(idGasto, gastoData, idUsuario) {
    try {
      const { idTipo, idMetodoPago, montoGasto, descripcionGasto, fechaGasto, telefonoGasto } = gastoData;
      
      // Verificar que el gasto pertenece al usuario
      const existingGasto = await this.obtenerGastoPorId(idGasto, idUsuario);
      if (!existingGasto.success) {
        throw new Error('Gasto no encontrado o no tienes permisos para modificarlo');
      }
      
      const query = `
        UPDATE GASTO 
        SET 
          idTipo = ?,
          idMetodoPago = ?,
          montoGasto = ?,
          descripcionGasto = ?,
          fechaGasto = ?,
          telefonoGasto = ?
        WHERE idGasto = ? AND idUsuario = ?
      `;
      
      await executeQuery(query, [
        idTipo,
        idMetodoPago,
        montoGasto,
        descripcionGasto,
        fechaGasto,
        telefonoGasto,
        idGasto,
        idUsuario
      ]);
      
      // Obtener el gasto actualizado
      const gastoActualizado = await this.obtenerGastoPorId(idGasto, idUsuario);
      
      return {
        success: true,
        data: gastoActualizado.data,
        message: 'Gasto actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en actualizarGasto:', error);
      throw new Error(`Error al actualizar gasto: ${error.message}`);
    }
  }

  /**
   * Obtener resumen de gastos del usuario
   * @param {number} idUsuario - ID del usuario
   * @param {Object} filtros - Filtros opcionales (fechaInicio, fechaFin, idTipo, idMetodoPago)
   * @returns {Promise<Object>} - Resumen de gastos
   */
  async obtenerResumenGastos(idUsuario, filtros = {}) {
    try {
      const { fechaInicio, fechaFin, idTipo, idMetodoPago } = filtros;
      
      let whereClause = 'WHERE g.idUsuario = ?';
      let params = [idUsuario];
      
      if (fechaInicio) {
        whereClause += ' AND g.fechaGasto >= ?';
        params.push(fechaInicio);
      }
      
      if (fechaFin) {
        whereClause += ' AND g.fechaGasto <= ?';
        params.push(fechaFin);
      }
      
      if (idTipo) {
        whereClause += ' AND g.idTipo = ?';
        params.push(idTipo);
      }
      
      if (idMetodoPago) {
        whereClause += ' AND g.idMetodoPago = ?';
        params.push(idMetodoPago);
      }
      
      const query = `
        SELECT 
          COUNT(*) as totalGastos,
          COALESCE(SUM(g.montoGasto), 0) as montoTotal,
          COALESCE(AVG(g.montoGasto), 0) as promedioGasto,
          COALESCE(MAX(g.montoGasto), 0) as gastoMaximo,
          COALESCE(MIN(g.montoGasto), 0) as gastoMinimo,
          t.nombreTipo,
          t.categoriaTipo,
          mp.nombreTipo as metodoPago
        FROM GASTO g
        LEFT JOIN TIPO t ON g.idTipo = t.idTipo
        LEFT JOIN TIPO mp ON g.idMetodoPago = mp.idTipo
        ${whereClause}
        GROUP BY t.idTipo, t.nombreTipo, t.categoriaTipo, mp.idTipo, mp.nombreTipo
        ORDER BY montoTotal DESC
      `;
      
      const result = await executeQuery(query, params);
      
      // Obtener totales generales
      const totalesQuery = `
        SELECT 
          COUNT(*) as totalGastos,
          COALESCE(SUM(montoGasto), 0) as montoTotal
        FROM GASTO 
        ${whereClause.replace('g.idUsuario', 'idUsuario').replace('g.fechaGasto', 'fechaGasto').replace('g.idTipo', 'idTipo').replace('g.idMetodoPago', 'idMetodoPago')}
      `;
      
      const totales = await executeQuery(totalesQuery, params.slice(0, params.length - (idMetodoPago ? 1 : 0) - (idTipo ? 1 : 0)));
      
      return {
        success: true,
        data: {
          resumenPorTipo: result,
          totales: totales[0]
        },
        message: 'Resumen de gastos obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerResumenGastos:', error);
      throw new Error(`Error al obtener resumen de gastos: ${error.message}`);
    }
  }

  /**
   * Verificar si un tipo de gasto existe y es válido
   * @param {number} idTipo - ID del tipo
   * @returns {Promise<boolean>} - True si el tipo es válido
   */
  async verificarTipoGasto(idTipo) {
    try {
      const query = `
        SELECT idTipo 
        FROM TIPO 
        WHERE idTipo = ? AND categoriaTipo = 'Gasto'
      `;
      
      const result = await executeQuery(query, [idTipo]);
      return result.length > 0;
    } catch (error) {
      console.error('Error en verificarTipoGasto:', error);
      return false;
    }
  }

  /**
   * Verificar si un método de pago existe y es válido
   * @param {number} idMetodoPago - ID del método de pago
   * @returns {Promise<boolean>} - True si el método de pago es válido
   */
  async verificarMetodoPago(idMetodoPago) {
    try {
      const query = `
        SELECT idTipo 
        FROM TIPO 
        WHERE idTipo = ? AND categoriaTipo = 'MetodoPago'
      `;
      
      const result = await executeQuery(query, [idMetodoPago]);
      return result.length > 0;
    } catch (error) {
      console.error('Error en verificarMetodoPago:', error);
      return false;
    }
  }
}

module.exports = new GastoService();