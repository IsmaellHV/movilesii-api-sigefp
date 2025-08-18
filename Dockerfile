# Usar versión específica de Node.js para mayor seguridad
FROM node:20.18.0-alpine AS builder

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Cambiar propietario del directorio
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Copiar archivos de dependencias primero para optimizar cache de Docker
COPY --chown=nodeuser:nodejs package*.json ./

# Instalar dependencias de producción y limpiar cache
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copiar código fuente
COPY --chown=nodeuser:nodejs . .

# Stage de producción
FROM node:20.18.0-alpine AS runner

# Instalar dumb-init
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=80
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Configurar directorio de trabajo
WORKDIR /app

# Cambiar propietario del directorio
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Copiar aplicación desde builder
COPY --from=builder --chown=nodeuser:nodejs /app ./

# Healthcheck para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Exponer puerto
EXPOSE 80

# Usar dumb-init y corregir ruta del archivo principal
CMD ["dumb-init", "node", "src/server.js"]
