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

## Main routes

- `/` – home
- `/products` – product list (with search)
- `/products/[id]` – product detail, add to cart
- `/login`, `/register` – auth
- `/cart` – cart and checkout (requires login)
- `/account/orders` – order history (requires login)

## Logging / monitoring

For production you can add [Sentry](https://sentry.io) for Next.js (`@sentry/nextjs`) and set `SENTRY_DSN` in the environment.
