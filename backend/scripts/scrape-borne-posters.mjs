/**
 * Scrape children's posters from posterstore.dk page 1.
 * Usage: node scripts/scrape-borne-posters.mjs [--import]
 */
import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { assignPosterCategories } from './poster-categories.mjs';

config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIST_URL = 'https://posterstore.dk/plakater/borneplakater/';
const CACHE_FILE = join(__dirname, 'borne-posters-cache.json');
const doImport = process.argv.includes('--import');

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/™/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'da-DK',
  });

  console.log('Loading listing page…');
  await page.goto(LIST_URL, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForTimeout(3000);

  const productLinks = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('a.pinterest-enabled[href*="/p/plakater/"]')];
    const seen = new Set();
    const items = [];
    for (const a of anchors) {
      const href = a.href.split('?')[0];
      if (seen.has(href)) continue;
      seen.add(href);
      const raw = a.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const title = raw
        .replace(/^-?\d+%\s*/i, '')
        .replace(/Fra\s+[\d,.]+\s*kr\.?[\d,.]*\s*kr\.?$/i, '')
        .trim();
      items.push({ url: href, title });
    }
    return items.slice(0, 48);
  });

  console.log(`Found ${productLinks.length} product links on listing page`);

  const posters = [];
  for (let i = 0; i < productLinks.length; i++) {
    const { url, title: listTitle } = productLinks[i];
    console.log(`[${i + 1}/${productLinks.length}] ${listTitle}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
      await page.waitForSelector('img[src*="media.posterstore"]', { timeout: 30_000 }).catch(() => undefined);
      await page.waitForTimeout(2000);

      const detail = await page.evaluate(() => {
        const pageTitle = document.querySelector('h1')?.textContent?.trim() || document.title.split('|')[0].trim();
        const candidates = [...document.querySelectorAll('img[src*="media.posterstore"]')];
        const seen = new Set();
        const scored = [];
        for (const img of candidates) {
          const src = img.src || img.getAttribute('data-src') || '';
          if (!src || src.includes('logo')) continue;
          const key = src.split('?')[0];
          if (seen.has(key)) continue;
          const w = img.naturalWidth || img.width || 0;
          const alt = img.alt || '';
          const isProductShot = alt.startsWith('Product image:') || alt.length > 20;
          if (w > 0 && w < 200 && !isProductShot) continue;
          seen.add(key);
          scored.push({ src, w, isProductShot });
        }
        scored.sort((a, b) => {
          if (a.isProductShot !== b.isProductShot) return a.isProductShot ? -1 : 1;
          return b.w - a.w;
        });
        const images = scored.slice(0, 2).map((s) => s.src);
        return { pageTitle, images };
      });

      const title = (detail.pageTitle || listTitle).replace(/\s+/g, ' ').trim();
      if (detail.images.length === 0) {
        console.warn(`  ⚠ No images found for ${title}`);
        continue;
      }
      posters.push({
        title,
        slug: slugify(title),
        sourceUrl: url,
        imageUrls: detail.images,
      });
      console.log(`  ✓ ${detail.images.length} image(s)`);
    } catch (err) {
      console.warn(`  ✗ Failed: ${err.message}`);
    }
  }

  await browser.close();
  writeFileSync(CACHE_FILE, JSON.stringify(posters, null, 2));
  console.log(`Saved ${posters.length} posters to ${CACHE_FILE}`);
  return posters;
}

function initCloudinary() {
  const url = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (url) {
    cloudinary.config({ secure: true });
    return true;
  }
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    return true;
  }
  return false;
}

async function uploadImage(url, publicId) {
  const result = await cloudinary.uploader.upload(url, {
    folder: 'tiny-frames/products/borne-posters',
    public_id: publicId,
    resource_type: 'image',
    overwrite: true,
  });
  return result.secure_url;
}

function displayTitle(raw) {
  return raw
    .replace(/\s*Plakat\s*$/i, ' Print')
    .replace(/\s*Poster\s*$/i, ' Print')
    .replace(/\s+/g, ' ')
    .trim();
}

async function importToDb(posters) {
  if (!initCloudinary()) {
    throw new Error('Cloudinary not configured in backend/.env');
  }

  const prisma = new PrismaClient();
  const prints = await prisma.category.upsert({
    where: { slug: 'prints' },
    create: { slug: 'prints', name: 'Prints' },
    update: {},
  });

  const existingPrints = await prisma.product.findMany({
    where: { categoryId: prints.id, isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true },
  });

  const usedSlugs = new Set();
  let updated = 0;

  for (let i = 0; i < posters.length; i++) {
    const poster = posters[i];
    let slug = poster.slug || slugify(poster.title);
    if (usedSlugs.has(slug)) slug = `${slug}-${i + 1}`;
    usedSlugs.add(slug);

    const target = existingPrints[i];
    const productSlug = target?.slug ?? slug;

    const hash = createHash('md5').update(productSlug).digest('hex').slice(0, 8);
    const cloudUrls = [];
    for (let j = 0; j < poster.imageUrls.length; j++) {
      const pid = `${productSlug}-${j + 1}-${hash}`;
      console.log(`  Uploading image ${j + 1} for ${poster.title}…`);
      cloudUrls.push(await uploadImage(poster.imageUrls[j], pid));
    }

    const title = displayTitle(poster.title);
    const priceCents = 19995 + (i % 3) * 5000;
    const product = target
      ? await prisma.product.update({
          where: { id: target.id },
          data: {
            title,
            description: `${title} – charming children's wall art print on premium paper, ready to frame.`,
            priceCents,
            stock: 12 + (i % 18),
            categoryId: prints.id,
            isActive: true,
          },
        })
      : await prisma.product.create({
          data: {
            slug: productSlug,
            title,
            description: `${title} – charming children's wall art print on premium paper, ready to frame.`,
            priceCents,
            stock: 12 + (i % 18),
            categoryId: prints.id,
            isActive: true,
          },
        });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: cloudUrls.map((url, idx) => ({
        productId: product.id,
        url,
        sortOrder: idx,
        alt: title,
      })),
    });
    updated++;
    console.log(`[${updated}/${posters.length}] ${product.title}`);
  }

  await prisma.$disconnect();
  console.log(`Imported ${updated} products.`);
}

async function removeUnscrapedProducts() {
  const prisma = new PrismaClient();
  const scraped = await prisma.product.findMany({
    where: { images: { some: { url: { contains: 'cloudinary.com' } } } },
    select: { id: true },
  });
  const scrapedIds = new Set(scraped.map((p) => p.id));

  const toRemove = await prisma.product.findMany({
    where: { id: { notIn: [...scrapedIds] } },
    select: { id: true, slug: true, title: true },
  });

  if (toRemove.length === 0) {
    console.log('No unscraped products to remove.');
    await prisma.$disconnect();
    return;
  }

  const ids = toRemove.map((p) => p.id);
  await prisma.orderItem.deleteMany({ where: { productId: { in: ids } } });
  await prisma.cartItem.deleteMany({ where: { productId: { in: ids } } });
  await prisma.product.deleteMany({ where: { id: { in: ids } } });

  console.log(`Removed ${toRemove.length} unscraped products:`);
  for (const p of toRemove) {
    console.log(`  - ${p.title} (${p.slug})`);
  }

  await prisma.$disconnect();
}

async function main() {
  if (process.argv.includes('--cleanup')) {
    await removeUnscrapedProducts();
    return;
  }

  let posters;
  if (existsSync(CACHE_FILE) && (process.argv.includes('--cache-only') || (doImport && !process.argv.includes('--rescrape')))) {
    console.log(`Loading ${CACHE_FILE}…`);
    posters = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  } else {
    posters = await scrape();
  }

  if (doImport) {
    await importToDb(posters);
    await removeUnscrapedProducts();
    await assignPosterCategories();
  } else {
    console.log('Run with --import to upload images and update the database.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
