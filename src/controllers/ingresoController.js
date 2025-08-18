const { executeStoredProcedure, executeQuery } = require('../config/database');

// Insertar un nuevo ingreso usando stored procedure
const createIngreso = async (req, res) => {
  try {
    const { descripcionIngreso, montoIngreso, fechaIngreso, idTipo } = req.body;
    const idUsuario = req.user.id;

    // Verificar que el tipo existe y es de categoría 'Ingreso'
    const tipo = await executeQuery(
      `SELECT idTipo, categoria FROM TIPO WHERE idTipo = ${idTipo}`
    );

    if (tipo.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no existe'
      });
    }

    if (tipo[0].categoria !== 'Ingreso') {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no es válido para ingresos'
      });
    }

    // Ejecutar stored procedure para insertar ingreso
    await executeStoredProcedure('InsertarIngreso', [
      descripcionIngreso,
      montoIngreso,
      fechaIngreso,
      idUsuario,
      idTipo
    ]);

    // Obtener el ingreso recién creado
    const nuevoIngreso = await executeQuery(
      `SELECT i.idIngreso, i.descripcionIngreso, i.montoIngreso, 
              DATE_FORMAT(i.fechaIngreso, '%Y-%m-%d') as fechaIngreso,
              i.idUsuario, i.idTipo, t.nombreTipo
       FROM INGRESO i 
       INNER JOIN TIPO t ON i.idTipo = t.idTipo 
       WHERE i.idUsuario = ${idUsuario} 
       ORDER BY i.idIngreso DESC 
       LIMIT 1`
    );

    res.status(201).json({
      success: true,
      message: 'Ingreso creado exitosamente',
      data: nuevoIngreso[0]
    });
  } catch (error) {
    console.error('Error creando ingreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Listar ingresos del usuario usando stored procedure
const getIngresosByUser = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { page = 1, limit = 10, fechaInicio, fechaFin, idTipo } = req.query;

    // Ejecutar stored procedure para listar ingresos
    const ingresos = await executeStoredProcedure('ListarIngresosPorUsuario', [idUsuario]);

    let filteredIngresos = ingresos;

    // Aplicar filtros adicionales si se proporcionan
    if (fechaInicio) {
      filteredIngresos = filteredIngresos.filter(ingreso => 
        new Date(ingreso.fechaIngreso) >= new Date(fechaInicio)
      );
    }

    if (fechaFin) {
      filteredIngresos = filteredIngresos.filter(ingreso => 
        new Date(ingreso.fechaIngreso) <= new Date(fechaFin)
      );
    }

    if (idTipo) {
      filteredIngresos = filteredIngresos.filter(ingreso => 
        ingreso.idTipo == idTipo
      );
    }

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIngresos = filteredIngresos.slice(startIndex, endIndex);

    // Calcular total de páginas
    const totalPages = Math.ceil(filteredIngresos.length / limit);

    res.json({
      success: true,
      data: {
        ingresos: paginatedIngresos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: filteredIngresos.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un ingreso específico por ID
const getIngresoById = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id;

    const ingreso = await executeQuery(
      `SELECT i.idIngreso, i.descripcionIngreso, i.montoIngreso, 
              DATE_FORMAT(i.fechaIngreso, '%Y-%m-%d') as fechaIngreso,
              i.idUsuario, i.idTipo, t.nombreTipo
       FROM INGRESO i 
       INNER JOIN TIPO t ON i.idTipo = t.idTipo 
       WHERE i.idIngreso = ${id} AND i.idUsuario = ${idUsuario}`
    );

    if (ingreso.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ingreso no encontrado'
      });
    }

    res.json({
      success: true,
      data: ingreso[0]
    });
  } catch (error) {
    console.error('Error obteniendo ingreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar un ingreso
const updateIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcionIngreso, montoIngreso, fechaIngreso, idTipo } = req.body;
    const idUsuario = req.user.id;

    // Verificar que el ingreso existe y pertenece al usuario
    const existingIngreso = await executeQuery(
      `SELECT idIngreso FROM INGRESO WHERE idIngreso = ${id} AND idUsuario = ${idUsuario}`
    );

    if (existingIngreso.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ingreso no encontrado'
      });
    }

    // Verificar que el tipo existe y es de categoría 'Ingreso'
    const tipo = await executeQuery(
      `SELECT idTipo, categoria FROM TIPO WHERE idTipo = ${idTipo}`
    );

    if (tipo.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no existe'
      });
    }

    if (tipo[0].categoria !== 'Ingreso') {
      return res.status(400).json({
        success: false,
        error: 'El tipo especificado no es válido para ingresos'
      });
    }

    // Actualizar el ingreso
    await executeQuery(
      `UPDATE INGRESO SET descripcionIngreso = '${descripcionIngreso}', montoIngreso = ${montoIngreso}, fechaIngreso = '${fechaIngreso}', idTipo = ${idTipo} WHERE idIngreso = ${id} AND idUsuario = ${idUsuario}`
    );

    // Obtener el ingreso actualizado
    const ingresoActualizado = await executeQuery(
      `SELECT i.idIngreso, i.descripcionIngreso, i.montoIngreso, 
              DATE_FORMAT(i.fechaIngreso, '%Y-%m-%d') as fechaIngreso,
              i.idUsuario, i.idTipo, t.nombreTipo
       FROM INGRESO i 
       INNER JOIN TIPO t ON i.idTipo = t.idTipo 
       WHERE i.idIngreso = ${id} AND i.idUsuario = ${idUsuario}`
    );

    res.json({
      success: true,
      message: 'Ingreso actualizado exitosamente',
      data: ingresoActualizado[0]
    });
  } catch (error) {
    console.error('Error actualizando ingreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar un ingreso usando stored procedure
const deleteIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.id;

    // Verificar que el ingreso existe y pertenece al usuario
    const existingIngreso = await executeQuery(
      `SELECT idIngreso FROM INGRESO WHERE idIngreso = ${id} AND idUsuario = ${idUsuario}`
    );

    if (existingIngreso.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ingreso no encontrado'
      });
    }

    // Ejecutar stored procedure para eliminar ingreso
    await executeStoredProcedure('EliminarIngreso', [id]);

    res.json({
      success: true,
      message: 'Ingreso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener resumen de ingresos del usuario
const getIngresosResumen = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT 
        COUNT(*) as totalIngresos,
        COALESCE(SUM(montoIngreso), 0) as montoTotal,
        COALESCE(AVG(montoIngreso), 0) as montoPromedio,
        COALESCE(MAX(montoIngreso), 0) as montoMaximo,
        COALESCE(MIN(montoIngreso), 0) as montoMinimo
      FROM INGRESO 
      WHERE idUsuario = ${idUsuario}
    `;

    if (fechaInicio) {
      query += ` AND fechaIngreso >= '${fechaInicio}'`;
    }

    if (fechaFin) {
      query += ` AND fechaIngreso <= '${fechaFin}'`;
    }

    const resumen = await executeQuery(query);

    res.json({
      success: true,
      data: resumen[0]
    });
  } catch (error) {
    console.error('Error obteniendo resumen de ingresos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createIngreso,
  getIngresosByUser,
  getIngresoById,
  updateIngreso,
  deleteIngreso,
  getIngresosResumen
};