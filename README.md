# 💰 API de Gestión Financiera Personal

## 📋 Descripción

API REST desarrollada con Node.js y Express.js para la gestión financiera personal. Permite a los usuarios registrar ingresos, gastos, categorizar transacciones y obtener reportes financieros detallados.

## 🏗️ Arquitectura del Sistema

### Base de Datos
- **Motor**: MySQL 8+
- **Tablas principales**: USUARIO, TIPO, INGRESO, GASTO
- **Stored Procedures**: Para operaciones CRUD optimizadas
- **Relaciones**: Claves foráneas para integridad referencial

### Backend
- **Framework**: Express.js 4
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Express Validator
- **Seguridad**: bcryptjs, helmet, cors
- **Logging**: Morgan

## 🚀 Características

- ✅ **Autenticación JWT** - Registro y login seguro
- ✅ **Gestión de Usuarios** - CRUD completo
- ✅ **Categorización** - Tipos de ingresos y gastos
- ✅ **Registro de Transacciones** - Ingresos y gastos
- ✅ **Reportes Financieros** - Balance y estadísticas
- ✅ **Validaciones** - Datos de entrada validados
- ✅ **Manejo de Errores** - Respuestas consistentes
- ✅ **Documentación** - API bien documentada

## 📁 Estructura del Proyecto

```
api-proyecto2025/
├── src/
│   ├── controllers/        # Controladores de la API
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── tipoController.js
│   │   ├── ingresoController.js
│   │   ├── gastoController.js
│   │   └── balanceController.js
│   ├── middleware/         # Middlewares personalizados
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── routes/            # Definición de rutas
│   │   ├── auth.js
│   │   ├── usuarios.js
│   │   ├── tipos.js
│   │   ├── ingresos.js
│   │   ├── gastos.js
│   │   └── balance.js
│   ├── services/          # Lógica de negocio
│   │   ├── usuarioService.js
│   │   ├── tipoService.js
│   │   ├── ingresoService.js
│   │   ├── gastoService.js
│   │   └── balanceService.js
│   ├── config/            # Configuraciones
│   │   └── database.js
│   ├── utils/             # Utilidades
│   │   └── logger.js
│   ├── app.js             # Configuración de Express
│   └── server.js          # Punto de entrada
├── db/
│   ├── query.sql          # Estructura de base de datos
│   └── test-data.sql      # Datos de prueba
├── .env.example           # Variables de entorno ejemplo
├── package.json           # Dependencias del proyecto
└── README.md             # Documentación
```

## 🛠️ Instalación

### Prerrequisitos

- Node.js 18+ 
- MySQL 8+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd api-proyecto2025
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```bash
# Crear base de datos en MySQL
mysql -u root -p
CREATE DATABASE gestion_financiera;
USE gestion_financiera;

# Ejecutar script de estructura
source db/query.sql;

# Cargar datos de prueba (opcional)
source db/test-data.sql;
```

4. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## ⚙️ Configuración

### Variables de Entorno Principales

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gestion_financiera
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Seguridad
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:3000
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:3000/api
```

### Autenticación

La API utiliza JWT para autenticación. Incluir el token en el header:
```
Authorization: Bearer <token>
```

### Endpoints Principales

#### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/change-password` | Cambiar contraseña |

#### 👥 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuarios` | Listar usuarios |
| GET | `/usuarios/:id` | Obtener usuario |
| PUT | `/usuarios/:id` | Actualizar usuario |
| DELETE | `/usuarios/:id` | Eliminar usuario |
| GET | `/usuarios/:id/estadisticas` | Estadísticas del usuario |

#### 🏷️ Tipos/Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tipos` | Listar todos los tipos |
| GET | `/tipos/categoria/:categoria` | Tipos por categoría |
| GET | `/tipos/:id` | Obtener tipo por ID |
| POST | `/tipos` | Crear nuevo tipo |
| PUT | `/tipos/:id` | Actualizar tipo |
| DELETE | `/tipos/:id` | Eliminar tipo |

#### 💰 Ingresos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/ingresos` | Listar ingresos |
| GET | `/ingresos/:id` | Obtener ingreso |
| POST | `/ingresos` | Crear ingreso |
| PUT | `/ingresos/:id` | Actualizar ingreso |
| DELETE | `/ingresos/:id` | Eliminar ingreso |
| GET | `/ingresos/resumen/estadisticas` | Estadísticas de ingresos |

#### 💸 Gastos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/gastos` | Listar gastos |
| GET | `/gastos/:id` | Obtener gasto |
| POST | `/gastos` | Crear gasto |
| PUT | `/gastos/:id` | Actualizar gasto |
| DELETE | `/gastos/:id` | Eliminar gasto |
| GET | `/gastos/telefono/:telefono` | Gastos por teléfono |
| GET | `/gastos/resumen/estadisticas` | Estadísticas de gastos |

#### 📊 Balance

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/balance` | Balance general |
| GET | `/balance/resumen` | Resumen financiero |
| GET | `/balance/estadisticas/mensuales` | Estadísticas mensuales |
| GET | `/balance/periodo` | Balance por período |

### Ejemplos de Uso

#### Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan@email.com",
    "telefono": "987654321",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@email.com",
    "password": "password123"
  }'
```

#### Crear Ingreso
```bash
curl -X POST http://localhost:3000/api/ingresos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "monto": 1500.00,
    "descripcion": "Salario mensual",
    "fecha": "2024-01-15",
    "tipo_id": 1
  }'
```

#### Crear Gasto
```bash
curl -X POST http://localhost:3000/api/gastos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "monto": 50.00,
    "descripcion": "Almuerzo",
    "fecha": "2024-01-15",
    "tipo_id": 5,
    "metodo_pago_id": 8
  }'
```

#### Obtener Balance
```bash
curl -X GET http://localhost:3000/api/balance \
  -H "Authorization: Bearer <token>"
```

### Respuestas de la API

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@email.com"
  },
  "message": "Usuario obtenido exitosamente"
}
```

#### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "correo",
        "message": "El correo debe ser válido"
      }
    ]
  }
}
```

## 🧪 Testing

### Datos de Prueba

El archivo `db/test-data.sql` contiene datos de prueba que incluyen:

- **Usuarios**: 3 usuarios de ejemplo
- **Tipos**: Categorías de ingresos, gastos y métodos de pago
- **Transacciones**: Ingresos y gastos de ejemplo

### Usuarios de Prueba

| Email | Contraseña | Descripción |
|-------|------------|-------------|
| juan.perez@email.com | password123 | Usuario administrador |
| maria.garcia@email.com | password123 | Usuario regular |
| carlos.lopez@email.com | password123 | Usuario con transacciones |

### Ejecutar Tests

```bash
# Instalar dependencias de testing
npm install --save-dev jest supertest

# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage
```

## 🔒 Seguridad

### Medidas Implementadas

- **Autenticación JWT**: Tokens seguros con expiración
- **Hashing de Contraseñas**: bcryptjs con salt rounds
- **Validación de Entrada**: express-validator
- **CORS**: Configuración de dominios permitidos
- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: Límite de requests por IP
- **SQL Injection**: Uso de prepared statements

### Recomendaciones de Producción

1. **HTTPS**: Usar certificados SSL/TLS
2. **Variables de Entorno**: Nunca exponer secretos
3. **Firewall**: Configurar reglas de acceso
4. **Monitoreo**: Logs y métricas de seguridad
5. **Backups**: Respaldos automáticos de BD
6. **Actualizaciones**: Mantener dependencias actualizadas

## 📈 Monitoreo y Logs

### Logs Disponibles

- **Acceso**: Requests HTTP con Morgan
- **Errores**: Stack traces en desarrollo
- **Base de Datos**: Consultas SQL (opcional)
- **Autenticación**: Intentos de login

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

## 🚀 Despliegue

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
# Instalar dependencias de producción
npm ci --only=production

# Iniciar servidor
npm start
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Ismael HV**
- Proyecto académico - CIBERTEC
- Curso: Desarrollo de Aplicaciones Móviles II
- Año: 2025

## 📞 Soporte

Para soporte técnico o preguntas:

- 📧 Email: soporte@gestionfinanciera.com
- 📱 WhatsApp: +51 987 654 321
- 🌐 Web: https://gestionfinanciera.com

---

⭐ **¡No olvides dar una estrella al proyecto si te fue útil!** ⭐