# Art Webshop – WISEflow summary

## Project

**Cute Art Webshop** – Full-stack web application for an art/prints shop: browse products, register/login, add to cart, checkout (simulated), and view order history.

## Architecture

- **Client**: Next.js 14 (TypeScript, App Router), React Query, cookie-based auth.
- **Server**: NestJS (TypeScript), REST API, JWT in HTTP-only cookies, CORS, validation (class-validator).
- **Database**: PostgreSQL with Prisma ORM; migrations and seed script.

## Links

- **GitHub repository**: [Add your repo URL here]
- **Deployed application**: [Add your frontend URL after deployment]

## Running locally

1. **Database**: PostgreSQL (e.g. Docker on port 5433). Set `DATABASE_URL` in `backend/.env`.
2. **Backend**: `cd backend && npm install && npx prisma migrate dev && npm run seed && npm run start:dev` → http://localhost:3001
3. **Frontend**: `cd frontend && npm install` and set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`, then `npm run dev` → http://localhost:3000

## Deliverables

- Database: Prisma schema, migrations, seed; indexes and relations as in schema.
- Backend: Auth (register, login, logout, me), products, cart, orders (transactional checkout); guards and validation.
- Frontend: Home, products list/detail, login/register, cart, checkout, order history; auth context and API client.
- CI: GitHub Actions workflow for backend tests and build and frontend build.
- Docs: README in backend and frontend; this one-page WISEflow summary.
