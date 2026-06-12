import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const API = 'http://localhost:3001';
const CAPTURE_SCRIPT_URL = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

const JOBS = [
  { path: '/', captureId: 'dad7f360-8ab7-4933-895b-a34de67bbe03', label: 'Home' },
  { path: '/products', captureId: 'cef21b5f-0aba-4e73-a0dd-8f65f5b25970', label: 'Products' },
  {
    path: '/products/cmq9qkruv00429yv71ai1ezkl',
    captureId: '44756938-7244-4d06-8542-6c2742ac27a9',
    label: 'Product detail',
  },
  { path: '/about', captureId: 'ffba889a-3fc6-4c21-af5f-5db2cb75793d', label: 'About' },
  { path: '/contact', captureId: '0ac3764d-6da7-49d7-8fab-f2a3bb4f39d5', label: 'Contact' },
  { path: '/admin', captureId: '0da92dcf-d8db-4be9-a4db-5761282c3b07', label: 'Admin dashboard', admin: true },
  {
    path: '/admin/products',
    captureId: '390ee85f-f028-4de4-9b93-0514c1346390',
    label: 'Admin products',
    admin: true,
  },
];

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function endpoint(captureId) {
  return `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
}

async function injectAndCapture(page, captureId) {
  const scriptRes = await page.context().request.get(CAPTURE_SCRIPT_URL);
  await page.evaluate((s) => {
    const el = document.createElement('script');
    el.textContent = s;
    document.head.appendChild(el);
  }, await scriptRes.text());
  await page.waitForTimeout(800);
  await page.evaluate(
    ({ captureId, endpoint }) => {
      void window.figma.captureForDesign({ captureId, endpoint, selector: 'body' });
    },
    { captureId, endpoint: endpoint(captureId) },
  );
  await page.waitForTimeout(14000);
}

async function loginAsAdmin(context) {
  const res = await context.request.post(`${API}/auth/login`, {
    data: { email: 'admin@artshop.local', password: 'admin123' },
  });
  if (!res.ok()) throw new Error(`Admin login failed: ${res.status()} ${await res.text()}`);
}

const browser = await chromium.launch({ headless: true });
try {
  let adminCtx = null;
  let adminPage = null;

  for (const job of JOBS) {
    if (job.admin && !adminPage) {
      adminCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      log('Logging in as admin…');
      await loginAsAdmin(adminCtx);
      adminPage = await adminCtx.newPage();
    }

    const ctx = job.admin
      ? adminCtx
      : await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = job.admin ? adminPage : await ctx.newPage();

    log(`[capture] ${job.label} → ${job.path}`);
    await page.goto(`${BASE}${job.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(job.path.includes('/products') ? 5000 : 3500);
    await injectAndCapture(page, job.captureId);
    log(`[done] ${job.label}`);

    if (!job.admin) await ctx.close();
  }

  if (adminCtx) await adminCtx.close();
  log('All v2 captures submitted.');
} finally {
  await browser.close();
}
