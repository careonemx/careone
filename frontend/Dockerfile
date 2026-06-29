# ===== Etapa 1: build con Vite =====
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# VITE_API_URL se inyecta en build-time (docker-compose pasa /api en prod).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ===== Etapa 2: Nginx no-root, puerto 8080 =====
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Config de Nginx (SPA + headers)
COPY nginx.conf /etc/nginx/nginx.conf

# Artefactos del build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:8080/ || exit 1
