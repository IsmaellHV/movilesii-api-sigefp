const { executeQuery } = require('../config/database');

// Obtener todos los tipos
const getAllTipos = async (req, res) => {
  try {
    const tipos = await executeQuery(
      'SELECT idTipo, nombreTipo, categoria FROM TIPO ORDER BY categoria, nombreTipo'
    );

    res.json({
      success: true,
      data: tipos
    });
  } catch (error) {
    console.error('Error obteniendo tipos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener tipos por categoría
const getTiposByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;

    // Validar categoría
    const categoriasValidas = ['Ingreso', 'Gasto', 'MetodoPago'];
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        error: 'Categoría inválida. Debe ser: Ingreso, Gasto o MetodoPago'
      });
    }

    const tipos = await executeQuery(
      'SELECT idTipo, nombreTipo, categoria FROM TIPO WHERE categoria = ? ORDER BY nombreTipo',
      [categoria]
    );

    res.json({
      success: true,
      data: tipos
    });
  } catch (error) {
    console.error('Error obteniendo tipos por categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener un tipo por ID
const getTipoById = async (req, res) => {
  try {
    const { id } = req.params;

    const tipos = await executeQuery(
      'SELECT idTipo, nombreTipo, categoria FROM TIPO WHERE idTipo = ?',
      [id]
    );

    if (tipos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tipo no encontrado'
      });
    }

    res.json({
      success: true,
      data: tipos[0]
    });
  } catch (error) {
    console.error('Error obteniendo tipo por ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo tipo
const createTipo = async (req, res) => {
  try {
    const { nombreTipo, categoria } = req.body;

    // Verificar si ya existe un tipo con el mismo nombre en la misma categoría
    const existingTipo = await executeQuery(
      'SELECT idTipo FROM TIPO WHERE nombreTipo = ? AND categoria = ?',
      [nombreTipo, categoria]
    );

    if (existingTipo.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un tipo con ese nombre en la categoría especificada'
      });
    }

    const result = await executeQuery(
      'INSERT INTO TIPO (nombreTipo, categoria) VALUES (?, ?)',
      [nombreTipo, categoria]
    );

    const nuevoTipo = await executeQuery(
      'SELECT idTipo, nombreTipo, categoria FROM TIPO WHERE idTipo = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Tipo creado exitosamente',
      data: nuevoTipo[0]
    });
  } catch (error) {
    console.error('Error creando tipo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar un tipo
const updateTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreTipo, categoria } = req.body;

    // Verificar si el tipo existe
    const existingTipo = await executeQuery(
      'SELECT idTipo FROM TIPO WHERE idTipo = ?',
      [id]
    );

    if (existingTipo.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tipo no encontrado'
      });
    }

    // Verificar si ya existe otro tipo con el mismo nombre en la misma categoría
    const duplicateTipo = await executeQuery(
      'SELECT idTipo FROM TIPO WHERE nombreTipo = ? AND categoria = ? AND idTipo != ?',
      [nombreTipo, categoria, id]
    );

    if (duplicateTipo.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe otro tipo con ese nombre en la categoría especificada'
      });
    }

    await executeQuery(
      'UPDATE TIPO SET nombreTipo = ?, categoria = ? WHERE idTipo = ?',
      [nombreTipo, categoria, id]
    );

    const tipoActualizado = await executeQuery(
      'SELECT idTipo, nombreTipo, categoria FROM TIPO WHERE idTipo = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Tipo actualizado exitosamente',
      data: tipoActualizado[0]
    });
  } catch (error) {
    console.error('Error actualizando tipo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar un tipo
const deleteTipo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el tipo existe
    const existingTipo = await executeQuery(
      'SELECT idTipo FROM TIPO WHERE idTipo = ?',
      [id]
    );

    if (existingTipo.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tipo no encontrado'
      });
    }

    // Verificar si el tipo está siendo usado en ingresos o gastos
    const ingresoCount = await executeQuery(
      'SELECT COUNT(*) as count FROM INGRESO WHERE idTipo = ?',
      [id]
    );

    const gastoCount = await executeQuery(
      'SELECT COUNT(*) as count FROM GASTO WHERE idTipo = ? OR idMetodoPago = ?',
      [id, id]
    );

    if (ingresoCount[0].count > 0 || gastoCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar el tipo porque está siendo utilizado en ingresos o gastos'
      });
    }

    await executeQuery(`DELETE FROM TIPO WHERE idTipo = ${id}`);

    res.json({
      success: true,
      message: 'Tipo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando tipo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getAllTipos,
  getTiposByCategoria,
  getTipoById,
  createTipo,
  updateTipo,
  deleteTipo
};