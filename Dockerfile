# Imagen para compilar
FROM node:latest as builder
# Node en modo producción
ENV NODE_ENV=production
# Se trabaja en la carpeta app
WORKDIR /app
# Se copia el package.json y package-lock.json
COPY package.json package-lock.json /app/
# Se instala exactamente lo definido en package-lock.json sin dependencias de desarrollo
RUN npm ci --omit=dev
# Se copia los archivos del proyecto (ya minificados en GitHub Actions)
COPY . /app

# Imagen que ejecutará el proyecto
FROM node:lts-slim as runner
# Node en modo producción
ENV NODE_ENV=production
# Se trabaja en la carpeta app
WORKDIR /app
# Se copia lo ejecutado del builder al runner
COPY --from=builder /app /app
# Se ejecuta el proyecto
CMD ["node","index.js"]
# Se expone el puerto
EXPOSE 80