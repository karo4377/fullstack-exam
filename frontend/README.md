# Art Webshop – Frontend

Next.js 14 (App Router) SPA with React Query and cookie-based auth.

## Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Data**: TanStack Query (React Query), fetch with credentials
- **Styling**: Plain CSS (Tailwind optional)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Create `.env.local` in the frontend root:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   Point this to your backend URL (e.g. in production: `https://your-api.example.com`).

3. **Run**

   ```bash
   npm run dev
   ```

   App runs at **http://localhost:3000**.

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production build
- `npm run e2e` – run Cypress E2E tests (headless)
- `npm run e2e:open` – open Cypress interactive runner

## E2E tests (Cypress)

Requires **both** apps running locally:

```bash
# Terminal 1 — API with seed data
cd backend && npm run start:dev

# Terminal 2 — frontend
cd frontend && npm run dev

# Terminal 3 — tests
cd frontend && npm run e2e
```

Optional env (defaults shown):

- `CYPRESS_BASE_URL` – frontend URL (default `http://localhost:3000`)
- `CYPRESS_API_URL` – used in specs via `cy.env('API_URL')`; set in `cypress.config.ts` or pass:

  ```bash
  CYPRESS_API_URL=http://localhost:3001 npm run e2e
  ```

Specs:

- `cypress/e2e/smoke.cy.ts` – home, navigation, 404 (no API)
- `cypress/e2e/shop.cy.ts` – product list and detail (needs API)
- `cypress/e2e/auth.cy.ts` – login and cart (needs API + seed users)

## Main routes

- `/` – home
- `/products` – product list (with search)
- `/products/[id]` – product detail, add to cart
- `/login`, `/register` – auth
- `/cart` – cart and checkout (requires login)
- `/account/orders` – order history (requires login)

## Logging / monitoring

[Sentry](https://sentry.io) is integrated via `@sentry/nextjs`. Set `NEXT_PUBLIC_SENTRY_DSN` (and optionally `SENTRY_DSN`) in `.env.local` or Vercel.

Test (with DSN set): open `/api/sentry-test` in the browser or visit the URL while `npm run dev` is running.
