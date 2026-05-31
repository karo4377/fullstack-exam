import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adjectives = ['Cute', 'Soft', 'Dreamy', 'Pastel', 'Tiny', 'Cozy', 'Sunny', 'Moonlit', 'Floral', 'Minimal'];
const nouns = ['Cat', 'Bunny', 'Coffee', 'Garden', 'Cloud', 'Star', 'Leaf', 'Heart', 'Wave', 'House'];

function placeholder(text: string, hue = 'c47b7b') {
  const label = encodeURIComponent(text.replace(/\s+/g, '+'));
  return `https://placehold.co/400x400/f5e0e0/${hue}?text=${label}`;
}

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@artshop.local' },
    create: {
      email: 'admin@artshop.local',
      password: adminHash,
      name: 'Shop Admin',
      role: 'ADMIN',
    },
    update: { password: adminHash, role: 'ADMIN' },
  });

  const customerHash = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@artshop.local' },
    create: {
      email: 'customer@artshop.local',
      password: customerHash,
      name: 'Demo Customer',
      role: 'CUSTOMER',
    },
    update: { password: customerHash },
  });

  const prints = await prisma.category.upsert({
    where: { slug: 'prints' },
    create: { slug: 'prints', name: 'Prints' },
    update: {},
  });
  const stickers = await prisma.category.upsert({
    where: { slug: 'stickers' },
    create: { slug: 'stickers', name: 'Stickers' },
    update: {},
  });
  const originals = await prisma.category.upsert({
    where: { slug: 'originals' },
    create: { slug: 'originals', name: 'Originals' },
    update: {},
  });

  const productData: Array<{
    slug: string;
    title: string;
    description: string;
    priceCents: number;
    stock: number;
    categoryId: string;
    imageUrls: string[];
  }> = [
    { slug: 'cute-cat-print', title: 'Cute Cat Print', description: 'A lovely minimalist cat illustration. A3 print.', priceCents: 1999, stock: 20, categoryId: prints.id, imageUrls: [placeholder('Cat Print'), placeholder('Detail')] },
    { slug: 'sunset-dreams', title: 'Sunset Dreams', description: 'Soft pastel sunset art print.', priceCents: 2499, stock: 15, categoryId: prints.id, imageUrls: [placeholder('Sunset'), placeholder('Frame')] },
    { slug: 'bunny-garden', title: 'Bunny Garden', description: 'Whimsical bunny in a flower garden. A4 print.', priceCents: 1499, stock: 30, categoryId: prints.id, imageUrls: [placeholder('Bunny', '7ba87b')] },
    { slug: 'coffee-lover', title: 'Coffee Lover', description: 'Minimal line art of a steaming cup.', priceCents: 1299, stock: 25, categoryId: prints.id, imageUrls: [placeholder('Coffee', '6b5b55')] },
    { slug: 'moon-phase', title: 'Moon Phase', description: 'Elegant moon phase cycle illustration.', priceCents: 1799, stock: 18, categoryId: prints.id, imageUrls: [placeholder('Moon')] },
    { slug: 'sticker-set-botanical', title: 'Botanical Sticker Set', description: 'Set of 6 vinyl stickers: leaves and flowers.', priceCents: 899, stock: 50, categoryId: stickers.id, imageUrls: [placeholder('Botanical', '7ba87b')] },
    { slug: 'sticker-set-cats', title: 'Cat Sticker Set', description: 'Set of 5 cute cat face stickers.', priceCents: 799, stock: 45, categoryId: stickers.id, imageUrls: [placeholder('Cats')] },
    { slug: 'mini-original-abstract', title: 'Mini Original – Abstract', description: 'Small original acrylic painting, 10×10 cm.', priceCents: 4999, stock: 1, categoryId: originals.id, imageUrls: [placeholder('Original')] },
  ];

  for (let i = 0; i < 32; i++) {
    const adj = adjectives[i % adjectives.length];
    const noun = nouns[(i * 3) % nouns.length];
    const title = `${adj} ${noun} ${i + 1}`;
    const slug = `${adj}-${noun}-${i + 1}`.toLowerCase().replace(/\s+/g, '-');
    const categoryId = i % 5 === 0 ? originals.id : i % 3 === 0 ? stickers.id : prints.id;
    productData.push({
      slug,
      title,
      description: `${title} – art piece for your home. Limited stock.`,
      priceCents: 999 + (i % 20) * 100,
      stock: 5 + (i % 25),
      categoryId,
      imageUrls: [placeholder(title.slice(0, 12))],
    });
  }

  const productIds: string[] = [];
  for (const p of productData) {
    const { imageUrls, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: data,
      update: { title: p.title, description: p.description, priceCents: p.priceCents, stock: p.stock, categoryId: p.categoryId },
    });
    productIds.push(product.id);
    const existingImages = await prisma.productImage.findMany({ where: { productId: product.id } });
    if (existingImages.length === 0 && imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url, idx) => ({ productId: product.id, url, sortOrder: idx })),
      });
    }
  }

  const reviewTargets = productIds.slice(0, 12);
  for (let i = 0; i < reviewTargets.length; i++) {
    const productId = reviewTargets[i];
    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId: customer.id } },
    });
    if (!existing) {
      await prisma.review.create({
        data: {
          productId,
          userId: customer.id,
          rating: 3 + (i % 3),
          comment: i % 2 === 0 ? 'Lovely quality and fast delivery!' : null,
        },
      });
    }
  }

  console.log(
    'Seed done:',
    productData.length,
    'products, admin (admin@artshop.local / admin123), customer (customer@artshop.local / customer123)',
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
