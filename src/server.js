const app = require('./app');
const { testConnection, closePool } = require('./config/database');

// Configuración del puerto
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Variable para almacenar la instancia del servidor
let server;

/**
 * Función para iniciar el servidor
 */
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Verificar conexión a la base de datos
    console.log('📊 Verificando conexión a la base de datos...');
    await testConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Iniciar el servidor
    server = app.listen(PORT, HOST, () => {
      console.log('🎉 Servidor iniciado exitosamente');
      console.log(`📍 Servidor ejecutándose en: http://${HOST}:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Documentación: http://${HOST}:${PORT}/api/docs`);
      console.log(`❤️  Estado del servidor: http://${HOST}:${PORT}/health`);
      console.log('\n📋 Endpoints disponibles:');
      console.log(`   • Autenticación: http://${HOST}:${PORT}/api/auth`);
      console.log(`   • Usuarios: http://${HOST}:${PORT}/api/usuarios`);
      console.log(`   • Tipos: http://${HOST}:${PORT}/api/tipos`);
      console.log(`   • Ingresos: http://${HOST}:${PORT}/api/ingresos`);
      console.log(`   • Gastos: http://${HOST}:${PORT}/api/gastos`);
      console.log(`   • Balance: http://${HOST}:${PORT}/api/balance`);
      console.log('\n🛑 Para detener el servidor: Ctrl+C');
    });
    
    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('📋 Detalles del error:', error);
    
    // Verificar errores comunes
    if (error.code === 'EADDRINUSE') {
      console.error(`🚫 El puerto ${PORT} ya está en uso.`);
      console.error('💡 Soluciones:');
      console.error('   1. Cambiar el puerto en el archivo .env');
      console.error('   2. Detener el proceso que usa el puerto');
      console.error(`   3. Usar: lsof -ti:${PORT} | xargs kill -9`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 No se pudo conectar a la base de datos.');
      console.error('💡 Verificar:');
      console.error('   1. Que MySQL esté ejecutándose');
      console.error('   2. Las credenciales en el archivo .env');
      console.error('   3. Que la base de datos exista');
    }
    
    process.exit(1);
  }
}

/**
 * Función para cerrar el servidor gracefully
 */
async function stopServer() {
  console.log('\n🛑 Cerrando servidor...');
  
  try {
    // Cerrar el servidor HTTP
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('✅ Servidor HTTP cerrado');
          resolve();
        });
      });
    }
    
    // Cerrar conexiones de base de datos
    await closePool();
    console.log('✅ Conexiones de base de datos cerradas');
    
    console.log('👋 Servidor cerrado correctamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al cerrar el servidor:', error.message);
    process.exit(1);
  }
}

// Manejo de señales del sistema para cierre graceful
process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  stopServer();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada en:', promise);
  console.error('❌ Razón:', reason);
  stopServer();
});

// Iniciar el servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

// Exportar funciones para testing
module.exports = {
  startServer,
  stopServer,
  server: () => server
};