const { executeStoredProcedure, executeQuery } = require('../config/database');

// Insertar un nuevo gasto usando stored procedure
const createGasto = async (req, res) => {
  try {
    const { descripcionGasto, montoGasto, fechaGasto, idTipo, idMetodoPago } = req.body;
    const idUsuario = req.user.id;

    // Verificar que el tipo existe y es de categoría 'Gasto'
    const tipo = await executeQuery(
      `SELECT idTipo, categoria FROM TIPO WHERE idTipo = ${idTipo}`
    );

    if (tipo.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no existe'
      });
    }

    if (tipo[0].categoria !== 'Gasto') {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no es válido para gastos'
      });
    }

    // Verificar que el método de pago existe y es de categoría 'MetodoPago'
    const metodoPago = await executeQuery(
      `SELECT idTipo, categoria FROM TIPO WHERE idTipo = ${idMetodoPago}`
    );

    if (metodoPago.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El método de pago especificado no existe'
      });
    }

    if (metodoPago[0].categoria !== 'MetodoPago') {
      return res.status(400).json({
        success: false,
        error: 'El método de pago especificado no es válido'
      });
    }

    // Ejecutar stored procedure para insertar gasto
    await executeStoredProcedure('InsertarGasto', [
      descripcionGasto,
      montoGasto,
      fechaGasto,
      idUsuario,
      idTipo,
      idMetodoPago
    ]);

    // Obtener el gasto recién creado
    const nuevoGasto = await executeQuery(
      `SELECT g.idGasto, g.descripcionGasto, g.montoGasto, 
              DATE_FORMAT(g.fechaGasto, '%Y-%m-%d') as fechaGasto,
              g.idUsuario, g.idTipo, g.idMetodoPago,
              t.nombreTipo as tipoGasto, mp.nombreTipo as metodoPago
       FROM GASTO g 
       INNER JOIN TIPO t ON g.idTipo = t.idTipo 
       INNER JOIN TIPO mp ON g.idMetodoPago = mp.idTipo
       WHERE g.idUsuario = ${idUsuario} 
       ORDER BY g.idGasto DESC 
       LIMIT 1`
    );

    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: nuevoGasto[0]
    });
  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Listar gastos del usuario usando stored procedure
const getGastosByUser = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { page = 1, limit = 10, fechaInicio, fechaFin, idTipo, idMetodoPago } = req.query;

    // Ejecutar stored procedure para listar gastos por usuario
    const gastos = await executeStoredProcedure('ListarGastosPorUsuario', [idUsuario]);

    let filteredGastos = gastos;

    // Aplicar filtros adicionales si se proporcionan
    if (fechaInicio) {
      filteredGastos = filteredGastos.filter(gasto => 
        new Date(gasto.fechaGasto) >= new Date(fechaInicio)
      );
    }

    if (fechaFin) {
      filteredGastos = filteredGastos.filter(gasto => 
        new Date(gasto.fechaGasto) <= new Date(fechaFin)
      );
    }

    if (idTipo) {
      filteredGastos = filteredGastos.filter(gasto => 
        gasto.idTipo == idTipo
      );
    }

    if (idMetodoPago) {
      filteredGastos = filteredGastos.filter(gasto => 
        gasto.idMetodoPago == idMetodoPago
      );
    }

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGastos = filteredGastos.slice(startIndex, endIndex);

    // Calcular total de páginas
    const totalPages = Math.ceil(filteredGastos.length / limit);

    res.json({
      success: true,
      data: {
        gastos: paginatedGastos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: filteredGastos.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Listar gastos por teléfono usando stored procedure
const getGastosByTelefono = async (req, res) => {
  try {
    const { telefono } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Ejecutar stored procedure para listar gastos por teléfono
    const gastos = await executeStoredProcedure('ListarGastosPorTelefono', [telefono]);

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGastos = gastos.slice(startIndex, endIndex);

    // Calcular total de páginas
    const totalPages = Math.ceil(gastos.length / limit);

    res.json({
      success: true,
      data: {
        gastos: paginatedGastos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: gastos.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo gastos por teléfono:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un gasto específico por ID
const getGastoById = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id;

    const gasto = await executeQuery(
      `SELECT g.idGasto, g.descripcionGasto, g.montoGasto, 
              DATE_FORMAT(g.fechaGasto, '%Y-%m-%d') as fechaGasto,
              g.idUsuario, g.idTipo, g.idMetodoPago,
              t.nombreTipo as tipoGasto, mp.nombreTipo as metodoPago
       FROM GASTO g 
       INNER JOIN TIPO t ON g.idTipo = t.idTipo 
       INNER JOIN TIPO mp ON g.idMetodoPago = mp.idTipo
       WHERE g.idGasto = ${id} AND g.idUsuario = ${idUsuario}`
    );

    if (gasto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Gasto no encontrado'
      });
    }

    res.json({
      success: true,
      data: gasto[0]
    });
  } catch (error) {
    console.error('Error obteniendo gasto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar un gasto
const updateGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcionGasto, montoGasto, fechaGasto, idTipo, idMetodoPago } = req.body;
    const idUsuario = req.user.id;

    // Verificar que el gasto existe y pertenece al usuario
    const existingGasto = await executeQuery(
      `SELECT idGasto FROM GASTO WHERE idGasto = ${id} AND idUsuario = ${idUsuario}`
    );

    if (existingGasto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Gasto no encontrado'
      });
    }

    // Verificar que el tipo existe y es de categoría 'Gasto'
    const tipo = await executeQuery(
      `SELECT idTipo, categoria FROM TIPO WHERE idTipo = ${idTipo}`
    );

    if (tipo.length === 0 || tipo[0].categoria !== 'Gasto') {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no es válido para gastos'
      });
    }

    // Verificar que el método de pago existe y es de categoría 'MetodoPago'
    const metodoPago = await executeQuery(
      `SELECT idTipo, categoria FROM TIPO WHERE idTipo = ${idMetodoPago}`
    );

    if (metodoPago.length === 0 || metodoPago[0].categoria !== 'MetodoPago') {
      return res.status(400).json({
        success: false,
        error: 'El método de pago especificado no es válido'
      });
    }

    // Actualizar el gasto
    await executeQuery(
      `UPDATE GASTO SET descripcionGasto = '${descripcionGasto}', montoGasto = ${montoGasto}, fechaGasto = '${fechaGasto}', idTipo = ${idTipo}, idMetodoPago = ${idMetodoPago} WHERE idGasto = ${id} AND idUsuario = ${idUsuario}`
    );

    // Obtener el gasto actualizado
    const gastoActualizado = await executeQuery(
      `SELECT g.idGasto, g.descripcionGasto, g.montoGasto, 
              DATE_FORMAT(g.fechaGasto, '%Y-%m-%d') as fechaGasto,
              g.idUsuario, g.idTipo, g.idMetodoPago,
              t.nombreTipo as tipoGasto, mp.nombreTipo as metodoPago
       FROM GASTO g 
       INNER JOIN TIPO t ON g.idTipo = t.idTipo 
       INNER JOIN TIPO mp ON g.idMetodoPago = mp.idTipo
       WHERE g.idGasto = ${id} AND g.idUsuario = ${idUsuario}`
    );

    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: gastoActualizado[0]
    });
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar un gasto usando stored procedure
const deleteGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id;

    // Verificar que el gasto existe y pertenece al usuario
    const existingGasto = await executeQuery(
      `SELECT idGasto FROM GASTO WHERE idGasto = ${id} AND idUsuario = ${idUsuario}`
    );

    if (existingGasto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Gasto no encontrado'
      });
    }

    // Ejecutar stored procedure para eliminar gasto
    await executeStoredProcedure('EliminarGasto', [id]);

    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener resumen de gastos del usuario
const getGastosResumen = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT 
        COUNT(*) as totalGastos,
        COALESCE(SUM(montoGasto), 0) as montoTotal,
        COALESCE(AVG(montoGasto), 0) as montoPromedio,
        COALESCE(MAX(montoGasto), 0) as montoMaximo,
        COALESCE(MIN(montoGasto), 0) as montoMinimo
      FROM GASTO 
      WHERE idUsuario = ${idUsuario}
    `;

    if (fechaInicio) {
      query += ` AND fechaGasto >= '${fechaInicio}'`;
    }

    if (fechaFin) {
      query += ` AND fechaGasto <= '${fechaFin}'`;
    }

    const resumen = await executeQuery(query);

    res.json({
      success: true,
      data: resumen[0]
    });
  } catch (error) {
    console.error('Error obteniendo resumen de gastos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createGasto,
  getGastosByUser,
  getGastosByTelefono,
  getGastoById,
  updateGasto,
  deleteGasto,
  getGastosResumen
};