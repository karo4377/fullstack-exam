import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

export const POSTER_CATEGORIES = [
  { slug: 'babar', name: 'Babar' },
  { slug: 'pippi-longstocking', name: 'Pippi Longstocking' },
  { slug: 'moomin', name: 'Moomin' },
  { slug: 'batman', name: 'Batman' },
  { slug: 'harry-potter', name: 'Harry Potter' },
  { slug: 'peter-rabbit', name: 'Peter Rabbit' },
  { slug: 'snoopy', name: 'Snoopy' },
  { slug: 'animals', name: 'Animals' },
  { slug: 'nursery', name: 'Nursery' },
];

const LEGACY_CATEGORY_SLUGS = ['prints', 'stickers', 'originals'];

/** @param {string} title */
export function inferCategorySlug(title) {
  const t = title.toLowerCase();
  if (t.includes('babar')) return 'babar';
  if (t.includes('pippi')) return 'pippi-longstocking';
  if (t.includes('moomin')) return 'moomin';
  if (t.includes('batman')) return 'batman';
  if (t.includes('harry potter')) return 'harry-potter';
  if (t.includes('peter rabbit')) return 'peter-rabbit';
  if (t.includes('snoopy')) return 'snoopy';
  if (
    /tigerunge|løve|\blove\b|giraffe|krokodille|kaniner|bunnies|bunny|flyvende kaniner/.test(t)
  ) {
    return 'animals';
  }
  return 'nursery';
}

export async function assignPosterCategories() {
  const prisma = new PrismaClient();
  const categoryBySlug = new Map();

  for (const cat of POSTER_CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { name: cat.name },
    });
    categoryBySlug.set(cat.slug, row.id);
  }

  const products = await prisma.product.findMany({
    select: { id: true, title: true, categoryId: true },
  });

  let updated = 0;
  for (const product of products) {
    const slug = inferCategorySlug(product.title);
    const categoryId = categoryBySlug.get(slug);
    if (!categoryId || product.categoryId === categoryId) continue;
    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId },
    });
    updated++;
  }

  for (const legacySlug of LEGACY_CATEGORY_SLUGS) {
    const legacy = await prisma.category.findUnique({ where: { slug: legacySlug } });
    if (!legacy) continue;
    const count = await prisma.product.count({ where: { categoryId: legacy.id } });
    if (count === 0) {
      await prisma.category.delete({ where: { id: legacy.id } });
      console.log(`Removed legacy category: ${legacySlug}`);
    }
  }

  await prisma.$disconnect();
  console.log(`Assigned poster categories to ${updated} products.`);
  return updated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  assignPosterCategories().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
