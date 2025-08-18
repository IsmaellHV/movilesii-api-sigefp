# Imagen ligera para producción
FROM node:lts-slim

ENV NODE_ENV=production
WORKDIR /app

# Instala deps de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia el código fuente
COPY . .

# La app escuchará en 80 (ajusta si usas otro)
ENV PORT=80
EXPOSE 80

# Punto de entrada (cámbialo si tu archivo es src/index.js o dist/index.js)
CMD ["node", "index.js"]
