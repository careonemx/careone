# CareOne

SaaS para consultorios y clinicas de especialidades medicas (arranca con Odontologia).
Multi-tenant: una sola base de datos, aislamiento por `tenant_id` (= clinica) en cada tabla.

## Stack

| Capa | Tecnologia |
|---|---|
| Backend | Java 21 + Spring Boot 4.1.0 (Maven) |
| Base de datos | PostgreSQL 18 |
| Migraciones | Flyway 12 (`flyway-database-postgresql`) |
| Frontend | React 19.2 + Vite + MUI |
| Contenedores | Docker + Docker Compose |

## Estructura

```
careone/
├── backend/      # Spring Boot, organizado por feature en core/
├── frontend/     # React + Vite
├── deploy/       # Archivos de despliegue (reverse proxy, etc.)
├── docker-compose.yml          # base (sin puertos)
├── docker-compose.local.yml    # desarrollo (puertos 5433 / 8080 / 80)
└── docker-compose.prod.yml     # produccion (red del reverse proxy)
```

## Como levantar (desarrollo local, WSL)

1. Copia las variables de entorno y rellenalas:
   ```bash
   cp .env.example .env
   # edita .env: passwords, JWT_SECRET (openssl rand -base64 48), etc.
   ```
2. Construye y levanta todo con Docker:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
   ```
3. Accede:
   - Frontend: http://localhost
   - Backend (health): http://localhost:8080/actuator/health
   - PostgreSQL: localhost:5433

Para detener: `Ctrl+C` y `docker compose ... down` (agrega `-v` para borrar la BD).

## Desarrollo sin Docker

- Backend: `cd backend && ./mvnw spring-boot:run` (necesita Postgres en :5433).
- Frontend: `cd frontend && npm install && npm run dev` (Vite en :5173).

## Produccion

Requiere una red Docker externa llamada `proxy` (Nginx Proxy Manager u otro reverse proxy):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
