# Cute Art Webshop

Full-stack art webshop: Next.js frontend, NestJS backend, PostgreSQL.

## Structure

- **`backend/`** – NestJS API (auth, products, cart, orders, reviews, admin). See `backend/README.md`.
- **`frontend/`** – Next.js app. See `frontend/README.md`.
- **`WISEFLOW.md`** – One-page summary for WISEflow submission.
- **`DEPLOYMENT.md`** – Step-by-step deploy to **Neon + Render + Vercel** (free tiers).
- **`DATABASE.md`** – Schema, views, triggers, seed accounts.
- **`docker-compose.yml`** – Local full-stack fallback if cloud is unavailable.

## Quick start (local)

1. **PostgreSQL** (Docker):

   ```bash
   docker run --name postgres-artshop \
     -e POSTGRES_USER=artshop -e POSTGRES_PASSWORD=artshop -e POSTGRES_DB=artshop \
     -p 5432:5432 -d postgres:16
   ```

2. **Backend**

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate deploy
   npm run seed
   npm run start:dev
   ```

   API: http://localhost:3001  
   Swagger: http://localhost:3001/api/docs  

   **Accounts (after seed):**  
   - Admin: `admin@artshop.local` / `admin123`  
   - Customer: `customer@artshop.local` / `customer123`

3. **Frontend**

   ```bash
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

   App: http://localhost:3000

## Docker (all-in-one fallback)

```bash
docker compose up --build
```

Frontend: http://localhost:3000 · API: http://localhost:3001

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs backend tests/build and frontend build on push/PR to `main`.

Deploy: see **`DEPLOYMENT.md`**.
