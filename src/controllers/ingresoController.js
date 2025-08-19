const { executeStoredProcedure, executeQuery } = require('../config/database');

// Insertar un nuevo ingreso usando stored procedure
const createIngreso = async (req, res) => {
  try {
    const { descripcion, monto, fecha, idTipo } = req.body;
    const idUsuario = req.params.userId; // TEMPORAL: Usando parámetro de URL para pruebas

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
      idUsuario,
      montoIngreso,
      descripcionIngreso,
      fechaIngreso,
      idTipo
    ]);

    // Obtener el ingreso recién creado
    const nuevoIngreso = await executeQuery(
      `SELECT i.idIngreso, i.descripcion, i.monto, 
              DATE_FORMAT(i.fecha, '%Y-%m-%d') as fecha,
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

// Listar ingresos del usuario
const getIngresosByUser = async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.userId);
    const { page = 1, limit = 10, fechaInicio, fechaFin, idTipo } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Construir la consulta base
    let whereConditions = [`i.idUsuario = ${idUsuario}`];
    
    if (fechaInicio) {
      whereConditions.push(`i.fecha >= '${fechaInicio}'`);
    }
    
    if (fechaFin) {
      whereConditions.push(`i.fecha <= '${fechaFin}'`);
    }
    
    if (idTipo) {
      whereConditions.push(`i.idTipo = ${parseInt(idTipo)}`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Consulta para obtener el total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM INGRESO i 
      WHERE ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limitNum);

    // Consulta para obtener los datos paginados
    const dataQuery = `
      SELECT 
        i.idIngreso,
        i.descripcion,
        i.monto,
        DATE_FORMAT(i.fecha, '%Y-%m-%d') as fecha,
        i.idUsuario,
        i.idTipo,
        t.nombreTipo
      FROM INGRESO i
      LEFT JOIN TIPO t ON i.idTipo = t.idTipo
      WHERE ${whereClause}
      ORDER BY i.fecha DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const ingresos = await executeQuery(dataQuery);

    res.json({
      success: true,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum
      },
      data: ingresos
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
    const idUsuario = req.params.userId; // TEMPORAL: Usando parámetro de URL para pruebas

    const ingreso = await executeQuery(
      `SELECT i.idIngreso, i.descripcion, i.monto, 
              DATE_FORMAT(i.fecha, '%Y-%m-%d') as fecha,
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
    const { descripcion, monto, fecha, idTipo } = req.body;
    const idUsuario = req.params.userId; // TEMPORAL: Usando parámetro de URL para pruebas

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
      `UPDATE INGRESO SET descripcion = '${descripcion}', monto = ${monto}, fecha = '${fecha}', idTipo = ${idTipo} WHERE idIngreso = ${id} AND idUsuario = ${idUsuario}`
    );

    // Obtener el ingreso actualizado
    const ingresoActualizado = await executeQuery(
      `SELECT i.idIngreso, i.descripcion, i.monto, 
              DATE_FORMAT(i.fecha, '%Y-%m-%d') as fecha,
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
    const idUsuario = req.params.userId; // TEMPORAL: Usando parámetro de URL para pruebas

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
    await executeStoredProcedure('EliminarIngreso', [id, idUsuario]);

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
    const idUsuario = req.params.userId; // TEMPORAL: Usando parámetro de URL para pruebas
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT 
        COUNT(*) as totalIngresos,
        COALESCE(SUM(monto), 0) as montoTotal,
        COALESCE(AVG(monto), 0) as montoPromedio,
        COALESCE(MAX(monto), 0) as montoMaximo,
        COALESCE(MIN(monto), 0) as montoMinimo
      FROM INGRESO 
      WHERE idUsuario = ${idUsuario}
    `;

    if (fechaInicio) {
      query += ` AND fecha >= '${fechaInicio}'`;
    }

    if (fechaFin) {
      query += ` AND fecha <= '${fechaFin}'`;
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