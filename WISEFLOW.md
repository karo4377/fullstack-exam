# Art Webshop – WISEflow summary

## Project

**Cute Art Webshop (ARTSHOP)** – Full-stack web application for an art/prints shop: browse products (search + category filter), register/login, reviews, cart, simulated checkout, order history, and admin panel (products, users, orders).

## Architecture

- **Client:** Next.js 14 (TypeScript, App Router), React Query, cookie-based auth — hosted on **Vercel**.
- **Server:** NestJS (TypeScript), REST API, JWT in HTTP-only cookies, CORS, validation, Swagger — hosted on **Render**.
- **Database:** PostgreSQL on **Neon**, Prisma ORM; migrations, seed (~40 products), SQL views/triggers (see `DATABASE.md`).
- **Monitoring:** Sentry on backend and frontend (`SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`).
- **E2E tests:** Cypress (`frontend/cypress/e2e/`).

## Links

| | URL |
|---|-----|
| **GitHub repository** | https://github.com/karo4377/fullstack-exam |
| **Live application (frontend)** | https://fullstack-exam-weld.vercel.app |
| **Exam study guide (on site)** | https://fullstack-exam-weld.vercel.app/study |
| **API (backend)** | https://fullstack-exam-49k7.onrender.com |
| **API documentation (Swagger)** | https://fullstack-exam-49k7.onrender.com/api/docs |

## Running locally

1. **Database:** PostgreSQL (see `README.md` or `docker compose`). Set `DATABASE_URL` in `backend/.env`.
2. **Backend:** `cd backend && npm install && npx prisma migrate deploy && npm run seed && npm run start:dev` → http://localhost:3001  
   Swagger: http://localhost:3001/api/docs
3. **Frontend:** `cd frontend && cp .env.local.example .env.local && npm install && npm run dev` → http://localhost:3000
4. **Docker fallback:** `docker compose up --build` (see `DEPLOYMENT.md`).

## Test accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@artshop.local | admin123 |
| Customer | customer@artshop.local | customer123 |

Admin panel: https://fullstack-exam-weld.vercel.app/admin (after login as admin).

## Deliverables checklist

- Database: Prisma schema, migrations, views/triggers, seed data, transactions on checkout.
- Backend: REST API, auth, admin, Swagger, role guards.
- Frontend: Home with product slider, shop, cart, checkout, orders, admin UI, sitemap, 404 page.
- CI: GitHub Actions (`.github/workflows/ci.yml`) on push to `main`.
- E2E: Cypress — `cd frontend && npm run e2e` (requires local API + frontend).
- Logging: Sentry — test endpoints when DSN is configured:  
  - Backend: `/debug/sentry`  
  - Frontend: `/api/sentry-test`
- Docs: `README.md`, `DEPLOYMENT.md`, `DATABASE.md`, this page.
