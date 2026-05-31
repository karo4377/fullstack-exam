export type StudySection = {
  id: string;
  title: string;
  points: string[];
  inProject: string;
};

export const studyIntro =
  'Quick revision for the full-stack exam. Each topic explains the concept and how this ARTSHOP project (Next.js + NestJS + PostgreSQL) implements it.';

export const studySections: StudySection[] = [
  {
    id: 'spa',
    title: 'SPA (Single Page Application)',
    points: [
      'The browser loads one HTML shell; navigation swaps views without full page reloads.',
      'In React, routing (e.g. Next.js App Router) changes which components render.',
      'Data is fetched with JavaScript (fetch / React Query) after the app loads.',
    ],
    inProject:
      'The storefront is a Next.js React app. Links like `/products` and `/cart` navigate client-side. Product lists load via `useQuery` calling the NestJS API — the page does not reload like a classic multi-page PHP site.',
  },
  {
    id: 'components',
    title: 'Reusable components',
    points: [
      'Split UI into small pieces (buttons, cards, headers) used in many places.',
      'Props pass data and callbacks in; one source of truth for layout and styling.',
      'Advantages: less duplication, consistent design, easier testing and changes.',
    ],
    inProject:
      '`ProductCard`, `PageHeader`, `SiteHeader`, and `ImagePlaceholder` are reused on home, shop, and admin. Changing a card’s layout updates every product grid at once.',
  },
  {
    id: 'frontend-backend',
    title: 'Frontend ↔ backend communication',
    points: [
      'The client calls HTTP APIs (REST) with JSON bodies and reads JSON responses.',
      'Cookies or headers carry auth; CORS must allow the frontend origin.',
      'The backend validates input and talks to the database; the frontend never connects to Postgres directly.',
    ],
    inProject:
      '`frontend/lib/api.ts` uses `fetch` to `NEXT_PUBLIC_API_URL` (Render) with `credentials: "include"` for JWT cookies. Endpoints include `GET /products`, `POST /auth/login`, `POST /orders`.',
  },
  {
    id: 'rendering',
    title: 'Client-side vs server-side rendering',
    points: [
      'CSR: HTML is minimal; React runs in the browser and fetches data (common for dashboards).',
      'SSR: server builds HTML per request — good for SEO and first paint.',
      'Next.js can mix: static pages, SSR, and client components (`"use client"`).',
    ],
    inProject:
      'Most shop pages are client components that fetch from the API in the browser. `layout.tsx` uses `dynamic = "force-dynamic"` so builds do not depend on a sleeping API. The sitemap is generated on the server.',
  },
  {
    id: 'javascript-scope',
    title: 'JavaScript: var, let, const',
    points: [
      '`var`: function-scoped, hoisted — avoid in modern code.',
      '`let`: block-scoped, can be reassigned.',
      '`const`: block-scoped, binding cannot be reassigned (object contents can still change).',
      'No keyword: creates implicit global on `window` in sloppy mode — never use.',
    ],
    inProject:
      'TypeScript/React code uses `const` for components and `let` only when a variable is reassigned (e.g. form state with `useState`).',
  },
  {
    id: 'typescript',
    title: 'TypeScript vs JavaScript',
    points: [
      'TypeScript adds static types checked at compile time.',
      'Catches many bugs before runtime; better IDE autocomplete and refactoring.',
      'Compiles to JavaScript; browsers still run JS.',
    ],
    inProject:
      'Both `frontend/` and `backend/` use TypeScript. DTOs and Prisma types define API shapes; React props are typed on components like `ProductCard`.',
  },
  {
    id: 'logging',
    title: 'Logging (Sentry)',
    points: [
      'Log errors and important events in production — not passwords or card numbers.',
      'Why: find bugs users hit, measure stability, debug without reproducing locally.',
      'Central tools (Sentry) group errors, show stack traces and release context.',
    ],
    inProject:
      'Sentry on NestJS (`instrument.ts`, `SentryGlobalFilter`) and Next.js (`sentry.*.config.ts`, `global-error.tsx`). Test routes: `/debug/sentry` (API) and `/api/sentry-test` (frontend). Set `SENTRY_DSN` in Render/Vercel.',
  },
  {
    id: 'routing',
    title: 'Routing & protected routes',
    points: [
      'Routing maps URLs to screens (Next.js file-based routes in `app/`).',
      'Protected routes restrict access (e.g. admin, account) until the user is authenticated.',
      'Check auth on client (redirect) and always again on the server (guards).',
    ],
    inProject:
      'Public: `/`, `/products`. Login required for `/cart`, `/account`. `admin/layout.tsx` redirects non-admins. Backend uses `JwtAuthGuard` and `RolesGuard` on admin and cart routes.',
  },
  {
    id: 'pagination',
    title: 'Pagination, filtering, sorting',
    points: [
      'Filtering/sorting on large datasets usually belongs on the backend (SQL is efficient).',
      'Frontend handles UI state (search box, category select) and sends query params.',
      'Pagination can be backend-driven (`?page=2`) or client-side for small lists.',
    ],
    inProject:
      '`/products` sends `search`, `categoryId`, and `collection` to `GET /products`. NestJS + Prisma build the query. The UI updates the URL with `useSearchParams` so filters are shareable.',
  },
  {
    id: 'forms',
    title: 'Forms & validation',
    points: [
      'Validate on client for fast feedback; validate on server for security (never trust the client).',
      'Use clear error messages per field; prevent invalid submits.',
    ],
    inProject:
      'Checkout and login forms use controlled inputs. NestJS `ValidationPipe` with DTOs (`class-validator`) on register, checkout, and guest checkout. Invalid bodies return 400 with messages.',
  },
  {
    id: 'state',
    title: 'Global state vs props',
    points: [
      'Props: parent passes data down — simple, explicit, good for presentational components.',
      'Global state (Context, Redux): shared data many levels deep — cart, auth user.',
      'Props disadvantage: prop drilling. Global disadvantage: harder to trace updates, overuse causes rerenders.',
    ],
    inProject:
      '`AuthProvider` and `CartProvider` wrap the app in `providers.tsx`. Product cards receive `title`, `priceCents` via props. Cart count is read from context in the header.',
  },
  {
    id: 'caching',
    title: 'React Query: stale time vs cache time',
    points: [
      '`staleTime`: how long data is considered fresh — no refetch on mount while fresh.',
      '`gcTime` (formerly `cacheTime`): how long unused data stays in memory before garbage collection.',
      'Fresh data = instant UI; stale data = background refetch possible.',
    ],
    inProject:
      'Home products use `staleTime: 60_000` (1 min). Categories use `300_000` (5 min). After stale, React Query refetches when the component mounts again or window refocuses.',
  },
  {
    id: 'retries',
    title: 'HTTP retries',
    points: [
      'Automatically repeat failed requests (network blips, 503).',
      'Good for resilience; use limits and backoff to avoid hammering the server.',
      'React Query retries failed queries by default (3 times) unless configured otherwise.',
    ],
    inProject:
      '`QueryClient` in `providers.tsx` uses library defaults (retries on failure). Combined with `staleTime`, users see cached products while a retry runs in the background.',
  },
  {
    id: 'security',
    title: 'Security overview',
    points: [
      'Authentication: who you are (login). Authorization: what you may do (roles).',
      'Hashing passwords (bcrypt); HTTPS encrypts traffic; JWT in HTTP-only cookies reduces XSS token theft.',
      'SQL injection: use parameterized queries/ORM. XSS: escape output, avoid `dangerouslySetInnerHTML`. CSRF: cookies + SameSite + CORS. CORS: backend whitelists frontend origin.',
    ],
    inProject:
      'Passwords hashed in seed and auth service. JWT in HTTP-only cookie. Prisma parameterizes SQL. `FRONTEND_URL` + CORS on NestJS. Admin routes require `role: ADMIN`. Production cookies are `secure`.',
  },
  {
    id: 'css',
    title: 'CSS approaches & responsive design',
    points: [
      'Raw CSS files: full control, matches design handoff (Figma).',
      'Tailwind / Bootstrap: utility or component classes, faster layout.',
      'Styled components / Chakra: CSS-in-JS or component libraries.',
      'Responsive: mobile-first — base styles for small screens, `@media (min-width: …)` for larger.',
    ],
    inProject:
      'Custom CSS in `globals.css` (Scandi gallery look), not Tailwind in components despite Tailwind in package.json. Breakpoints e.g. `@media (min-width: 640px)` widen padding and nav. Admin and shop share the same tokens (`--color-accent`).',
  },
  {
    id: 'apis',
    title: 'API styles (REST, GraphQL, WebSocket)',
    points: [
      'REST: resources as URLs + HTTP verbs — simple, cacheable, widely used.',
      'GraphQL: client asks for exact fields — flexible, one endpoint, more complex server.',
      'WebSocket: persistent connection — chat, live games, stock tickers.',
    ],
    inProject:
      'REST with NestJS controllers and Swagger at `/api/docs`. GraphQL and WebSockets were not needed for a product catalog and cart.',
  },
  {
    id: 'orm',
    title: 'ORM vs raw SQL driver',
    points: [
      'ORM (Prisma): schema as code, migrations, type-safe queries — faster development.',
      'Raw driver: maximum control and performance tuning — more boilerplate.',
      'Hybrid: ORM for app + raw SQL migration for views/triggers.',
    ],
    inProject:
      'Prisma models users, products, orders. Migration `20260326120000_db_objects` adds PostgreSQL views (`vw_product_ratings`), function `fn_product_stock`, and triggers for `updatedAt`.',
  },
  {
    id: 'testing',
    title: 'Unit, integration, E2E tests',
    points: [
      'Unit: one function/module in isolation (mock dependencies).',
      'Integration: several layers together (e.g. service + database).',
      'E2E: full user flow in a real browser (Cypress).',
    ],
    inProject:
      'Backend Jest tests for `ProductsService` and `OrdersService`. GitHub Actions runs tests on push. Cypress in `frontend/cypress/e2e/` — smoke, shop, and auth specs (`npm run e2e`).',
  },
  {
    id: 'deployment',
    title: 'Deployment & CI/CD',
    points: [
      'CI/CD: on git push, run tests/build; if green, deploy to hosting.',
      'Benefits: fewer manual mistakes, consistent releases, fast feedback.',
      'Split hosting: DB (Neon), API (Render), frontend (Vercel) — scale independently.',
    ],
    inProject:
      '`.github/workflows/ci.yml` tests backend and builds frontend on `main`. Vercel deploys `frontend/`, Render runs `npm run build` + `start:prod`. See `DEPLOYMENT.md`.',
  },
];
