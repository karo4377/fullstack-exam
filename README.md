# Cute Art Webshop

Full-stack art webshop: Next.js frontend, NestJS backend, PostgreSQL.

## Structure

- **`backend/`** – NestJS API (auth, products, cart, orders). See `backend/README.md`.
- **`frontend/`** – Next.js app. See `frontend/README.md`.
- **`WISEFLOW.md`** – One-page summary for WISEflow (links, run instructions).

## Quick start

1. **PostgreSQL** (e.g. Docker):

   ```bash
   docker run --name postgres-artshop \
     -e POSTGRES_USER=artshop -e POSTGRES_PASSWORD=artshop -e POSTGRES_DB=artshop \
     -p 5433:5432 -d postgres:16
   ```

2. **Backend**

   ```bash
   cd backend
   cp .env.example .env   # or create .env with DATABASE_URL, JWT_SECRET, FRONTEND_URL
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run start:dev
   ```

   API: http://localhost:3001  
   **Admin account** (after seed): `admin@artshop.local` / `admin123` — log in, then open **Admin** in the nav to manage products and view users/orders.

3. **Frontend**

   ```bash
   cd frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
   npm install
   npm run dev
   ```

   App: http://localhost:3000

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml`: on push/PR to `main`, runs backend tests and build and frontend build. Connect the repo to Vercel (frontend) and Render/Railway (backend + DB) for deployment.
