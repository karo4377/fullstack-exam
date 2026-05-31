# Art Webshop – WISEflow summary

## Project

**Cute Art Webshop** – Full-stack web application for an art/prints shop: browse products (search + category filter), register/login, reviews, cart, simulated checkout, order history, and admin panel (products, users, orders).

## Architecture

- **Client:** Next.js 14 (TypeScript, App Router), React Query, cookie-based auth.
- **Server:** NestJS (TypeScript), REST API, JWT in HTTP-only cookies, CORS, validation, Swagger at `/api/docs`.
- **Monitoring:** Sentry on backend and frontend (set `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` in production).
- **Database:** PostgreSQL with Prisma ORM; migrations, seed (~40 products), SQL views/triggers (see `DATABASE.md`).

## Links

- **GitHub repository:** https://github.com/karo4377/fullstack-exam
- **Deployed application:** _[Add your Vercel URL after deploy]_
- **API documentation:** _[Add `https://YOUR-API.onrender.com/api/docs`]_

## Running locally

1. **Database:** PostgreSQL on port `5432` (Docker command in `README.md`). Set `DATABASE_URL` in `backend/.env`.
2. **Backend:** `cd backend && npm install && npx prisma migrate deploy && npm run seed && npm run start:dev` → http://localhost:3001
3. **Frontend:** `cd frontend && cp .env.local.example .env.local && npm install && npm run dev` → http://localhost:3000
4. **Docker fallback:** `docker compose up --build` (see `DEPLOYMENT.md`).

## Test accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@artshop.local | admin123 |
| Customer | customer@artshop.local | customer123 |

## Deliverables checklist

- Database: Prisma schema, migrations, views/triggers, seed data, transactions on checkout.
- Backend: REST API, auth, admin, Swagger, role guards.
- Frontend: Home with product slider, shop, cart, checkout, orders, admin UI, sitemap, 404 page.
- CI: GitHub Actions workflow.
- E2E: Cypress (`frontend/cypress/e2e/`).
- Logging: Sentry (`@sentry/nestjs`, `@sentry/nextjs`).
- Docs: README, `DEPLOYMENT.md`, `DATABASE.md`, this WISEflow page.
