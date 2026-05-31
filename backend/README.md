# Art Webshop – Backend

NestJS REST API with PostgreSQL (Prisma), JWT auth (HTTP-only cookies), and CORS.

## Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT in HTTP-only cookie, Passport JWT strategy

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database**

   - Run PostgreSQL (e.g. Docker: `docker run -e POSTGRES_USER=artshop -e POSTGRES_PASSWORD=artshop -e POSTGRES_DB=artshop -p 5432:5432 -d postgres:16`).
   - Create `.env` in the backend root:

   ```env
   DATABASE_URL="postgresql://artshop:artshop@localhost:5432/artshop"
   JWT_SECRET="your-secret"
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Migrations and seed**

   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

4. **Run**

   ```bash
   npm run start:dev
   ```

   API runs at **http://localhost:3001** (or `PORT` from env).  
   **Swagger UI:** http://localhost:3001/api/docs

## Scripts

- `npm run start:dev` – dev server
- `npm run build` – build for production
- `npm run start` – run production build
- `npm run test` – unit tests
- `npm run seed` – seed categories and sample products

## API (main)

- **Auth**: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` (cookie-based).
- **Products**: `GET /products` (`?search=&categoryId=`), `GET /products/:id`.
- **Categories**: `GET /categories`.
- **Reviews**: `GET /products/:id/reviews`, `POST /products/:id/reviews` (customer, auth).
- **Cart** (authenticated): `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`.
- **Orders** (authenticated): `GET /orders`, `GET /orders/:id`, `POST /orders` (checkout from cart).

## Logging / monitoring

For production you can add [Sentry](https://sentry.io) (`@sentry/node`) and set `SENTRY_DSN` in the environment. Configure in `main.ts` before `app.listen()`.

## Deployment

Set `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` (and optionally `PORT`) in your host (e.g. Render, Railway). Run `npx prisma migrate deploy` before starting the app.
