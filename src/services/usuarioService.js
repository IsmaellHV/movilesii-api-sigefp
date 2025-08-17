const { executeStoredProcedure, executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioService {
  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async crearUsuario(userData) {
    const { nombre, apellido, correo, telefono, contraseña } = userData;
    
    try {
      // Verificar si el correo ya existe
      const existeCorreo = await this.verificarCorreoExistente(correo);
      if (existeCorreo) {
        return {
          success: false,
          message: 'El correo electrónico ya está registrado'
        };
      }
      
      // Verificar si el teléfono ya existe
      const existeTelefono = await this.verificarTelefonoExistente(telefono);
      if (existeTelefono) {
        return {
          success: false,
          message: 'El número de teléfono ya está registrado'
        };
      }
      
      // Encriptar contraseña
      const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);
      
      // Insertar usuario usando stored procedure
      const result = await executeStoredProcedure('sp_insertar_usuario', [
        nombre,
        apellido,
        correo,
        telefono,
        contraseñaEncriptada
      ]);
      
      return {
        success: true,
        data: {
          idUsuario: result.insertId,
          nombre,
          apellido,
          correo,
          telefono
        },
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      console.error('Error en crearUsuario:', error);
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * Obtener usuario por ID
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Datos del usuario
   */
  async obtenerUsuarioPorId(idUsuario) {
    try {
      const query = `
        SELECT 
          idUsuario,
          nombre,
          apellido,
          correo,
          telefono,
          fechaRegistro
        FROM USUARIO 
        WHERE idUsuario = ?
      `;
      
      const result = await executeQuery(query, [idUsuario]);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      return {
        success: true,
        data: result[0],
        message: 'Usuario obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerUsuarioPorId:', error);
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Obtener usuario por correo (para autenticación)
   * @param {string} correo - Correo del usuario
   * @returns {Promise<Object>} - Datos del usuario con contraseña
   */
  async obtenerUsuarioPorCorreo(correo) {
    try {
      const query = `
        SELECT 
          idUsuario,
          nombre,
          apellido,
          correo,
          telefono,
          contraseña,
          fechaRegistro
        FROM USUARIO 
        WHERE correo = ?
      `;
      
      const result = await executeQuery(query, [correo]);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      return {
        success: true,
        data: result[0],
        message: 'Usuario obtenido exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerUsuarioPorCorreo:', error);
      throw new Error(`Error al obtener usuario por correo: ${error.message}`);
    }
  }

  /**
   * Obtener todos los usuarios con paginación
   * @param {number} page - Página actual
   * @param {number} limit - Límite por página
   * @param {string} search - Término de búsqueda
   * @returns {Promise<Object>} - Lista de usuarios
   */
  async obtenerTodosLosUsuarios(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT 
          idUsuario,
          nombre,
          apellido,
          correo,
          telefono,
          fechaRegistro
        FROM USUARIO
      `;
      
      let countQuery = 'SELECT COUNT(*) as total FROM USUARIO';
      let params = [];
      
      if (search) {
        const searchCondition = ` WHERE nombre LIKE ? OR apellido LIKE ? OR correo LIKE ?`;
        query += searchCondition;
        countQuery += searchCondition;
        const searchParam = `%${search}%`;
        params = [searchParam, searchParam, searchParam];
      }
      
      query += ` ORDER BY fechaRegistro DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      const [usuarios, totalResult] = await Promise.all([
        executeQuery(query, params),
        executeQuery(countQuery, search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [])
      ]);
      
      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: {
          usuarios,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        message: 'Usuarios obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerTodosLosUsuarios:', error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  /**
   * Actualizar información del usuario
   * @param {number} idUsuario - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async actualizarUsuario(idUsuario, updateData) {
    const { nombre, apellido, correo, telefono } = updateData;
    
    try {
      // Verificar que el usuario existe
      const usuarioExiste = await this.obtenerUsuarioPorId(idUsuario);
      if (!usuarioExiste.success) {
        return usuarioExiste;
      }
      
      // Verificar si el nuevo correo ya existe (si se está cambiando)
      if (correo && correo !== usuarioExiste.data.correo) {
        const existeCorreo = await this.verificarCorreoExistente(correo);
        if (existeCorreo) {
          return {
            success: false,
            message: 'El correo electrónico ya está registrado'
          };
        }
      }
      
      // Verificar si el nuevo teléfono ya existe (si se está cambiando)
      if (telefono && telefono !== usuarioExiste.data.telefono) {
        const existeTelefono = await this.verificarTelefonoExistente(telefono);
        if (existeTelefono) {
          return {
            success: false,
            message: 'El número de teléfono ya está registrado'
          };
        }
      }
      
      // Actualizar usuario usando stored procedure
      await executeStoredProcedure('sp_actualizar_usuario', [
        idUsuario,
        nombre || usuarioExiste.data.nombre,
        apellido || usuarioExiste.data.apellido,
        correo || usuarioExiste.data.correo,
        telefono || usuarioExiste.data.telefono
      ]);
      
      // Obtener datos actualizados
      const usuarioActualizado = await this.obtenerUsuarioPorId(idUsuario);
      
      return {
        success: true,
        data: usuarioActualizado.data,
        message: 'Usuario actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error en actualizarUsuario:', error);
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async eliminarUsuario(idUsuario) {
    try {
      // Verificar que el usuario existe
      const usuarioExiste = await this.obtenerUsuarioPorId(idUsuario);
      if (!usuarioExiste.success) {
        return usuarioExiste;
      }
      
      // Verificar si el usuario tiene transacciones asociadas
      const tieneTransacciones = await this.verificarTransaccionesUsuario(idUsuario);
      if (tieneTransacciones) {
        return {
          success: false,
          message: 'No se puede eliminar el usuario porque tiene transacciones asociadas'
        };
      }
      
      // Eliminar usuario usando stored procedure
      await executeStoredProcedure('sp_eliminar_usuario', [idUsuario]);
      
      return {
        success: true,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminarUsuario:', error);
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Cambiar contraseña del usuario
   * @param {number} idUsuario - ID del usuario
   * @param {string} contraseñaActual - Contraseña actual
   * @param {string} nuevaContraseña - Nueva contraseña
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async cambiarContraseña(idUsuario, contraseñaActual, nuevaContraseña) {
    try {
      // Obtener usuario con contraseña
      const query = 'SELECT contraseña FROM USUARIO WHERE idUsuario = ?';
      const result = await executeQuery(query, [idUsuario]);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      // Verificar contraseña actual
      const contraseñaValida = await bcrypt.compare(contraseñaActual, result[0].contraseña);
      if (!contraseñaValida) {
        return {
          success: false,
          message: 'La contraseña actual es incorrecta'
        };
      }
      
      // Encriptar nueva contraseña
      const nuevaContraseñaEncriptada = await bcrypt.hash(nuevaContraseña, 10);
      
      // Actualizar contraseña
      const updateQuery = 'UPDATE USUARIO SET contraseña = ? WHERE idUsuario = ?';
      await executeQuery(updateQuery, [nuevaContraseñaEncriptada, idUsuario]);
      
      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error en cambiarContraseña:', error);
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas del usuario
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<Object>} - Estadísticas del usuario
   */
  async obtenerEstadisticasUsuario(idUsuario) {
    try {
      const estadisticasQuery = `
        SELECT 
          u.nombre,
          u.apellido,
          u.fechaRegistro,
          COALESCE(SUM(i.montoIngreso), 0) as totalIngresos,
          COALESCE(SUM(g.montoGasto), 0) as totalGastos,
          COUNT(DISTINCT i.idIngreso) as cantidadIngresos,
          COUNT(DISTINCT g.idGasto) as cantidadGastos
        FROM USUARIO u
        LEFT JOIN INGRESO i ON u.idUsuario = i.idUsuario
        LEFT JOIN GASTO g ON u.idUsuario = g.idUsuario
        WHERE u.idUsuario = ?
        GROUP BY u.idUsuario
      `;
      
      const result = await executeQuery(estadisticasQuery, [idUsuario]);
      
      if (result.length === 0) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }
      
      const estadisticas = result[0];
      const balance = parseFloat(estadisticas.totalIngresos) - parseFloat(estadisticas.totalGastos);
      
      return {
        success: true,
        data: {
          usuario: {
            nombre: estadisticas.nombre,
            apellido: estadisticas.apellido,
            fechaRegistro: estadisticas.fechaRegistro
          },
          estadisticas: {
            totalIngresos: parseFloat(estadisticas.totalIngresos),
            totalGastos: parseFloat(estadisticas.totalGastos),
            balance: balance,
            cantidadIngresos: estadisticas.cantidadIngresos,
            cantidadGastos: estadisticas.cantidadGastos,
            totalTransacciones: estadisticas.cantidadIngresos + estadisticas.cantidadGastos
          }
        },
        message: 'Estadísticas obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticasUsuario:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Métodos auxiliares
  
  /**
   * Verificar si un correo ya existe
   * @param {string} correo - Correo a verificar
   * @returns {Promise<boolean>} - True si existe
   */
  async verificarCorreoExistente(correo) {
    try {
      const query = 'SELECT COUNT(*) as count FROM USUARIO WHERE correo = ?';
      const result = await executeQuery(query, [correo]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en verificarCorreoExistente:', error);
      throw error;
    }
  }

  /**
   * Verificar si un teléfono ya existe
   * @param {string} telefono - Teléfono a verificar
   * @returns {Promise<boolean>} - True si existe
   */
  async verificarTelefonoExistente(telefono) {
    try {
      const query = 'SELECT COUNT(*) as count FROM USUARIO WHERE telefono = ?';
      const result = await executeQuery(query, [telefono]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error en verificarTelefonoExistente:', error);
      throw error;
    }
  }

  /**
   * Verificar si un usuario tiene transacciones asociadas
   * @param {number} idUsuario - ID del usuario
   * @returns {Promise<boolean>} - True si tiene transacciones
   */
  async verificarTransaccionesUsuario(idUsuario) {
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM INGRESO WHERE idUsuario = ?) +
          (SELECT COUNT(*) FROM GASTO WHERE idUsuario = ?) as totalTransacciones
      `;
      const result = await executeQuery(query, [idUsuario, idUsuario]);
      return result[0].totalTransacciones > 0;
    } catch (error) {
      console.error('Error en verificarTransaccionesUsuario:', error);
      throw error;
    }
  }
}

module.exports = new UsuarioService();