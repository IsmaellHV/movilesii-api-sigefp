const { executeStoredProcedure, executeQuery } = require('../config/database');

class TipoService {
  /**
   * Obtener todos los tipos
   * @returns {Promise<Object>} - Lista de todos los tipos
   */
  async obtenerTodosLosTipos() {
    try {
      const query = `
        SELECT 
          idTipo,
          nombreTipo,
          categoria,
          descripcion,
          fechaRegistro
        FROM TIPO 
        ORDER BY categoria, nombreTipo
      `;
      
      const tipos = await executeQuery(query);
      
      // Agrupar por categoría
      const tiposAgrupados = tipos.reduce((acc, tipo) => {
        if (!acc[tipo.categoria]) {
          acc[tipo.categoria] = [];
        }
        acc[tipo.categoria].push(tipo);
        return acc;
      }, {});
      
      return {
        success: true,
        data: {
          tipos,
          tiposAgrupados
        },
        message: 'Tipos obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerTodosLosTipos:', error);
      throw new Error(`Error al obtener tipos: ${error.message}`);
    }
  }

  /**
   * Obtener tipos por categoría
   * @param {string} categoria - Categoría (Ingreso, Gasto, MetodoPago)
   * @returns {Promise<Object>} - Lista de tipos de la categoría
   */
  async obtenerTiposPorCategoria(categoria) {
    try {
      const query = `
        SELECT 
          idTipo,
          nombreTipo,
          categoria,
          descripcion,
          fechaRegistro
        FROM TIPO 
        WHERE categoria = ?
        ORDER BY nombreTipo
      `;
      
      const tipos = await executeQuery(query, [categoria]);
      
      return {
        success: true,
        data: tipos,
        message: `Tipos de ${categoria} obtenidos exitosamente`
      };
    } catch (error) {
      console.error('Error en obtenerTiposPorCategoria:', error);
      throw new Error(`Error al obtener tipos por categoría: ${error.message}`);
    }
  }

  /**
   * Obtener tipo por ID
   * @param {number} idTipo - ID del tipo
   * @returns {Promise<Object>} - Datos del tipo
   */
  async obtenerTipoPorId(idTipo) {
    try {
      const query = `
        SELECT 
          idTipo,
          nombreTipo,
          categoria,
          descripcion,
          fechaRegistro
        FROM TIPO 
        WHERE idTipo = ?
      `;
      
      const result = await executeQuery(query, [idTipo]);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'Tipo no encontrado'
        };
      }
      
      return {
        success: true,
        data: result[0],
        message: 'Tipo obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerTipoPorId:', error);
      throw new Error(`Error al obtener tipo: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo tipo
   * @param {Object} tipoData - Datos del tipo
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async crearTipo(tipoData) {
    const { nombreTipo, categoria, descripcion } = tipoData;
    
    try {
      // Verificar si ya existe un tipo con el mismo nombre en la misma categoría
      const existeTipo = await this.verificarTipoExistente(nombreTipo, categoria);
      if (existeTipo) {
        return {
          success: false,
          message: `Ya existe un tipo '${nombreTipo}' en la categoría '${categoria}'`
        };
      }
      
      // Validar categoría
      const categoriasValidas = ['Ingreso', 'Gasto', 'MetodoPago'];
      if (!categoriasValidas.includes(categoria)) {
        return {
          success: false,
          message: 'Categoría inválida. Debe ser: Ingreso, Gasto o MetodoPago'
        };
      }
      
      // Insertar tipo usando stored procedure
      const result = await executeStoredProcedure('sp_insertar_tipo', [
        nombreTipo,
        categoria,
        descripcion || null
      ]);
      
      return {
        success: true,
        data: {
          idTipo: result.insertId,
          nombreTipo,
          categoria,
          descripcion
        },
        message: 'Tipo creado exitosamente'
      };
    } catch (error) {
      console.error('Error en crearTipo:', error);
      throw new Error(`Error al crear tipo: ${error.message}`);
    }
  }

  /**
   * Actualizar un tipo
   * @param {number} idTipo - ID del tipo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async actualizarTipo(idTipo, updateData) {
    const { nombreTipo, categoria, descripcion } = updateData;
    
    try {
      // Verificar que el tipo existe
      const tipoExiste = await this.obtenerTipoPorId(idTipo);
      if (!tipoExiste.success) {
        return tipoExiste;
      }
      
      const tipoActual = tipoExiste.data;
      
      // Si se está cambiando el nombre o categoría, verificar duplicados
      if ((nombreTipo && nombreTipo !== tipoActual.nombreTipo) || 
          (categoria && categoria !== tipoActual.categoria)) {
        const nuevoNombre = nombreTipo || tipoActual.nombreTipo;
        const nuevaCategoria = categoria || tipoActual.categoria;
        
        const existeTipo = await this.verificarTipoExistente(nuevoNombre, nuevaCategoria, idTipo);
        if (existeTipo) {
          return {
            success: false,
            message: `Ya existe un tipo '${nuevoNombre}' en la categoría '${nuevaCategoria}'`
          };
        }
      }
      
      // Validar categoría si se está cambiando
      if (categoria) {
        const categoriasValidas = ['Ingreso', 'Gasto', 'MetodoPago'];
        if (!categoriasValidas.includes(categoria)) {
          return {
            success: false,
            message: 'Categoría inválida. Debe ser: Ingreso, Gasto o MetodoPago'
          };
        }
      }
      
      // Actualizar tipo usando stored procedure
      await executeStoredProcedure('sp_actualizar_tipo', [
        idTipo,
        nombreTipo || tipoActual.nombreTipo,
        categoria || tipoActual.categoria,
        descripcion !== undefined ? descripcion : tipoActual.descripcion
      ]);
      
      // Obtener datos actualizados
      const tipoActualizado = await this.obtenerTipoPorId(idTipo);
      
      return {
        success: true,
        data: tipoActualizado.data,
        message: 'Tipo actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en actualizarTipo:', error);
      throw new Error(`Error al actualizar tipo: ${error.message}`);
    }
  }

  /**
   * Eliminar un tipo
   * @param {number} idTipo - ID del tipo
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async eliminarTipo(idTipo) {
    try {
      // Verificar que el tipo existe
      const tipoExiste = await this.obtenerTipoPorId(idTipo);
      if (!tipoExiste.success) {
        return tipoExiste;
      }
      
      // Verificar si el tipo está siendo usado en ingresos o gastos
      const estaEnUso = await this.verificarTipoEnUso(idTipo);
      if (estaEnUso.enUso) {
        return {
          success: false,
          message: `No se puede eliminar el tipo porque está siendo usado en ${estaEnUso.detalles}`,
          data: estaEnUso
        };
      }
      
      // Eliminar tipo usando stored procedure
      await executeStoredProcedure('sp_eliminar_tipo', [idTipo]);
      
      return {
        success: true,
        message: 'Tipo eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminarTipo:', error);
      throw new Error(`Error al eliminar tipo: ${error.message}`);
    }
  }

  /**
   * Obtener tipos más utilizados
   * @param {string} categoria - Categoría opcional
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Object>} - Tipos más utilizados
   */
  async obtenerTiposMasUtilizados(categoria = null, limite = 10) {
    try {
      let query = `
        SELECT 
          t.idTipo,
          t.nombreTipo,
          t.categoria,
          t.descripcion,
          COALESCE(uso_ingresos.cantidad, 0) + COALESCE(uso_gastos.cantidad, 0) + COALESCE(uso_metodos.cantidad, 0) as totalUsos,
          COALESCE(uso_ingresos.cantidad, 0) as usosEnIngresos,
          COALESCE(uso_gastos.cantidad, 0) as usosEnGastos,
          COALESCE(uso_metodos.cantidad, 0) as usosComoMetodoPago
        FROM TIPO t
        LEFT JOIN (
          SELECT idTipo, COUNT(*) as cantidad 
          FROM INGRESO 
          GROUP BY idTipo
        ) uso_ingresos ON t.idTipo = uso_ingresos.idTipo
        LEFT JOIN (
          SELECT idTipo, COUNT(*) as cantidad 
          FROM GASTO 
          GROUP BY idTipo
        ) uso_gastos ON t.idTipo = uso_gastos.idTipo
        LEFT JOIN (
          SELECT idMetodoPago, COUNT(*) as cantidad 
          FROM GASTO 
          GROUP BY idMetodoPago
        ) uso_metodos ON t.idTipo = uso_metodos.idMetodoPago
      `;
      
      let params = [];
      
      if (categoria) {
        query += ' WHERE t.categoria = ?';
        params.push(categoria);
      }
      
      query += ' ORDER BY totalUsos DESC LIMIT ?';
      params.push(limite);
      
      const tipos = await executeQuery(query, params);
      
      return {
        success: true,
        data: tipos,
        message: 'Tipos más utilizados obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerTiposMasUtilizados:', error);
      throw new Error(`Error al obtener tipos más utilizados: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de tipos
   * @returns {Promise<Object>} - Estadísticas de tipos
   */
  async obtenerEstadisticasTipos() {
    try {
      const estadisticasQuery = `
        SELECT 
          categoria,
          COUNT(*) as cantidadTipos,
          COUNT(CASE WHEN descripcion IS NOT NULL THEN 1 END) as tiposConDescripcion
        FROM TIPO
        GROUP BY categoria
        ORDER BY categoria
      `;
      
      const estadisticas = await executeQuery(estadisticasQuery);
      
      // Obtener total de tipos
      const totalQuery = 'SELECT COUNT(*) as total FROM TIPO';
      const totalResult = await executeQuery(totalQuery);
      
      return {
        success: true,
        data: {
          estadisticasPorCategoria: estadisticas,
          totalTipos: totalResult[0].total
        },
        message: 'Estadísticas de tipos obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticasTipos:', error);
      throw new Error(`Error al obtener estadísticas de tipos: ${error.message}`);
    }
  }

  // Métodos auxiliares
  
  /**
   * Verificar si un tipo ya existe
   * @param {string} nombreTipo - Nombre del tipo
   * @param {string} categoria - Categoría del tipo
   * @param {number} excludeId - ID a excluir de la búsqueda
   * @returns {Promise<boolean>} - True si existe
   */
  async verificarTipoExistente(nombreTipo, categoria, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM TIPO WHERE nombreTipo = ? AND categoria = ?';
      let params = [nombreTipo, categoria];
      
      if (excludeId) {
        query += ' AND idTipo != ?';
        params.push(excludeId);
      }
      
      const result = await executeQuery(query, params);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en verificarTipoExistente:', error);
      throw error;
    }
  }

  /**
   * Verificar si un tipo está siendo usado
   * @param {number} idTipo - ID del tipo
   * @returns {Promise<Object>} - Información sobre el uso del tipo
   */
  async verificarTipoEnUso(idTipo) {
    try {
      const usoQuery = `
        SELECT 
          (SELECT COUNT(*) FROM INGRESO WHERE idTipo = ?) as usosEnIngresos,
          (SELECT COUNT(*) FROM GASTO WHERE idTipo = ?) as usosEnGastos,
          (SELECT COUNT(*) FROM GASTO WHERE idMetodoPago = ?) as usosComoMetodoPago
      `;
      
      const result = await executeQuery(usoQuery, [idTipo, idTipo, idTipo]);
      const usos = result[0];
      
      const totalUsos = usos.usosEnIngresos + usos.usosEnGastos + usos.usosComoMetodoPago;
      
      let detalles = [];
      if (usos.usosEnIngresos > 0) detalles.push(`${usos.usosEnIngresos} ingresos`);
      if (usos.usosEnGastos > 0) detalles.push(`${usos.usosEnGastos} gastos`);
      if (usos.usosComoMetodoPago > 0) detalles.push(`${usos.usosComoMetodoPago} métodos de pago`);
      
      return {
        enUso: totalUsos > 0,
        totalUsos,
        usosEnIngresos: usos.usosEnIngresos,
        usosEnGastos: usos.usosEnGastos,
        usosComoMetodoPago: usos.usosComoMetodoPago,
        detalles: detalles.join(', ')
      };
    } catch (error) {
      console.error('Error en verificarTipoEnUso:', error);
      throw error;
    }
  }

  /**
   * Validar que un tipo existe y pertenece a la categoría especificada
   * @param {number} idTipo - ID del tipo
   * @param {string} categoriaEsperada - Categoría esperada
   * @returns {Promise<Object>} - Resultado de la validación
   */
  async validarTipoCategoria(idTipo, categoriaEsperada) {
    try {
      const tipo = await this.obtenerTipoPorId(idTipo);
      
      if (!tipo.success) {
        return {
          success: false,
          message: 'Tipo no encontrado'
        };
      }
      
      if (tipo.data.categoria !== categoriaEsperada) {
        return {
          success: false,
          message: `El tipo seleccionado no es válido para ${categoriaEsperada}`
        };
      }
      
      return {
        success: true,
        data: tipo.data,
        message: 'Tipo válido'
      };
    } catch (error) {
      console.error('Error en validarTipoCategoria:', error);
      throw error;
    }
  }
}

module.exports = new TipoService();