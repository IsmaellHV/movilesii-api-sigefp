FROM node:20-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=80
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 80
CMD ["node", "server.js"]
