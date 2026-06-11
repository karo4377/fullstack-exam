import { shopName } from '@/lib/site';

export type StudyCodeSnippet = {
  caption?: string;
  code: string;
};

export type StudySection = {
  id: string;
  title: string;
  question?: string;
  answer: string[];
  inProject: string;
  snippets?: StudyCodeSnippet[];
  extra?: boolean;
};

export const studyIntro =
  'In-depth exam revision — each topic explained in plain paragraphs with technical terms and project examples.';

export const studySections: StudySection[] = [
  {
    id: 'spa',
    title: 'SPA — Single Page Applications',
    question: 'What is a SPA and how is it done in React?',
    answer: [
      'A Single Page Application (SPA) loads one HTML document and one main JavaScript bundle when you first visit the site. After that, navigation does not trigger a full server round-trip for every page — instead, the client-side router swaps which React components are mounted in the DOM. The browser URL still changes (e.g. from / to /products), but the shell around the content — header, footer, global styles — typically stays in place, which makes the app feel faster and more like a native application.',
      'In React, the UI is a tree of components. When state changes (user types in a search box) or the route changes (user clicks Shop), React reconciles the virtual DOM and updates only the parts of the real DOM that actually changed. Data for the new view is usually fetched asynchronously with fetch or a library like React Query after the route change, rather than being baked into separate HTML files on the server for every URL.',
      'The trade-off is that the first load can be heavier because the browser must download and parse JavaScript before showing rich content, and search engines need extra help (SSR or static generation) compared to classic multi-page sites where each URL is a complete HTML document from the server.',
    ],
    inProject: `${shopName} is a Next.js React SPA at its core: clicking Shop or Cart changes the route client-side while SiteHeader and SiteFooter stay mounted. Product lists are loaded with useQuery calling the NestJS REST API — there is no full page reload like in a traditional PHP or JSP shop.`,
    snippets: [
      {
        caption: 'Client component + data fetch (homepage)',
        code: `'use client';
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => productsApi.list(),
  staleTime: 60_000,
});`,
      },
    ],
  },
  {
    id: 'components',
    title: 'Reusable components',
    question: 'How do you build reusable frontend components and why?',
    answer: [
      'A reusable component is a self-contained piece of UI with a clear props interface — typed inputs that describe what data it needs and optional callbacks for user actions. Instead of copying the same markup for every product card or page header, you define it once and pass different props (title, price, image URL) wherever you need it.',
      'The main advantages are consistency (every product card looks and behaves the same), maintainability (fix a bug or tweak spacing in one file instead of twenty), and composition (you build complex pages by assembling small blocks). Components should ideally do one job well: present data, or handle a form, rather than mixing unrelated concerns.',
      'In React, components are functions (or classes) that return JSX. Props flow down from parent to child; when a child needs to notify the parent, you pass a function prop such as onAddToCart. This explicit data flow makes the tree easier to reason about than scattering DOM manipulation across the codebase.',
    ],
    inProject:
      'ProductCard, PageHeader, SiteHeader, and FavoriteButton live in frontend/components/ and are reused on the home page, shop grid, and account area. ProductCard accepts typed props (id, title, priceCents, imageUrl) — changing its layout updates every grid at once.',
    snippets: [
      {
        caption: 'Typed props on ProductCard',
        code: `type ProductCardProps = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
};

export function ProductCard({ id, title, priceCents, ... }: ProductCardProps) {
  return <article className="card product-card">...</article>;
}`,
      },
    ],
  },
  {
    id: 'frontend-backend',
    title: 'Frontend ↔ backend communication',
    question: 'How does the frontend talk to the backend?',
    answer: [
      'The frontend and backend communicate over HTTP using a REST API. The browser sends requests (GET to read, POST to create, PATCH to update) to URLs like /products or /auth/login, usually with a JSON body and JSON response. The frontend runs in the user\'s browser; the backend (NestJS) runs on a server, validates the request, executes business logic, talks to PostgreSQL through Prisma, and returns structured JSON.',
      'The frontend must never connect to the database directly. If it did, you would expose credentials (DATABASE_URL) in client-side code and skip server-side validation — anyone could craft requests and bypass your rules. All persistence and authorization checks belong on the server.',
      'When authentication uses HTTP-only cookies, fetch must be called with credentials: "include" so the browser attaches the auth cookie on cross-origin requests. The backend must respond with correct CORS headers (Access-Control-Allow-Origin for the frontend URL and Allow-Credentials) or the browser will block the response even if the server processed it successfully.',
    ],
    inProject:
      'frontend/lib/api.ts wraps fetch against NEXT_PUBLIC_API_URL (Render in production, localhost:3001 in dev). Every call uses credentials: "include". Examples: GET /products for the catalog, POST /auth/login for sign-in, POST /orders for checkout.',
    snippets: [
      {
        caption: 'Shared API helper',
        code: `export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ... },
  });
  if (!res.ok) throw new Error(...);
  return res.json();
}`,
      },
    ],
  },
  {
    id: 'rendering',
    title: 'Client-side vs server-side rendering',
    question: 'What is CSR vs SSR and when do you use each?',
    answer: [
      'Client-side rendering (CSR) means the server sends a minimal HTML shell plus JavaScript bundles; React runs in the browser, mounts the app, and fetches data from APIs. The user may briefly see a loading state before content appears. CSR suits authenticated dashboards and highly interactive apps where SEO is less critical.',
      'Server-side rendering (SSR) builds HTML on the server for each request (or at build time for static generation, SSG). The browser receives meaningful content immediately, which improves first paint and helps search engines index the page. SSR costs more server CPU per request than serving static files.',
      'Next.js App Router blends both: files are Server Components by default, but adding "use client" at the top of a file opts into client-side hooks (useState, useEffect, useQuery). You choose per page or component based on whether you need browser APIs, interactivity, or server-only secrets.',
    ],
    inProject:
      'Most shop pages (products, cart, checkout) are client components that fetch from the API in the browser. app/layout.tsx sets dynamic = "force-dynamic" so production builds do not fail when the Render API is sleeping. app/sitemap.ts runs on the server to generate SEO URLs.',
  },
  {
    id: 'javascript-scope',
    title: 'JavaScript variable scope',
    question: 'Explain var, let, const, and declaring nothing.',
    answer: [
      'Scope determines where a variable name is visible and how long it lives. var is function-scoped and hoisted — it exists from the top of the function even before its declaration line, which can cause surprising bugs. var can also be redeclared in the same scope. Modern code avoids var.',
      'let and const are block-scoped: they exist only inside the nearest pair of curly braces (if, for, or a standalone block). let allows reassignment; const forbids reassigning the binding, though the contents of a const object or array can still be mutated (const list = []; list.push(1) is valid).',
      'Declaring a variable without let, const, or var in non-strict mode creates an accidental global property on window, which can break encapsulation and cause name collisions. Always use const by default and let when you need to reassign.',
    ],
    inProject:
      'The codebase defaults to const for imports, components, and hook results. let appears only when a variable is reassigned in a loop or counter. useState returns [value, setValue] as const — you update state through setValue, not by reassigning the value variable directly.',
  },
  {
    id: 'typescript',
    title: 'TypeScript vs JavaScript',
    question: 'Why use TypeScript instead of plain JavaScript?',
    answer: [
      'TypeScript is a superset of JavaScript that adds optional static types. During development, the TypeScript compiler checks that you pass the right types to functions, that objects have the properties you access, and that API responses match expected shapes. Many entire classes of runtime errors become compile-time errors before the user ever sees them.',
      'Types also power IDE features: autocomplete, inline documentation, and safe refactoring when you rename a field across dozens of files. At build time, TypeScript is erased and compiles to plain JavaScript — browsers and Node.js still execute JS, not TS directly.',
      'In a full-stack project, shared concepts (User, Product, Order) can be described once and enforced on both frontend props and backend DTOs, reducing mismatches between what the API returns and what the UI expects.',
    ],
    inProject:
      'Both frontend/ and backend/ use TypeScript. Backend DTOs combine types with class-validator decorators. React components declare prop types. Prisma generates TypeScript types from the database schema so queries are type-safe.',
  },
  {
    id: 'logging',
    title: 'Logging & Sentry',
    question: 'What should we log and why? (Sentry)',
    answer: [
      'Logging means recording what your application did and when things went wrong. In production you cannot attach a debugger to every user\'s browser, so you need remote error tracking. Log unhandled exceptions, failed API calls, and unexpected states — but never passwords, JWT tokens, credit card numbers, or personal data you are not allowed to store in logs.',
      'Sentry is a centralized error monitoring service. When an error is thrown, the SDK sends a report with the stack trace, environment (production vs development), browser or OS, and optional breadcrumbs (recent actions). The team gets alerts and can see how many users hit the same bug.',
      'Good logging answers: what broke, where in the code, and how often. That lets you prioritize fixes by impact instead of guessing from vague user reports.',
    ],
    inProject:
      'Sentry is integrated on NestJS (instrument.ts, SentryGlobalFilter) and Next.js (sentry.client.config.ts, global-error.tsx). Set SENTRY_DSN in production. Test endpoints exist to verify errors appear in the Sentry dashboard.',
  },
  {
    id: 'routing',
    title: 'Routing & protected routes',
    question: 'How does routing work and how do you protect routes?',
    answer: [
      'Routing maps URL paths to UI. In Next.js App Router, the folder structure under app/ defines routes: app/products/page.tsx serves /products, app/products/[id]/page.tsx serves dynamic /products/abc-123. layout.tsx files wrap nested routes — admin/layout.tsx wraps every /admin/* page.',
      'A protected route restricts access to authenticated users (or specific roles). You must enforce protection in two places: the frontend can redirect unauthenticated users for better UX, but the backend must always verify auth with guards — anyone can call your API directly with curl or Postman and bypass the UI.',
      'This project uses JWT stored in an HTTP-only cookie named auth. The browser sends it automatically; JavaScript cannot read it, which limits token theft via XSS. JwtAuthGuard validates the token; RolesGuard checks whether the user\'s role (CUSTOMER or ADMIN) is allowed for that endpoint.',
    ],
    inProject:
      'Public routes include /, /products, /about. /account and checkout require login. admin/layout.tsx redirects non-admins to home. Backend controllers use @UseGuards(JwtAuthGuard, RolesGuard) and @Roles("ADMIN") on admin and sensitive routes.',
    snippets: [
      {
        caption: 'JWT read from cookie (backend)',
        code: `function jwtFromAuthCookie(req: Request): string | null {
  const token: unknown = req.cookies?.auth;
  return typeof token === 'string' ? token : null;
}`,
      },
    ],
  },
  {
    id: 'pagination',
    title: 'Pagination, filtering & sorting',
    question: 'Who handles pagination/filtering/sorting — frontend or backend? Why?',
    answer: [
      'Filtering and pagination on large datasets should happen on the backend, in SQL via Prisma or raw queries. The database can use indexes to find matching rows efficiently and return only one page (e.g. 20 items) instead of shipping thousands of products to the browser. That saves bandwidth and keeps the UI responsive.',
      'The frontend owns the user interface for filters — search inputs, category pills, sort dropdown — and translates them into query parameters on the URL (e.g. ?search=cat&categoryId=xyz&sort=price-asc). Syncing filters to the URL makes bookmarking and sharing filtered views possible.',
      'Sorting can live on either side: backend sorting is correct when the full dataset is huge and only a page is loaded; client-side sorting is acceptable when you already fetched a modest list (our shop) and want instant reordering without another API call. Pagination with ?page=2&limit=20 belongs on the backend for catalogs that do not fit in memory.',
    ],
    inProject:
      'GET /products accepts search, categoryId, and collection — NestJS builds a Prisma where clause. The shop page syncs filters to the URL with useSearchParams. Price and name sorting runs client-side after fetch and is stored in ?sort= because our catalog size is manageable.',
  },
  {
    id: 'forms',
    title: 'Forms & input validation',
    question: 'How do forms and validation work?',
    answer: [
      'HTML forms collect user input. In React, controlled components store each field value in state (useState) and update on onChange — the input\'s value prop always reflects React state, giving you full control over validation messages and submit logic.',
      'Client-side validation gives immediate feedback (invalid email format, password too short) and improves UX, but it is not security. Attackers can send arbitrary JSON directly to your API. Server-side validation is mandatory: NestJS ValidationPipe runs class-validator rules on DTOs, strips unknown fields (whitelist), and returns HTTP 400 with clear error messages when input is invalid.',
      'Never trust the client. Treat every request as potentially malicious and validate type, length, format, and business rules (e.g. stock available) on the server before writing to the database.',
    ],
    inProject:
      'Login, register, checkout, and profile forms use controlled inputs. RegisterDto enforces @IsEmail() and @MinLength(6) on the password. ValidationPipe is registered globally in main.ts with whitelist and forbidNonWhitelisted enabled.',
  },
  {
    id: 'state',
    title: 'Global state vs props',
    question: 'When use props vs global state? Pros and cons?',
    answer: [
      'Props are the default way to pass data from a parent component to a child. The flow is explicit and easy to trace: ProductCard receives title and priceCents directly from the shop page. The downside is prop drilling — passing data through many intermediate layers that do not use it — which becomes tedious for deeply nested trees.',
      'Global state (React Context, Redux, Zustand) stores data that many unrelated components need, such as the logged-in user or shopping cart count. Context provides a Provider at the top of the tree and useContext (or a custom hook like useAuth) anywhere below. The trade-off is less obvious data flow: any component can read or trigger updates, and careless context design can cause unnecessary re-renders across the app.',
      'A practical rule: use props for local composition; reach for context when at least two distant parts of the UI must share live data without lifting state through five intermediate components.',
    ],
    inProject:
      'AuthProvider and CartProvider wrap the app in providers.tsx. ProductCard gets product fields via props. SiteHeader reads the cart item count from CartContext without every page passing cart data down manually.',
  },
  {
    id: 'caching',
    title: 'React Query caching',
    question: 'Explain stale time vs cache time (gcTime).',
    answer: [
      'React Query (TanStack Query) caches API results in memory keyed by queryKey — an array like ["products", search, categoryId]. When a component mounts, React Query returns cached data immediately if available, then optionally refetches in the background.',
      'staleTime controls how long data is considered fresh. While fresh, React Query will not automatically refetch on mount or window focus. After staleTime expires, data is stale but still shown — a background refetch may run to update it. This reduces redundant network calls for data that changes slowly (categories).',
      'gcTime (formerly cacheTime) is how long inactive query data stays in memory after no component uses that query anymore. When it expires, the cache entry is garbage-collected. staleTime is about freshness; gcTime is about memory retention. Different queryKeys for different filters ensure changing search text fetches a new cache entry instead of showing wrong results.',
    ],
    inProject:
      'Home products use staleTime: 60_000 (one minute). Categories use 300_000 (five minutes). The products page includes search and categoryId in queryKey so each filter combination caches separately.',
  },
  {
    id: 'retries',
    title: 'HTTP request retries',
    question: 'How do retries work and what are they good for?',
    answer: [
      'A retry automatically repeats a failed HTTP request after a short delay. Transient failures — a dropped mobile connection, a brief 503 from an overloaded server — often succeed on the second or third attempt without user intervention.',
      'Retries are especially useful for idempotent read requests (GET). For POST requests that create orders or charges, blind retries can duplicate side effects unless the server supports idempotency keys. React Query retries failed queries by default (typically three times) with exponential backoff between attempts.',
      'Combined with caching, retries improve resilience: the user may still see stale cached products while a background retry runs after a network error, instead of an empty error screen.',
    ],
    inProject:
      'QueryClient in providers.tsx uses React Query defaults for retries. Product lists with staleTime mean users often see cached data while a failed refetch retries in the background.',
  },
  {
    id: 'security-auth',
    title: 'Security — authentication',
    question: 'JWT vs sessions vs cookies — what is the difference?',
    answer: [
      'Authentication proves who the user is. Session-based auth (stateful) stores session data on the server — often in Redis or the database — and gives the client a session ID in a cookie. The server looks up that ID on every request. JWT auth (stateless) embeds claims (user id, role) in a signed token; the server verifies the signature with a secret without a database lookup, though you still load the user in validate() for fresh data.',
      'Cookies are a browser storage mechanism the server sets via Set-Cookie. HTTP-only cookies cannot be read by JavaScript, which reduces theft if an XSS vulnerability exists. Secure cookies are only sent over HTTPS. SameSite limits cross-site cookie sending and helps mitigate CSRF.',
      'Passwords must never be stored in plain text. bcrypt hashes the password with a salt and cost factor — verification compares hashes, but you cannot recover the original password from the hash. HTTPS (TLS) encrypts all traffic so tokens and passwords are not visible on the network.',
    ],
    inProject:
      'Login signs a JWT and sets res.cookie("auth", token) with HTTP-only options. JwtStrategy reads req.cookies.auth. Registration hashes passwords with bcrypt before Prisma stores them. Production runs on HTTPS via Vercel and Render.',
  },
  {
    id: 'security-authz',
    title: 'Security — authorization',
    question: 'What is role-based authorization?',
    answer: [
      'Authorization answers what an authenticated user is allowed to do — distinct from authentication (who they are). Role-based access control (RBAC) assigns each user a role such as CUSTOMER or ADMIN and restricts API routes and UI based on that role.',
      'Hiding the admin link in the frontend is not enough. An attacker could call POST /admin/products directly. Every sensitive endpoint must check the role on the server — in NestJS, JwtAuthGuard ensures a valid user exists, then RolesGuard compares req.user.role against @Roles("ADMIN") metadata on the controller or handler.',
      'Principle of least privilege: users should only have permissions required for their job. Customers can manage their cart and orders; only admins can create products or view all users.',
    ],
    inProject:
      'RolesGuard in backend/src/auth/roles.guard.ts reads required roles from decorators. AdminController, cart, orders, and favorites require JWT plus the correct role. admin/layout.tsx mirrors the check on the frontend by redirecting non-admins.',
  },
  {
    id: 'security-crypto',
    title: 'Hashing vs encryption',
    question: 'Hashing vs encryption — examples?',
    answer: [
      'Hashing is a one-way function: the same input always produces the same output (with a salt for passwords), but you cannot reverse the hash to get the password back. Use hashing for verifying secrets you never need to display — passwords, API key fingerprints.',
      'Encryption is two-way: data is scrambled with a key and can be decrypted by someone who holds the key. HTTPS uses TLS to encrypt HTTP traffic between browser and server. Database fields that must be recovered (not passwords) might be encrypted at rest with a key management service.',
      'Choosing wrong tool causes real harm: encrypting passwords implies you can decrypt them, which means an attacker who steals the key gets every password. Hashing passwords with bcrypt is the industry standard.',
    ],
    inProject:
      'bcrypt hashes user passwords in auth.controller.ts and auth.service.ts. DATABASE_URL and JWT_SECRET live in environment variables, never in git. Production traffic is encrypted by HTTPS on Vercel and Render.',
  },
  {
    id: 'security-injection',
    title: 'SQL injection',
    question: 'What is SQL injection and how do you prevent it?',
    answer: [
      'SQL injection happens when attacker-controlled input is concatenated into a SQL string. For example, a search term of \' OR 1=1 -- could change the meaning of a query and return rows the developer never intended, or worse, modify or delete data.',
      'Prevention means never building SQL by string interpolation with user input. Use parameterized queries or an ORM: you pass values as separate parameters and the database treats them as data, not executable SQL. Prisma\'s findMany({ where: { title: { contains: search } } }) uses prepared statements under the hood.',
      'ORMs do not eliminate all security work — you still validate input length and type — but they remove the most common injection footgun for day-to-day CRUD operations.',
    ],
    inProject:
      'All database access goes through Prisma with typed where objects. Product search passes the search string as a parameter to contains, never inside a raw SQL template string.',
  },
  {
    id: 'security-xss-csrf',
    title: 'XSS & CSRF',
    question: 'What are XSS and CSRF?',
    answer: [
      'Cross-Site Scripting (XSS) injects malicious JavaScript into a page another user views — for example, through a stored comment that contains a script tag. If the script runs in the victim\'s browser, it can steal data or perform actions as that user. React escapes text in JSX by default ({userInput} becomes text, not HTML). Avoid dangerouslySetInnerHTML unless you sanitize. HTTP-only auth cookies limit token theft even if XSS occurs.',
      'Cross-Site Request Forgery (CSRF) tricks a logged-in user\'s browser into sending an unwanted request to your API — for example, a hidden form on evil.com that POSTs to your bank. Defenses include SameSite cookie attributes, verifying Origin/Referer headers, and CSRF tokens for cookie-based session auth.',
      'Both attacks exploit trust: XSS abuses trust in rendered content; CSRF abuses the browser automatically sending cookies to your domain.',
    ],
    inProject:
      'Product titles and reviews render as plain text in JSX. authCookieOptions sets SameSite on the JWT cookie. CORS in main.ts restricts which origins may call the API with credentials.',
  },
  {
    id: 'security-cors',
    title: 'CORS',
    question: 'What is CORS and why do we need it?',
    answer: [
      'Cross-Origin Resource Sharing (CORS) is a browser security policy. JavaScript on https://myshop.vercel.app cannot read responses from https://api.render.com unless the API explicitly allows that origin via Access-Control-Allow-Origin. Without CORS headers, the browser blocks the frontend from seeing the response even if the server processed the request.',
      'When using cookie-based auth across origins, the server must also send Access-Control-Allow-Credentials: true and cannot use a wildcard * for Allow-Origin — it must name the exact frontend URL. The client must set credentials: "include" on fetch.',
      'CORS applies only in browsers. Tools like Postman, curl, or server-to-server calls are not restricted by CORS — which is why backend authorization guards remain essential.',
    ],
    inProject:
      'NestJS enableCors in main.ts whitelists FRONTEND_URL and local dev origins (localhost:3000). credentials: true allows the auth cookie on cross-origin requests from the Next.js frontend to the Render API.',
  },
  {
    id: 'css',
    title: 'CSS approaches & responsive design',
    question: 'Ways to style a frontend + mobile-first?',
    answer: [
      'There are several ways to style web apps. Raw CSS files give full control and match design handoffs from Figma or Photoshop — you write selectors, custom properties (CSS variables), and media queries yourself. SASS and LESS add nesting and mixins that compile to CSS. Utility frameworks like Tailwind apply small single-purpose classes (flex, p-4) directly in markup. CSS-in-JS (Styled Components) and component libraries (Chakra UI, Material UI) bundle styles with components or provide pre-built accessible widgets.',
      'Responsive web design means the layout adapts to screen size. Mobile-first means you write base styles for small screens, then use @media (min-width: …) to add rules for tablets and desktops — progressively enhancing rather than stripping desktop styles down.',
      'Design tokens (shared variables for colors, spacing, radii) keep the look consistent across pages without repeating hex codes everywhere.',
    ],
    inProject:
      'This shop uses custom CSS in globals.css with tokens like --color-accent and --radius-lg — not Tailwind in components. Breakpoints at 640px, 900px, and 1024px widen the product grid from two columns on mobile to four on desktop.',
  },
  {
    id: 'apis',
    title: 'API styles — REST, GraphQL, WebSocket',
    question: 'Compare REST, GraphQL, and WebSockets — use cases?',
    answer: [
      'REST models resources as URLs (/products, /orders/123) manipulated with HTTP verbs: GET reads, POST creates, PATCH updates partially, DELETE removes. It is simple, cacheable with standard HTTP, and widely understood — ideal for CRUD applications like an e-commerce catalog.',
      'GraphQL exposes a single endpoint where the client sends a query describing exactly which fields it needs. That reduces over-fetching for complex UIs but adds server complexity (schema, resolvers, query validation) and different caching patterns than REST.',
      'WebSockets open a persistent two-way connection for real-time data — chat, live notifications, collaborative editing. Message queues (RabbitMQ, Kafka) decouple services asynchronously and suit background jobs, not request/response user flows.',
    ],
    inProject:
      'The backend is a REST API built with NestJS controllers, documented in Swagger at /api/docs. GraphQL and WebSockets were not needed — product browsing and checkout are standard request/response flows without live server push.',
  },
  {
    id: 'orm',
    title: 'ORM vs raw SQL driver',
    question: 'Prisma/ORM vs native driver — pros and cons?',
    answer: [
      'An Object-Relational Mapping (ORM) tool like Prisma maps database tables to types in your programming language. You define a schema, run migrations to evolve the database, and write queries with a type-safe API instead of hand-written SQL strings. Development is faster and refactors are safer because the compiler catches broken field names.',
      'A native driver (e.g. node-postgres pg) executes raw SQL you write yourself. You gain maximum control for complex reports, performance tuning, and database-specific features, but you write more boilerplate and must manually prevent SQL injection with parameterized queries.',
      'Many production apps use an ORM for application code and drop to raw SQL for specific migrations, views, triggers, or analytics queries — a hybrid approach.',
    ],
    inProject:
      'Prisma models User, Product, Order, Cart, and related tables. Migrations live in prisma/migrations/. Some SQL migrations add PostgreSQL views and functions for product ratings and stock beyond basic CRUD.',
  },
  {
    id: 'testing',
    title: 'Unit, integration & E2E tests',
    question: 'What is the difference between unit, integration, and E2E tests?',
    answer: [
      'Unit tests exercise one function or class in isolation, with dependencies mocked (fake database, fake HTTP). They run fast and pinpoint failures precisely — ideal for business logic in services. Integration tests wire multiple real layers together, such as a NestJS service against a test database, to verify they cooperate correctly.',
      'End-to-end (E2E) tests automate a full user journey in a real browser with tools like Cypress or Playwright — visit homepage, click Shop, add to cart. They are slower and more brittle but closest to what users actually experience.',
      'The test pyramid suggests many unit tests, fewer integration tests, and a small set of critical E2E paths — balancing confidence with maintenance cost and CI runtime.',
    ],
    inProject:
      'Backend Jest specs cover ProductsService and OrdersService. Cypress E2E tests in frontend/cypress/e2e/ include smoke, shop, and auth flows. GitHub Actions ci.yml runs backend tests and frontend build on every push to main.',
  },
  {
    id: 'deployment',
    title: 'Deployment & CI/CD',
    question: 'What is CI/CD and why use it?',
    answer: [
      'Continuous Integration (CI) automatically runs tests and builds on every push or pull request. If someone breaks the build or fails a test, the team knows within minutes instead of discovering it on deploy day. Continuous Deployment (CD) extends this by automatically releasing to staging or production when CI passes.',
      'Benefits include fewer manual mistakes, reproducible releases, and faster feedback. A typical full-stack split hosts the database (Neon PostgreSQL), API (Render running NestJS), and frontend (Vercel serving Next.js) separately so each tier scales and deploys independently.',
      'Environment variables configure secrets and URLs per environment — never commit production credentials to git.',
    ],
    inProject:
      '.github/workflows/ci.yml runs npm test and npm run build for backend and frontend on main. Vercel deploys the frontend; Render builds and runs the API with start:prod.',
  },
  {
    id: 'extra-env',
    title: 'Environment variables',
    question: 'What are .env files for?',
    extra: true,
    answer: [
      'Environment variables store configuration and secrets outside source code — database connection strings, JWT secrets, API URLs, third-party keys. That lets the same codebase run locally, in staging, and in production with different values. .env files load variables in development; production platforms (Render, Vercel) set them in a dashboard.',
      'In Next.js, only variables prefixed NEXT_PUBLIC_ are exposed to browser JavaScript. Never put JWT_SECRET or DATABASE_URL in a NEXT_PUBLIC_ variable — any visitor could read them in the bundled client code.',
    ],
    inProject:
      'backend/.env.example documents required keys. Frontend uses NEXT_PUBLIC_API_URL for the API base. Production values are configured on Render and Vercel, not committed to the repository.',
  },
  {
    id: 'extra-rest',
    title: 'HTTP methods & status codes',
    question: 'Common HTTP verbs and status codes?',
    extra: true,
    answer: [
      'HTTP methods express intent: GET retrieves a resource without side effects; POST creates a new resource; PATCH applies a partial update; DELETE removes. RESTful design uses nouns in URLs (/products/:id) rather than verbs (/getProduct).',
      'Status codes communicate results: 200 OK for success, 201 Created after POST, 204 No Content when there is no body, 400 Bad Request for validation errors, 401 Unauthorized when not logged in, 403 Forbidden when logged in but not allowed, 404 Not Found, 500 Internal Server Error for unexpected server failures. Consistent codes help frontend and API clients handle errors programmatically.',
    ],
    inProject:
      'GET /products lists posters. POST /auth/login authenticates. PATCH /auth/profile updates the user. ValidationPipe returns 400 with messages; JwtAuthGuard returns 401 when the cookie is missing or invalid.',
  },
  {
    id: 'extra-next-routes',
    title: 'Next.js file-based routing',
    question: 'How does Next.js routing work?',
    extra: true,
    answer: [
      'Next.js App Router maps the app/ directory to URLs. app/page.tsx is the homepage (/). Nested folders create path segments; app/products/[id]/page.tsx is a dynamic route where id becomes a parameter. layout.tsx wraps all child routes in a segment — useful for shared chrome or auth checks.',
      'Optional files like loading.tsx show suspense UI while data loads; error.tsx catches runtime errors in that segment. Route groups (folders in parentheses) organize files without affecting the URL.',
    ],
    inProject:
      'Shop lives at app/products/page.tsx. Product detail uses app/products/[id]/page.tsx with params.id. The entire /admin/* tree shares admin/layout.tsx for the owner-area guard and subnav.',
  },
  {
    id: 'extra-guest-cart',
    title: 'Guest cart vs logged-in cart',
    question: 'How can a cart work without login?',
    extra: true,
    answer: [
      'Guests can shop without an account by storing cart items in browser localStorage on the client. The CartProvider reads and writes that structure locally. When the user logs in, the app can merge the guest cart into the server-side cart stored in PostgreSQL via the /cart API.',
      'Authenticated users get a persistent cart tied to their user ID in the database — it survives browser changes and device switches. Checkout may offer guest checkout (email only) or require an account, each with different DTO validation on the server.',
    ],
    inProject:
      'CartProvider in context/cart-context.tsx uses lib/guest-cart.ts for anonymous users and GET/POST /cart when authenticated. Checkout supports both guest and logged-in flows with separate NestJS DTOs.',
  },
  {
    id: 'extra-swagger',
    title: 'API documentation (Swagger)',
    question: 'Why document your API?',
    extra: true,
    answer: [
      'API documentation describes every endpoint, its parameters, request body shape, and response codes. Swagger (OpenAPI) generates interactive docs where you can try requests from the browser. That speeds up frontend development, onboarding, and exam demos because reviewers can explore the API without reading every controller file.',
      'In NestJS, decorators on controllers and DTO classes feed the Swagger document automatically when configured in main.ts.',
    ],
    inProject:
      'Swagger UI is available at /api/docs on the deployed API. It documents auth, products, cart, orders, and reviews with cookie auth support.',
  },
  {
    id: 'extra-db-relations',
    title: 'Database relationships',
    question: 'What are one-to-many and many-to-many?',
    extra: true,
    answer: [
      'Relational databases link tables with keys. One-to-many means one row in table A relates to many rows in table B — one Category has many Products, implemented by a categoryId foreign key on Product pointing to Category.id.',
      'Many-to-many requires a join table when both sides can relate to multiple records — User and Product for favorites: a Favorite table holds userId and productId pairs. Foreign keys enforce referential integrity so you cannot reference a product that does not exist.',
      'Prisma expresses these as relations in schema.prisma and lets you include related data in queries (include: { category: true }).',
    ],
    inProject:
      'Prisma schema links Product to Category, Order to OrderItems, and User to Favorite for saved posters. Orders snapshot product data in OrderItem so historical prices stay correct even if the catalog changes later.',
  },
];
