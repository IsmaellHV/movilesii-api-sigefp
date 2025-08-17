const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_financiera',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para obtener una conexión
const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('🔗 Nueva conexión establecida con MySQL');
    return connection;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    throw error;
  }
};

// Función para ejecutar queries
const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Error ejecutando query:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Función para ejecutar stored procedures
const executeStoredProcedure = async (procedureName, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const placeholders = params.map(() => '?').join(', ');
    const query = `CALL ${procedureName}(${placeholders})`;
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error(`❌ Error ejecutando stored procedure ${procedureName}:`, error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Función para iniciar transacción
const beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

// Función para confirmar transacción
const commitTransaction = async (connection) => {
  await connection.commit();
  connection.release();
};

// Función para revertir transacción
const rollbackTransaction = async (connection) => {
  await connection.rollback();
  connection.release();
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión a MySQL verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al verificar conexión a MySQL:', error.message);
    throw error;
  }
};

// Cerrar pool de conexiones
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error cerrando pool de conexiones:', error.message);
  }
};

module.exports = {
  pool,
  getConnection,
  executeQuery,
  executeStoredProcedure,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  testConnection,
  closePool
};