const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

// Obtener todos los usuarios (solo para administradores)
const getAllUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = `
      SELECT 
        idUsuario, 
        nombreUsuario, 
        apellidoUsuario, 
        correoUsuario,
        DATE_FORMAT(fechaRegistro, '%Y-%m-%d %H:%i:%s') as fechaRegistro
      FROM USUARIO
    `;
    
    const params = [];

    if (search) {
      query += ` WHERE 
        nombreUsuario LIKE ? OR 
        apellidoUsuario LIKE ? OR 
        correoUsuario LIKE ?
      `;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY fechaRegistro DESC';

    // Obtener total de registros para paginación
    let countQuery = 'SELECT COUNT(*) as total FROM USUARIO';
    if (search) {
      countQuery += ` WHERE 
        nombreUsuario LIKE ? OR 
        apellidoUsuario LIKE ? OR 
        correoUsuario LIKE ?
      `;
    }

    const [usuarios, totalResult] = await Promise.all([
      executeQuery(query + ' LIMIT ? OFFSET ?', [...params, parseInt(limit), (page - 1) * limit]),
      executeQuery(countQuery, search ? params : [])
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        usuarios,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;

    // Solo permitir que los usuarios vean su propia información
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a esta información'
      });
    }

    const usuarios = await executeQuery(
      `SELECT 
        idUsuario, 
        nombreUsuario, 
        apellidoUsuario, 
        correoUsuario,
        DATE_FORMAT(fechaRegistro, '%Y-%m-%d %H:%i:%s') as fechaRegistro
       FROM USUARIO 
       WHERE idUsuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuarios[0]
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar información del usuario
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreUsuario, apellidoUsuario, correoUsuario } = req.body;
    const requestingUserId = req.user.id;

    // Solo permitir que los usuarios actualicen su propia información
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar esta información'
      });
    }

    // Verificar si el usuario existe
    const existingUser = await executeQuery(
      'SELECT idUsuario FROM USUARIO WHERE idUsuario = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si el nuevo correo ya está en uso por otro usuario
    const emailCheck = await executeQuery(
      'SELECT idUsuario FROM USUARIO WHERE correoUsuario = ? AND idUsuario != ?',
      [correoUsuario, id]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está en uso por otro usuario'
      });
    }

    // Actualizar la información del usuario
    await executeQuery(
      'UPDATE USUARIO SET nombreUsuario = ?, apellidoUsuario = ?, correoUsuario = ? WHERE idUsuario = ?',
      [nombreUsuario, apellidoUsuario, correoUsuario, id]
    );

    // Obtener la información actualizada
    const usuarioActualizado = await executeQuery(
      `SELECT 
        idUsuario, 
        nombreUsuario, 
        apellidoUsuario, 
        correoUsuario,
        DATE_FORMAT(fechaRegistro, '%Y-%m-%d %H:%i:%s') as fechaRegistro
       FROM USUARIO 
       WHERE idUsuario = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado[0]
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar cuenta de usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;

    // Solo permitir que los usuarios eliminen su propia cuenta
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar esta cuenta'
      });
    }

    // Verificar si el usuario existe
    const existingUser = await executeQuery(
      'SELECT idUsuario FROM USUARIO WHERE idUsuario = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si el usuario tiene transacciones asociadas
    const [ingresoCount, gastoCount] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM INGRESO WHERE idUsuario = ?', [id]),
      executeQuery('SELECT COUNT(*) as count FROM GASTO WHERE idUsuario = ?', [id])
    ]);

    if (ingresoCount[0].count > 0 || gastoCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar la cuenta porque tiene transacciones asociadas. Contacte al administrador.'
      });
    }

    // Eliminar el usuario
    await executeQuery('DELETE FROM USUARIO WHERE idUsuario = ?', [id]);

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas del usuario
const getUsuarioEstadisticas = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;

    // Solo permitir que los usuarios vean sus propias estadísticas
    if (parseInt(id) !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a esta información'
      });
    }

    // Obtener estadísticas básicas
    const [ingresoStats, gastoStats, fechaRegistro] = await Promise.all([
      executeQuery(`
        SELECT 
          COUNT(*) as totalIngresos,
          COALESCE(SUM(montoIngreso), 0) as montoTotalIngresos,
          COALESCE(AVG(montoIngreso), 0) as promedioIngresos
        FROM INGRESO 
        WHERE idUsuario = ?
      `, [id]),
      executeQuery(`
        SELECT 
          COUNT(*) as totalGastos,
          COALESCE(SUM(montoGasto), 0) as montoTotalGastos,
          COALESCE(AVG(montoGasto), 0) as promedioGastos
        FROM GASTO 
        WHERE idUsuario = ?
      `, [id]),
      executeQuery(`
        SELECT 
          DATE_FORMAT(fechaRegistro, '%Y-%m-%d') as fechaRegistro,
          DATEDIFF(CURDATE(), fechaRegistro) as diasRegistrado
        FROM USUARIO 
        WHERE idUsuario = ?
      `, [id])
    ]);

    const estadisticas = {
      ingresos: ingresoStats[0],
      gastos: gastoStats[0],
      balance: parseFloat(ingresoStats[0].montoTotalIngresos) - parseFloat(gastoStats[0].montoTotalGastos),
      usuario: fechaRegistro[0]
    };

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  getUsuarioEstadisticas
};