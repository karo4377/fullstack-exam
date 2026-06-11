import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const CAPTURE_SCRIPT_URL = 'https://mcp.figma.com/mcp/html-to-design/capture.js';

// Auth-sensitive screens only (skip huge /products listing)
const JOBS = [
  { mode: 'emma', path: '/', captureId: '6876ac03-fa86-4d75-a70e-1ab8de239da0' },
  { mode: 'emma', path: '/account', captureId: '13e6e7aa-bbac-49b4-84e7-05fd963bca4d' },
  { mode: 'emma', path: '/checkout', captureId: '7972da71-2075-45a0-bab4-106b922109d0' },
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
  // Fire capture; don't await full serialization (can hang 60s+ after submit succeeds).
  await page.evaluate(
    ({ captureId, endpoint }) => {
      void window.figma.captureForDesign({ captureId, endpoint, selector: 'body' });
    },
    { captureId, endpoint: endpoint(captureId) },
  );
  await page.waitForTimeout(12000);
}

async function loginAsEmma(context) {
  const res = await context.request.post('http://localhost:3001/auth/login', {
    data: { email: 'emma@artshop.local', password: 'customer123' },
  });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()} ${await res.text()}`);
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.account-nav-trigger', { timeout: 15000 });
  await page.waitForTimeout(1000);
  return page;
}

const browser = await chromium.launch({ headless: true });
try {
  let emmaPage = null;
  let emmaCtx = null;
  for (const job of JOBS) {
    if (job.mode === 'emma' && !emmaPage) {
      emmaCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      log('Logging in as Emma…');
      emmaPage = await loginAsEmma(emmaCtx);
    }
    const page =
      job.mode === 'emma'
        ? emmaPage
        : await (async () => {
            const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
            return ctx.newPage();
          })();
    log(`[${job.mode}] ${job.path}`);
    await page.goto(`${BASE}${job.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    await injectAndCapture(page, job.captureId);
    log(`[${job.mode}] done ${job.path}`);
    if (job.mode === 'guest') await page.context().close();
  }
  if (emmaCtx) await emmaCtx.close();
  log('Finished.');
} finally {
  await browser.close();
}
