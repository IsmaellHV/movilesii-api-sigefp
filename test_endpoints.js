#!/usr/bin/env node

/**
 * Script de pruebas para todos los endpoints de la API
 * Verifica que todos los endpoints funcionen correctamente sin autenticación
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/sigefp';
const TEST_USER_ID = 1; // ID de usuario para pruebas

// Configuración de axios
axios.defaults.timeout = 10000;

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : 'red';
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  log(`${statusIcon} ${testName}: ${status}`, statusColor);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

function logSection(sectionName) {
  log(`\n${'='.repeat(50)}`, 'blue');
  log(`${sectionName}`, 'bold');
  log(`${'='.repeat(50)}`, 'blue');
}

// Función para realizar peticiones HTTP
async function makeRequest(method, url, data = null, params = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      params,
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
      config.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data || error.message
    };
  }
}

// Pruebas de endpoints de usuarios
async function testUsuariosEndpoints() {
  logSection('PRUEBAS DE ENDPOINTS DE USUARIOS');
  
  // GET /usuarios - Listar usuarios
  const listUsers = await makeRequest('GET', '/usuarios');
  if (listUsers.success && listUsers.status === 200) {
    logTest('GET /usuarios', 'PASS', `Retornó ${listUsers.data.data?.length || 0} usuarios`);
  } else {
    logTest('GET /usuarios', 'FAIL', `Status: ${listUsers.status}, Error: ${JSON.stringify(listUsers.error)}`);
  }
  
  // GET /usuarios con paginación
  const listUsersWithPagination = await makeRequest('GET', '/usuarios', null, { page: 1, limit: 5 });
  if (listUsersWithPagination.success && listUsersWithPagination.status === 200) {
    logTest('GET /usuarios (paginación)', 'PASS', `Página 1, límite 5`);
  } else {
    logTest('GET /usuarios (paginación)', 'FAIL', `Status: ${listUsersWithPagination.status}`);
  }
  
  // GET /usuarios/:id - Obtener usuario específico
  const getUser = await makeRequest('GET', `/usuarios/${TEST_USER_ID}`);
  if (getUser.success && getUser.status === 200) {
    logTest(`GET /usuarios/${TEST_USER_ID}`, 'PASS', `Usuario obtenido: ${getUser.data.data?.nombre || 'N/A'}`);
  } else {
    logTest(`GET /usuarios/${TEST_USER_ID}`, 'FAIL', `Status: ${getUser.status}`);
  }
  
  // POST /usuarios - Crear usuario (datos de prueba)
  const newUser = {
    nombre: 'Usuario Test',
    email: `test_${Date.now()}@test.com`,
    password: 'password123',
    telefono: '123456789'
  };
  
  const createUser = await makeRequest('POST', '/usuarios', newUser);
  if (createUser.success && createUser.status === 201) {
    logTest('POST /usuarios', 'PASS', `Usuario creado con ID: ${createUser.data.data?.id || 'N/A'}`);
    
    // Guardar ID para pruebas posteriores
    if (createUser.data.data?.id) {
      global.createdUserId = createUser.data.data.id;
    }
  } else {
    logTest('POST /usuarios', 'FAIL', `Status: ${createUser.status}, Error: ${JSON.stringify(createUser.error)}`);
  }
}

// Pruebas de endpoints de tipos
async function testTiposEndpoints() {
  logSection('PRUEBAS DE ENDPOINTS DE TIPOS');
  
  // GET /tipos - Listar tipos
  const listTypes = await makeRequest('GET', '/tipos');
  if (listTypes.success && listTypes.status === 200) {
    logTest('GET /tipos', 'PASS', `Retornó ${listTypes.data.data?.length || 0} tipos`);
  } else {
    logTest('GET /tipos', 'FAIL', `Status: ${listTypes.status}`);
  }
  
  // GET /tipos/:id - Obtener tipo específico
  const getType = await makeRequest('GET', '/tipos/1');
  if (getType.success && getType.status === 200) {
    logTest('GET /tipos/1', 'PASS', `Tipo obtenido: ${getType.data.data?.nombre || 'N/A'}`);
  } else {
    logTest('GET /tipos/1', 'FAIL', `Status: ${getType.status}`);
  }
}

// Pruebas de endpoints de balance
async function testBalanceEndpoints() {
  logSection('PRUEBAS DE ENDPOINTS DE BALANCE');
  
  // GET /balance/:userId - Obtener balance del usuario
  const getBalance = await makeRequest('GET', `/balance/${TEST_USER_ID}`);
  if (getBalance.success && getBalance.status === 200) {
    logTest(`GET /balance/${TEST_USER_ID}`, 'PASS', `Balance obtenido`);
  } else {
    logTest(`GET /balance/${TEST_USER_ID}`, 'FAIL', `Status: ${getBalance.status}`);
  }
  
  // GET /balance/:userId con filtros de fecha
  const getBalanceWithFilters = await makeRequest('GET', `/balance/${TEST_USER_ID}`, null, {
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31'
  });
  if (getBalanceWithFilters.success && getBalanceWithFilters.status === 200) {
    logTest(`GET /balance/${TEST_USER_ID} (con filtros)`, 'PASS', `Balance con filtros de fecha`);
  } else {
    logTest(`GET /balance/${TEST_USER_ID} (con filtros)`, 'FAIL', `Status: ${getBalanceWithFilters.status}`);
  }
}

// Pruebas de endpoints de gastos
async function testGastosEndpoints() {
  logSection('PRUEBAS DE ENDPOINTS DE GASTOS');
  
  // GET /gastos/:userId - Listar gastos del usuario
  const listGastos = await makeRequest('GET', `/gastos/${TEST_USER_ID}`);
  if (listGastos.success && listGastos.status === 200) {
    logTest(`GET /gastos/${TEST_USER_ID}`, 'PASS', `Retornó ${listGastos.data.data?.length || 0} gastos`);
  } else {
    logTest(`GET /gastos/${TEST_USER_ID}`, 'FAIL', `Status: ${listGastos.status}`);
  }
  
  // GET /gastos/:userId con paginación
  const listGastosWithPagination = await makeRequest('GET', `/gastos/${TEST_USER_ID}`, null, {
    page: 1,
    limit: 5
  });
  if (listGastosWithPagination.success && listGastosWithPagination.status === 200) {
    logTest(`GET /gastos/${TEST_USER_ID} (paginación)`, 'PASS', `Página 1, límite 5`);
  } else {
    logTest(`GET /gastos/${TEST_USER_ID} (paginación)`, 'FAIL', `Status: ${listGastosWithPagination.status}`);
  }
  
  // GET /gastos/:userId/resumen/estadisticas - Estadísticas de gastos
  const getGastosStats = await makeRequest('GET', `/gastos/${TEST_USER_ID}/resumen/estadisticas`);
  if (getGastosStats.success && getGastosStats.status === 200) {
    logTest(`GET /gastos/${TEST_USER_ID}/resumen/estadisticas`, 'PASS', `Estadísticas obtenidas`);
  } else {
    logTest(`GET /gastos/${TEST_USER_ID}/resumen/estadisticas`, 'FAIL', `Status: ${getGastosStats.status}`);
  }
  
  // POST /gastos/:userId - Crear gasto
  const newGasto = {
    descripcionGasto: 'Gasto de prueba',
    montoGasto: 100.50,
    fechaGasto: '2024-01-15',
    idTipo: 1,
    idMetodoPago: 1
  };
  
  const createGasto = await makeRequest('POST', `/gastos/${TEST_USER_ID}`, newGasto);
  if (createGasto.success && createGasto.status === 201) {
    logTest(`POST /gastos/${TEST_USER_ID}`, 'PASS', `Gasto creado con ID: ${createGasto.data.data?.id || 'N/A'}`);
    
    if (createGasto.data.data?.id) {
      global.createdGastoId = createGasto.data.data.id;
    }
  } else {
    logTest(`POST /gastos/${TEST_USER_ID}`, 'FAIL', `Status: ${createGasto.status}, Error: ${JSON.stringify(createGasto.error)}`);
  }
}

// Pruebas de endpoints de ingresos
async function testIngresosEndpoints() {
  logSection('PRUEBAS DE ENDPOINTS DE INGRESOS');
  
  // GET /ingresos/:userId - Listar ingresos del usuario
  const listIngresos = await makeRequest('GET', `/ingresos/${TEST_USER_ID}`);
  if (listIngresos.success && listIngresos.status === 200) {
    logTest(`GET /ingresos/${TEST_USER_ID}`, 'PASS', `Retornó ${listIngresos.data.data?.length || 0} ingresos`);
  } else {
    logTest(`GET /ingresos/${TEST_USER_ID}`, 'FAIL', `Status: ${listIngresos.status}`);
  }
  
  // GET /ingresos/:userId con paginación
  const listIngresosWithPagination = await makeRequest('GET', `/ingresos/${TEST_USER_ID}`, null, {
    page: 1,
    limit: 5
  });
  if (listIngresosWithPagination.success && listIngresosWithPagination.status === 200) {
    logTest(`GET /ingresos/${TEST_USER_ID} (paginación)`, 'PASS', `Página 1, límite 5`);
  } else {
    logTest(`GET /ingresos/${TEST_USER_ID} (paginación)`, 'FAIL', `Status: ${listIngresosWithPagination.status}`);
  }
  
  // GET /ingresos/:userId/resumen/estadisticas - Estadísticas de ingresos
  const getIngresosStats = await makeRequest('GET', `/ingresos/${TEST_USER_ID}/resumen/estadisticas`);
  if (getIngresosStats.success && getIngresosStats.status === 200) {
    logTest(`GET /ingresos/${TEST_USER_ID}/resumen/estadisticas`, 'PASS', `Estadísticas obtenidas`);
  } else {
    logTest(`GET /ingresos/${TEST_USER_ID}/resumen/estadisticas`, 'FAIL', `Status: ${getIngresosStats.status}`);
  }
  
  // POST /ingresos/:userId - Crear ingreso
  const newIngreso = {
    descripcionIngreso: 'Ingreso de prueba',
    montoIngreso: 500.00,
    fechaIngreso: '2024-01-15',
    idTipo: 1
  };
  
  const createIngreso = await makeRequest('POST', `/ingresos/${TEST_USER_ID}`, newIngreso);
  if (createIngreso.success && createIngreso.status === 201) {
    logTest(`POST /ingresos/${TEST_USER_ID}`, 'PASS', `Ingreso creado con ID: ${createIngreso.data.data?.id || 'N/A'}`);
    
    if (createIngreso.data.data?.id) {
      global.createdIngresoId = createIngreso.data.data.id;
    }
  } else {
    logTest(`POST /ingresos/${TEST_USER_ID}`, 'FAIL', `Status: ${createIngreso.status}, Error: ${JSON.stringify(createIngreso.error)}`);
  }
}

// Pruebas de búsqueda y filtros
async function testSearchAndFilters() {
  logSection('PRUEBAS DE BÚSQUEDA Y FILTROS');
  
  // Búsqueda en usuarios
  const searchUsers = await makeRequest('GET', '/usuarios', null, { search: 'test' });
  if (searchUsers.success && searchUsers.status === 200) {
    logTest('GET /usuarios (búsqueda)', 'PASS', `Búsqueda por "test"`);
  } else {
    logTest('GET /usuarios (búsqueda)', 'FAIL', `Status: ${searchUsers.status}`);
  }
  
  // Filtros en gastos
  const filterGastos = await makeRequest('GET', `/gastos/${TEST_USER_ID}`, null, {
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    tipo_id: 1
  });
  if (filterGastos.success && filterGastos.status === 200) {
    logTest(`GET /gastos/${TEST_USER_ID} (filtros)`, 'PASS', `Filtros de fecha y tipo`);
  } else {
    logTest(`GET /gastos/${TEST_USER_ID} (filtros)`, 'FAIL', `Status: ${filterGastos.status}`);
  }
  
  // Filtros en ingresos
  const filterIngresos = await makeRequest('GET', `/ingresos/${TEST_USER_ID}`, null, {
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31',
    tipo_id: 1
  });
  if (filterIngresos.success && filterIngresos.status === 200) {
    logTest(`GET /ingresos/${TEST_USER_ID} (filtros)`, 'PASS', `Filtros de fecha y tipo`);
  } else {
    logTest(`GET /ingresos/${TEST_USER_ID} (filtros)`, 'FAIL', `Status: ${filterIngresos.status}`);
  }
}

// Prueba de salud del servidor
async function testHealthEndpoint() {
  logSection('PRUEBA DE SALUD DEL SERVIDOR');
  
  const health = await makeRequest('GET', '/../health');
  if (health.success && health.status === 200) {
    logTest('GET /health', 'PASS', `Servidor funcionando correctamente`);
  } else {
    logTest('GET /health', 'FAIL', `Status: ${health.status}`);
  }
}

// Función principal
async function runAllTests() {
  log('\n🧪 INICIANDO PRUEBAS COMPLETAS DE LA API', 'bold');
  log(`🌐 Base URL: ${BASE_URL}`, 'blue');
  log(`👤 Usuario de prueba: ${TEST_USER_ID}`, 'blue');
  
  try {
    await testHealthEndpoint();
    await testUsuariosEndpoints();
    await testTiposEndpoints();
    await testBalanceEndpoints();
    await testGastosEndpoints();
    await testIngresosEndpoints();
    await testSearchAndFilters();
    
    logSection('RESUMEN DE PRUEBAS');
    log('✅ Todas las pruebas han sido ejecutadas', 'green');
    log('📊 Revisa los resultados arriba para ver el estado de cada endpoint', 'yellow');
    log('\n🎉 Pruebas completadas exitosamente!', 'bold');
    
  } catch (error) {
    log(`\n❌ Error durante las pruebas: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testUsuariosEndpoints,
  testTiposEndpoints,
  testBalanceEndpoints,
  testGastosEndpoints,
  testIngresosEndpoints,
  testSearchAndFilters,
  testHealthEndpoint
};