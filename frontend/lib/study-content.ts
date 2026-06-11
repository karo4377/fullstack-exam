import { shopName } from '@/lib/site';

export type StudyCodeSnippet = {
  caption?: string;
  code: string;
};

export type StudySection = {
  id: string;
  title: string;
  /** Short exam-style question (optional — defaults to title) */
  question?: string;
  points: string[];
  inProject: string;
  snippets?: StudyCodeSnippet[];
  /** Shown in TOC with “(extra)” */
  extra?: boolean;
};

export const studyIntro =
  'Exam revision with plain-language answers and examples from this project.';

export const studySections: StudySection[] = [
  {
    id: 'spa',
    title: 'SPA — Single Page Applications',
    question: 'What is a SPA and how is it done in React?',
    points: [
      'A SPA loads one HTML shell once. After that, JavaScript swaps views instead of the browser doing a full page reload for every click.',
      'React builds the UI as a tree of components. When state or the route changes, React updates only the parts of the DOM that changed.',
      'Data is usually fetched with fetch/axios/React Query after the app loads, not embedded in every HTML page from the server.',
      'Pros: fast navigation, app-like feel. Cons: first load can be heavier; SEO needs extra care (SSR/SSG helps).',
    ],
    inProject:
      'The storefront is a Next.js React app. Clicking Shop or Cart uses client-side routing — the shell (header/footer) stays, only the main content changes. Product lists load with useQuery calling the NestJS API.',
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
    points: [
      'Split the UI into small pieces (buttons, cards, headers) with a clear props interface.',
      'Pass data and callbacks in via props; keep components focused on presentation or one job.',
      'Advantages: less copy-paste, consistent design, one place to fix bugs, easier testing.',
      'Compose larger screens from smaller blocks — e.g. a shop page = PageHeader + ProductCard grid.',
    ],
    inProject:
      'ProductCard, PageHeader, SiteHeader, and FavoriteButton are reused across home, shop, and account. Changing ProductCard updates every product grid at once.',
    snippets: [
      {
        caption: 'Typed props on ProductCard',
        code: `type ProductCardProps = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
  categoryName?: string;
};

export function ProductCard({ id, title, priceCents, ... }: ProductCardProps) {
  return (
    <article className="card product-card">
      ...
    </article>
  );
}`,
      },
    ],
  },
  {
    id: 'frontend-backend',
    title: 'Frontend ↔ backend communication',
    question: 'How does the frontend talk to the backend?',
    points: [
      'The browser sends HTTP requests (usually JSON) to API endpoints on another origin or port.',
      'The backend validates input, runs business logic, talks to the database, and returns JSON.',
      'The frontend never connects to Postgres directly — that would expose secrets and skip server-side checks.',
      'Use credentials: "include" when auth is stored in HTTP-only cookies so the browser sends them cross-origin (with CORS configured).',
    ],
    inProject:
      'frontend/lib/api.ts wraps fetch against NEXT_PUBLIC_API_URL (Render in production). All shop data goes through REST endpoints like GET /products and POST /auth/login.',
    snippets: [
      {
        caption: 'Shared API helper',
        code: `export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    ...options,
    credentials: 'include',  // send auth cookie
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
    points: [
      'CSR (client-side rendering): browser downloads JS, React runs in the browser, data is fetched there. Good for dashboards behind login.',
      'SSR (server-side rendering): server builds HTML per request — faster first paint, better SEO.',
      'SSG: HTML built at build time for static content.',
      'Next.js mixes both: Server Components by default; "use client" marks components that need hooks/browser APIs.',
    ],
    inProject:
      'Most shop pages use "use client" and fetch from the API in the browser. layout.tsx sets dynamic = "force-dynamic" so builds do not fail when the API is asleep. sitemap.ts runs on the server.',
    snippets: [
      {
        caption: 'Mark a page as client-rendered',
        code: `'use client';  // top of products/page.tsx — useState, useQuery allowed

// app/layout.tsx (server)
export const dynamic = 'force-dynamic';`,
      },
    ],
  },
  {
    id: 'javascript-scope',
    title: 'JavaScript variable scope',
    question: 'Explain var, let, const, and declaring nothing.',
    points: [
      'var — function-scoped, hoisted; can be redeclared. Avoid in modern code.',
      'let — block-scoped (inside if/for/{}), can be reassigned.',
      'const — block-scoped; the binding cannot be reassigned (but object/array contents can still change).',
      'No keyword — in sloppy mode creates a global on window. Never do this.',
    ],
    inProject:
      'The codebase uses const for imports and components, let only when a variable is reassigned. React state uses const with useState because you replace state via the setter, not by reassigning the variable.',
    snippets: [
      {
        caption: 'Examples',
        code: `const API_BASE = 'http://localhost:3001';  // preferred default

let retryCount = 0;
retryCount += 1;

const [search, setSearch] = useState('');  // const + setter, not search = 'x'`,
      },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript vs JavaScript',
    question: 'Why use TypeScript instead of plain JavaScript?',
    points: [
      'TypeScript adds optional static types checked at compile time before the app runs.',
      'Catches typos, wrong argument types, and missing properties early.',
      'Better autocomplete and safer refactoring in the IDE.',
      'Compiles down to JavaScript — browsers still run JS.',
    ],
    inProject:
      'Both frontend/ and backend/ use TypeScript. DTOs use class-validator decorators; React props are typed; Prisma generates types for database models.',
    snippets: [
      {
        caption: 'DTO validation types (backend)',
        code: `export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}`,
      },
    ],
  },
  {
    id: 'logging',
    title: 'Logging & Sentry',
    question: 'What should we log and why? (Sentry)',
    points: [
      'Log errors, slow requests, and unexpected states — not passwords, tokens, or card numbers.',
      'Why: reproduce bugs users hit in production, measure stability, alert the team.',
      'Sentry groups errors, shows stack traces, browser/OS, and release version.',
      'Frontend: uncaught React errors. Backend: unhandled exceptions in NestJS.',
    ],
    inProject:
      'Sentry is wired on NestJS (instrument.ts, SentryGlobalFilter) and Next.js (sentry.client.config.ts, global-error.tsx). Set SENTRY_DSN in production. Test endpoints exist to throw sample errors.',
    snippets: [
      {
        caption: 'Sentry init (shared options)',
        code: `export function getSentryInitOptions() {
  return {
    dsn: process.env.SENTRY_DSN,
    enabled: Boolean(process.env.SENTRY_DSN),
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  };
}`,
      },
    ],
  },
  {
    id: 'routing',
    title: 'Routing & protected routes',
    question: 'How does routing work and how do you protect routes?',
    points: [
      'Routing maps URLs to screens. Next.js App Router uses folders in app/ — e.g. app/products/page.tsx → /products.',
      'Protected routes: check auth on the client (redirect to login) AND on the server (guards) — never trust the client alone.',
      'JWT in HTTP-only cookie: browser sends it automatically; JS cannot read it (helps vs XSS stealing tokens).',
      'Role-based: after auth, check user.role === ADMIN before admin APIs and pages.',
    ],
    inProject:
      'Public: /, /products, /about. Login required for /account, /cart checkout. admin/layout.tsx redirects non-admins. Backend uses @UseGuards(JwtAuthGuard, RolesGuard) on cart, orders, and admin controllers.',
    snippets: [
      {
        caption: 'Admin layout guard (frontend)',
        code: `useEffect(() => {
  if (loading) return;
  if (!user || user.role !== 'ADMIN') {
    router.replace('/');
  }
}, [user, loading, router]);`,
      },
      {
        caption: 'JWT read from cookie (backend)',
        code: `jwtFromRequest: ExtractJwt.fromExtractors([
  (req) => req?.cookies?.auth ?? null,
]),`,
      },
    ],
  },
  {
    id: 'pagination',
    title: 'Pagination, filtering & sorting',
    question: 'Who handles pagination/filtering/sorting — frontend or backend? Why?',
    points: [
      'Filtering large datasets: backend (SQL/Prisma) — efficient indexes, less data over the network.',
      'Frontend: UI controls (search box, category pills, sort dropdown) and URL state so links are shareable.',
      'Sorting: backend when the full list is huge; frontend OK for small lists already loaded.',
      'Pagination: backend with ?page=2&limit=20 for big catalogs; client-side only for tiny lists.',
    ],
    inProject:
      'Search and category filters go to GET /products?search=…&categoryId=…. NestJS + Prisma build the WHERE clause. Sort by price/name is done client-side after fetch (fine for our catalog size) and stored in ?sort=price-asc.',
    snippets: [
      {
        caption: 'Backend filter (Prisma)',
        code: `return this.prisma.product.findMany({
  where: {
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
  },
  orderBy: { createdAt: 'desc' },
});`,
      },
      {
        caption: 'Frontend URL sync',
        code: `const params = new URLSearchParams(searchParams.toString());
if (id) params.set('categoryId', id);
router.replace(\`/products?\${params}\`, { scroll: false });`,
      },
    ],
  },
  {
    id: 'forms',
    title: 'Forms & input validation',
    question: 'How do forms and validation work?',
    points: [
      'Client validation: instant feedback (required fields, email format, password length).',
      'Server validation: mandatory for security — never trust the browser.',
      'Use DTOs + validation library on the backend; return 400 with clear messages.',
      'Controlled inputs: React state holds the value; onChange updates state.',
    ],
    inProject:
      'Login, register, checkout, and contact use controlled inputs. NestJS ValidationPipe + class-validator on RegisterDto, LoginDto, guest checkout, etc. Invalid bodies return 400.',
    snippets: [
      {
        caption: 'Global validation pipe',
        code: `app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // strip unknown fields
  forbidNonWhitelisted: true,
  transform: true,
}));`,
      },
      {
        caption: 'Controlled input (React)',
        code: `const [email, setEmail] = useState('');
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>`,
      },
    ],
  },
  {
    id: 'state',
    title: 'Global state vs props',
    question: 'When use props vs global state? Pros and cons?',
    points: [
      'Props: parent passes data down — simple, explicit, easy to follow. Con: prop drilling through many layers.',
      'Global state (React Context, Redux): shared data many components need — auth user, cart.',
      'Context con: harder to trace who updated state; overuse causes extra re-renders.',
      'Rule of thumb: props for local/tree data; context for truly app-wide concerns.',
    ],
    inProject:
      'AuthProvider and CartProvider wrap the app in providers.tsx. ProductCard gets title and price via props. SiteHeader reads cart count from CartContext without passing props through every page.',
    snippets: [
      {
        caption: 'Context provider pattern',
        code: `const AuthContext = createContext({ user: null, login: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);`,
      },
    ],
  },
  {
    id: 'caching',
    title: 'React Query caching',
    question: 'Explain stale time vs cache time (gcTime).',
    points: [
      'staleTime: how long fetched data is "fresh". While fresh, React Query will not refetch on mount.',
      'gcTime (formerly cacheTime): how long inactive query data stays in memory after no components use it.',
      'Stale data can still be shown instantly while a background refetch runs.',
      'queryKey identifies the cache entry — e.g. ["products", search, categoryId] refetches when filters change.',
    ],
    inProject:
      'Home products: staleTime 60_000 (1 min). Categories: 300_000 (5 min). Different keys for different filters invalidate correctly.',
    snippets: [
      {
        caption: 'Query with staleTime',
        code: `useQuery({
  queryKey: ['products', search, categoryId],
  queryFn: () => productsApi.list({ search, categoryId }),
  staleTime: 60_000,  // 1 minute "fresh"
});`,
      },
    ],
  },
  {
    id: 'retries',
    title: 'HTTP request retries',
    question: 'How do retries work and what are they good for?',
    points: [
      'Retry = automatically repeat a failed request (network blip, temporary 503).',
      'Good for resilience on read requests; be careful with POST (do not double-charge).',
      'React Query retries failed queries by default (3 times) with exponential backoff.',
      'You can configure retry per query or on the QueryClient.',
    ],
    inProject:
      'QueryClient in providers.tsx uses library defaults. Combined with staleTime, users may see cached products while a retry runs after a network error.',
    snippets: [
      {
        caption: 'Custom retry config (example)',
        code: `const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});`,
      },
    ],
  },
  {
    id: 'security-auth',
    title: 'Security — authentication',
    question: 'JWT vs sessions vs cookies — what is the difference?',
    points: [
      'Session (stateful): server stores session ID → user mapping in DB/Redis. Cookie holds session ID only.',
      'JWT (stateless): server signs a token with user id + role; no session store needed. Must handle expiry and revocation carefully.',
      'HTTP-only cookie: browser sends cookie automatically; JavaScript cannot read it — reduces XSS token theft.',
      'HTTPS: encrypts traffic so tokens/passwords are not sent in plain text.',
    ],
    inProject:
      'We use JWT stored in an HTTP-only auth cookie. Login calls signToken, sets res.cookie("auth", token). JwtStrategy reads req.cookies.auth. Passwords hashed with bcrypt — never stored plain text.',
    snippets: [
      {
        caption: 'Password hashing on register',
        code: `const hashed = await bcrypt.hash(dto.password, 10);
await prisma.user.create({ data: { email, password: hashed } });`,
      },
      {
        caption: 'Compare on login',
        code: `const valid = await bcrypt.compare(password, user.password);
if (!valid) throw new UnauthorizedException();`,
      },
    ],
  },
  {
    id: 'security-authz',
    title: 'Security — authorization',
    question: 'What is role-based authorization?',
    points: [
      'Authentication = who you are. Authorization = what you are allowed to do.',
      'Roles (CUSTOMER, ADMIN) restrict which API routes and pages you can access.',
      'Backend must check roles on every protected endpoint — frontend hide UI is not enough.',
    ],
    inProject:
      'RolesGuard reads @Roles("ADMIN") metadata and compares to req.user.role. Admin controller and cart/orders require JWT + correct role.',
    snippets: [
      {
        caption: 'Roles guard (backend)',
        code: `@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController { ... }`,
      },
    ],
  },
  {
    id: 'security-crypto',
    title: 'Hashing vs encryption',
    question: 'Hashing vs encryption — examples?',
    points: [
      'Hashing: one-way (passwords). Same input → same hash; cannot get password back. Use bcrypt + salt.',
      'Encryption: two-way (HTTPS/TLS). Data encrypted in transit; receiver decrypts with keys.',
      'Passwords: hash. Credit cards at rest: encrypt. Traffic: HTTPS.',
    ],
    inProject:
      'bcrypt for passwords. Production API and frontend served over HTTPS (Vercel/Render). DATABASE_URL is a secret in env vars, not in git.',
  },
  {
    id: 'security-injection',
    title: 'SQL injection',
    question: 'What is SQL injection and how do you prevent it?',
    points: [
      'Attacker puts SQL in input (e.g. \' OR 1=1 --) to change your query.',
      'Prevention: parameterized queries / ORM — never concatenate user input into SQL strings.',
      'Prisma uses prepared statements under the hood.',
    ],
    inProject:
      'All DB access goes through Prisma with typed where clauses — user search is passed as a parameter, not string-built SQL.',
    snippets: [
      {
        caption: 'Safe (Prisma)',
        code: `// User input in a parameter object — NOT in raw SQL string
where: { title: { contains: search, mode: 'insensitive' } }`,
      },
      {
        caption: 'Unsafe (never do this)',
        code: `// DON'T: \`SELECT * FROM products WHERE title = '\${search}'\``,
      },
    ],
  },
  {
    id: 'security-xss-csrf',
    title: 'XSS & CSRF',
    question: 'What are XSS and CSRF?',
    points: [
      'XSS: attacker injects script into your page (e.g. via comment). Mitigate: escape output, avoid dangerouslySetInnerHTML, CSP, HTTP-only cookies for tokens.',
      'CSRF: attacker tricks browser into sending authenticated request to your API. Mitigate: SameSite cookies, CSRF tokens for cookie auth, check Origin header.',
      'React escapes text in JSX by default — {userInput} is safe unless you use raw HTML.',
    ],
    inProject:
      'Product titles and reviews render as text in JSX. Auth cookie uses SameSite settings in authCookieOptions. CORS limits which origins can call the API with credentials.',
  },
  {
    id: 'security-cors',
    title: 'CORS',
    question: 'What is CORS and why do we need it?',
    points: [
      'Browsers block frontend (localhost:3000) from reading API (localhost:3001) unless the API allows that origin.',
      'Server responds with Access-Control-Allow-Origin and Allow-Credentials for cookie auth.',
      'CORS is a browser rule — Postman/curl are not restricted the same way.',
    ],
    inProject:
      'NestJS enableCors in main.ts whitelists FRONTEND_URL plus local dev origins. credentials: true so auth cookies work cross-origin.',
    snippets: [
      {
        caption: 'CORS config (backend)',
        code: `app.enableCors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.has(origin)) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
});`,
      },
    ],
  },
  {
    id: 'css',
    title: 'CSS approaches & responsive design',
    question: 'Ways to style a frontend + mobile-first?',
    points: [
      'Raw CSS: full control, matches Figma/Photoshop handoff — we use globals.css.',
      'SASS/LESS: CSS with variables, nesting, mixins — compiles to CSS.',
      'Bootstrap / Tailwind: utility or component classes — fast layout.',
      'Styled Components / Chakra UI: CSS-in-JS or ready-made accessible components.',
      'Mobile-first: base styles for small screens; @media (min-width: …) adds layout for tablet/desktop.',
    ],
    inProject:
      'Custom CSS in globals.css with design tokens (--color-accent, --radius-lg). Breakpoints at 640px, 900px, 1024px widen grids and nav. Product grid: 2 columns mobile → 4 on desktop.',
    snippets: [
      {
        caption: 'Mobile-first breakpoint',
        code: `.products-grid {
  grid-template-columns: repeat(2, 1fr);
}
@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}`,
      },
    ],
  },
  {
    id: 'apis',
    title: 'API styles — REST, GraphQL, WebSocket',
    question: 'Compare REST, GraphQL, and WebSockets — use cases?',
    points: [
      'REST: resources as URLs + HTTP verbs (GET/POST/PATCH/DELETE). Simple, cacheable, widely understood. Good for CRUD apps.',
      'GraphQL: one endpoint; client asks for exact fields. Flexible for complex UIs; more server complexity.',
      'WebSocket: persistent two-way connection. Real-time chat, live scores, notifications.',
      'Message queues (RabbitMQ etc.): async jobs between services — not needed for our shop size.',
    ],
    inProject:
      'REST with NestJS controllers + Swagger at /api/docs. No GraphQL or WebSockets — catalog + cart do not need real-time push.',
  },
  {
    id: 'orm',
    title: 'ORM vs raw SQL driver',
    question: 'Prisma/ORM vs native driver — pros and cons?',
    points: [
      'ORM (Prisma): schema as code, migrations, type-safe queries, faster development.',
      'Raw driver (pg): maximum control, hand-written SQL, best for complex reports or tuning.',
      'ORM con: heavy queries or exotic SQL can be awkward. Hybrid is common.',
    ],
    inProject:
      'Prisma models User, Product, Order, etc. Migrations in prisma/migrations/. Some PostgreSQL views/functions added in SQL migrations for ratings and stock.',
    snippets: [
      {
        caption: 'Prisma query',
        code: `const product = await prisma.product.findFirst({
  where: { id, isActive: true },
  include: { images: true, category: true },
});`,
      },
    ],
  },
  {
    id: 'testing',
    title: 'Unit, integration & E2E tests',
    question: 'What is the difference between unit, integration, and E2E tests?',
    points: [
      'Unit: one function/class in isolation — dependencies mocked. Fast, many tests.',
      'Integration: several layers together (e.g. service + real or test DB).',
      'E2E: full user flow in a browser (Cypress/Playwright) — slowest, closest to real usage.',
      'Test pyramid: many unit, fewer integration, few E2E.',
    ],
    inProject:
      'Backend Jest tests for ProductsService and OrdersService. Cypress in frontend/cypress/e2e/ — smoke, shop, auth. GitHub Actions runs backend tests + frontend build on push.',
    snippets: [
      {
        caption: 'Cypress smoke test idea',
        code: `cy.visit('/');
cy.contains('a', 'Shop').click();
cy.location('pathname').should('eq', '/products');`,
      },
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment & CI/CD',
    question: 'What is CI/CD and why use it?',
    points: [
      'CI (Continuous Integration): on every push — run tests and build to catch breaks early.',
      'CD (Continuous Deployment): if CI passes, deploy automatically to staging/production.',
      'Benefits: fewer manual mistakes, consistent releases, fast feedback for the team.',
      'Typical split: DB (Neon), API (Render), frontend (Vercel) — scale and deploy independently.',
    ],
    inProject:
      '.github/workflows/ci.yml runs backend npm test + build and frontend npm build on main. Vercel deploys frontend; Render runs the NestJS API.',
    snippets: [
      {
        caption: 'CI trigger (GitHub Actions)',
        code: `on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    steps:
      - run: npm ci
      - run: npm run test
      - run: npm run build`,
      },
    ],
  },
  // ——— Extra topics (good to mention in exam) ———
  {
    id: 'extra-env',
    title: 'Environment variables',
    question: 'What are .env files for?',
    extra: true,
    points: [
      'Store secrets and config outside code (API URLs, JWT_SECRET, DATABASE_URL).',
      'NEXT_PUBLIC_* vars are exposed to the browser; never put secrets there.',
      'Different values per environment: local, staging, production.',
    ],
    inProject:
      'backend/.env.example documents JWT_SECRET, DATABASE_URL, FRONTEND_URL. Frontend uses NEXT_PUBLIC_API_URL for the API base. Render/Vercel set these in the dashboard.',
  },
  {
    id: 'extra-rest',
    title: 'HTTP methods & status codes',
    question: 'Common HTTP verbs and status codes?',
    extra: true,
    points: [
      'GET — read. POST — create. PATCH — partial update. DELETE — remove.',
      '200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error.',
      'REST maps resources to nouns (/products/:id) not verbs (/getProduct).',
    ],
    inProject:
      'GET /products, POST /auth/login, PATCH /auth/profile, POST /orders (checkout). Validation errors return 400; missing auth returns 401.',
  },
  {
    id: 'extra-next-routes',
    title: 'Next.js file-based routing',
    question: 'How does Next.js routing work?',
    extra: true,
    points: [
      'app/page.tsx → /. app/products/page.tsx → /products. app/products/[id]/page.tsx → /products/123.',
      'layout.tsx wraps child routes — admin/layout.tsx protects all /admin/* pages.',
      'loading.tsx and error.tsx optional per segment.',
    ],
    inProject:
      'Shop at app/products/page.tsx. Product detail at app/products/[id]/page.tsx with params.id. Admin section shares admin/layout.tsx.',
  },
  {
    id: 'extra-guest-cart',
    title: 'Guest cart vs logged-in cart',
    question: 'How can a cart work without login?',
    extra: true,
    points: [
      'Guest cart: store product IDs in localStorage on the client; merge to server cart after login.',
      'Logged-in cart: persisted in database via API — survives devices.',
    ],
    inProject:
      'CartProvider uses localStorage (lib/guest-cart.ts) for guests and GET/POST /cart for authenticated users. Checkout can be guest or logged-in with different DTOs.',
  },
  {
    id: 'extra-swagger',
    title: 'API documentation (Swagger)',
    question: 'Why document your API?',
    extra: true,
    points: [
      'Interactive docs list endpoints, parameters, and response shapes.',
      'Helps frontend developers and exam reviewers test without reading all controllers.',
    ],
    inProject:
      'Swagger UI at https://fullstack-exam-49k7.onrender.com/api/docs — built from NestJS decorators and DTOs.',
  },
  {
    id: 'extra-db-relations',
    title: 'Database relationships',
    question: 'What are one-to-many and many-to-many?',
    extra: true,
    points: [
      'One-to-many: one category has many products (categoryId on Product).',
      'Many-to-many: often a join table (e.g. favorites: User ↔ Product).',
      'Foreign keys keep referential integrity.',
    ],
    inProject:
      'Prisma schema: Product belongs to Category; Order has many OrderItems; Favorite links User and Product.',
  },
];
