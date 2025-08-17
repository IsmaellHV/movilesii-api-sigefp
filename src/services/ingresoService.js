const { executeStoredProcedure, executeQuery } = require('../config/database');

class IngresoService {
  /**
   * Insertar un nuevo ingreso utilizando stored procedure
   * @param {Object} ingresoData - Datos del ingreso
   * @returns {Promise<Object>} - Resultado de la inserción
   */
  async insertarIngreso(ingresoData) {
    try {
      const { idUsuario, idTipo, montoIngreso, descripcionIngreso, fechaIngreso } = ingresoData;
      
      const result = await executeStoredProcedure('sp_insertar_ingreso', [
        idUsuario,
        idTipo,
        montoIngreso,
        descripcionIngreso,
        fechaIngreso
      ]);
      
      return {
        success: true,
        data: result[0],
        message: 'Ingreso insertado exitosamente'
      };
    } catch (error) {
      console.error('Error en insertarIngreso:', error);
      throw new Error(`Error al insertar ingreso: ${error.message}`);
    }
  }

  /**
   * Eliminar un ingreso utilizando stored procedure
   * @param {number} idIngreso - ID del ingreso a eliminar
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async eliminarIngreso(idIngreso) {
    try {
      const result = await executeStoredProcedure('sp_eliminar_ingreso', [idIngreso]);
      
      return {
        success: true,
        data: result[0],
        message: 'Ingreso eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminarIngreso:', error);
      throw new Error(`Error al eliminar ingreso: ${error.message}`);
    }
  }

  /**
   * Listar ingresos utilizando stored procedure
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Lista de ingresos
   */
  async listarIngresos(idUsuario) {
    try {
      const result = await executeStoredProcedure('sp_listar_ingresos', [idUsuario]);
      
      return {
        success: true,
        data: result[0] || [],
        message: 'Ingresos obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en listarIngresos:', error);
      throw new Error(`Error al listar ingresos: ${error.message}`);
    }
  }

  /**
   * Obtener un ingreso por ID
   * @param {number} idIngreso - ID del ingreso
   * @param {number} idUsuario - ID del usuario (para verificar permisos)
   * @returns {Promise<Object>} - Datos del ingreso
   */
  async obtenerIngresoPorId(idIngreso, idUsuario) {
    try {
      const query = `
        SELECT 
          i.idIngreso,
          i.idUsuario,
          i.idTipo,
          t.nombreTipo,
          t.categoriaTipo,
          i.montoIngreso,
          i.descripcionIngreso,
          DATE_FORMAT(i.fechaIngreso, '%Y-%m-%d') as fechaIngreso,
          DATE_FORMAT(i.fechaRegistro, '%Y-%m-%d %H:%i:%s') as fechaRegistro
        FROM INGRESO i
        INNER JOIN TIPO t ON i.idTipo = t.idTipo
        WHERE i.idIngreso = ? AND i.idUsuario = ?
      `;
      
      const result = await executeQuery(query, [idIngreso, idUsuario]);
      
      if (result.length === 0) {
        throw new Error('Ingreso no encontrado o no tienes permisos para acceder a él');
      }
      
      return {
        success: true,
        data: result[0],
        message: 'Ingreso obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerIngresoPorId:', error);
      throw new Error(`Error al obtener ingreso: ${error.message}`);
    }
  }

  /**
   * Actualizar un ingreso
   * @param {number} idIngreso - ID del ingreso
   * @param {Object} ingresoData - Nuevos datos del ingreso
   * @param {number} idUsuario - ID del usuario (para verificar permisos)
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async actualizarIngreso(idIngreso, ingresoData, idUsuario) {
    try {
      const { idTipo, montoIngreso, descripcionIngreso, fechaIngreso } = ingresoData;
      
      // Verificar que el ingreso pertenece al usuario
      const existingIngreso = await this.obtenerIngresoPorId(idIngreso, idUsuario);
      if (!existingIngreso.success) {
        throw new Error('Ingreso no encontrado o no tienes permisos para modificarlo');
      }
      
      const query = `
        UPDATE INGRESO 
        SET 
          idTipo = ?,
          montoIngreso = ?,
          descripcionIngreso = ?,
          fechaIngreso = ?
        WHERE idIngreso = ? AND idUsuario = ?
      `;
      
      await executeQuery(query, [
        idTipo,
        montoIngreso,
        descripcionIngreso,
        fechaIngreso,
        idIngreso,
        idUsuario
      ]);
      
      // Obtener el ingreso actualizado
      const ingresoActualizado = await this.obtenerIngresoPorId(idIngreso, idUsuario);
      
      return {
        success: true,
        data: ingresoActualizado.data,
        message: 'Ingreso actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en actualizarIngreso:', error);
      throw new Error(`Error al actualizar ingreso: ${error.message}`);
    }
  }

  /**
   * Obtener resumen de ingresos del usuario
   * @param {number} idUsuario - ID del usuario
   * @param {Object} filtros - Filtros opcionales (fechaInicio, fechaFin, idTipo)
   * @returns {Promise<Object>} - Resumen de ingresos
   */
  async obtenerResumenIngresos(idUsuario, filtros = {}) {
    try {
      const { fechaInicio, fechaFin, idTipo } = filtros;
      
      let whereClause = 'WHERE i.idUsuario = ?';
      let params = [idUsuario];
      
      if (fechaInicio) {
        whereClause += ' AND i.fechaIngreso >= ?';
        params.push(fechaInicio);
      }
      
      if (fechaFin) {
        whereClause += ' AND i.fechaIngreso <= ?';
        params.push(fechaFin);
      }
      
      if (idTipo) {
        whereClause += ' AND i.idTipo = ?';
        params.push(idTipo);
      }
      
      const query = `
        SELECT 
          COUNT(*) as totalIngresos,
          COALESCE(SUM(i.montoIngreso), 0) as montoTotal,
          COALESCE(AVG(i.montoIngreso), 0) as promedioIngreso,
          COALESCE(MAX(i.montoIngreso), 0) as ingresoMaximo,
          COALESCE(MIN(i.montoIngreso), 0) as ingresoMinimo,
          t.nombreTipo,
          t.categoriaTipo
        FROM INGRESO i
        LEFT JOIN TIPO t ON i.idTipo = t.idTipo
        ${whereClause}
        GROUP BY t.idTipo, t.nombreTipo, t.categoriaTipo
        ORDER BY montoTotal DESC
      `;
      
      const result = await executeQuery(query, params);
      
      // Obtener totales generales
      const totalesQuery = `
        SELECT 
          COUNT(*) as totalIngresos,
          COALESCE(SUM(montoIngreso), 0) as montoTotal
        FROM INGRESO 
        ${whereClause.replace('i.idUsuario', 'idUsuario').replace('i.fechaIngreso', 'fechaIngreso').replace('i.idTipo', 'idTipo')}
      `;
      
      const totales = await executeQuery(totalesQuery, params.slice(0, params.length - (idTipo ? 1 : 0)));
      
      return {
        success: true,
        data: {
          resumenPorTipo: result,
          totales: totales[0]
        },
        message: 'Resumen de ingresos obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerResumenIngresos:', error);
      throw new Error(`Error al obtener resumen de ingresos: ${error.message}`);
    }
  }

  /**
   * Verificar si un tipo de ingreso existe y es válido
   * @param {number} idTipo - ID del tipo
   * @returns {Promise<boolean>} - True si el tipo es válido
   */
  async verificarTipoIngreso(idTipo) {
    try {
      const query = `
        SELECT idTipo 
        FROM TIPO 
        WHERE idTipo = ? AND categoriaTipo = 'Ingreso'
      `;
      
      const result = await executeQuery(query, [idTipo]);
      return result.length > 0;
    } catch (error) {
      console.error('Error en verificarTipoIngreso:', error);
      return false;
    }
  }
}

module.exports = new IngresoService();