const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar middlewares
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const tipoRoutes = require('./routes/tipos');
const ingresoRoutes = require('./routes/ingresos');
const gastoRoutes = require('./routes/gastos');
const balanceRoutes = require('./routes/balance');

// Crear aplicación Express
const app = express();

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    // Lista de dominios permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    // En desarrollo, permitir cualquier localhost
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors(corsOptions)); // CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser URL-encoded

// Middleware para agregar headers de seguridad adicionales
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de Gestión Financiera Personal',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      tipos: '/api/tipos',
      ingresos: '/api/ingresos',
      gastos: '/api/gastos',
      balance: '/api/balance'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/balance', balanceRoutes);

// Ruta para documentación básica de la API
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Documentación de la API',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      authentication: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        profile: 'GET /auth/profile',
        changePassword: 'PUT /auth/change-password'
      },
      usuarios: {
        getAll: 'GET /usuarios',
        getById: 'GET /usuarios/:id',
        update: 'PUT /usuarios/:id',
        delete: 'DELETE /usuarios/:id',
        statistics: 'GET /usuarios/:id/estadisticas'
      },
      tipos: {
        getAll: 'GET /tipos',
        getByCategory: 'GET /tipos/categoria/:categoria',
        getById: 'GET /tipos/:id',
        create: 'POST /tipos',
        update: 'PUT /tipos/:id',
        delete: 'DELETE /tipos/:id'
      },
      ingresos: {
        getAll: 'GET /ingresos',
        getById: 'GET /ingresos/:id',
        create: 'POST /ingresos',
        update: 'PUT /ingresos/:id',
        delete: 'DELETE /ingresos/:id',
        summary: 'GET /ingresos/resumen/estadisticas'
      },
      gastos: {
        getAll: 'GET /gastos',
        getByPhone: 'GET /gastos/telefono/:telefono',
        getById: 'GET /gastos/:id',
        create: 'POST /gastos',
        update: 'PUT /gastos/:id',
        delete: 'DELETE /gastos/:id',
        summary: 'GET /gastos/resumen/estadisticas'
      },
      balance: {
        getBalance: 'GET /balance',
        getSummary: 'GET /balance/resumen',
        getMonthlyStats: 'GET /balance/estadisticas/mensuales',
        getByPeriod: 'GET /balance/periodo'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      note: 'La mayoría de endpoints requieren autenticación'
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Manejo graceful del cierre del servidor
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

module.exports = app;