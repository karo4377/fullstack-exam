import * as bcrypt from 'bcrypt';
import { OrderStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adjectives = ['Cute', 'Soft', 'Dreamy', 'Pastel', 'Tiny', 'Cozy', 'Sunny', 'Moonlit', 'Floral', 'Minimal'];
const nouns = ['Cat', 'Bunny', 'Coffee', 'Garden', 'Cloud', 'Star', 'Leaf', 'Heart', 'Wave', 'House'];

const SEED_CUSTOMERS = [
  { email: 'customer@artshop.local', name: 'Demo Customer' },
  { email: 'emma@artshop.local', name: 'Emma Nielsen' },
  { email: 'noah@artshop.local', name: 'Noah Larsen' },
  { email: 'sofia@artshop.local', name: 'Sofia Andersen' },
  { email: 'lucas@artshop.local', name: 'Lucas Pedersen' },
  { email: 'maya@artshop.local', name: 'Maya Johansen' },
];

const REVIEW_COMMENTS = [
  'Lovely quality and fast delivery!',
  'Perfect for our nursery wall.',
  'Soft colours — exactly as pictured.',
  'Would order again.',
  'Beautiful print, well packaged.',
  null,
];

function placeholder(text: string, hue = 'c47b7b') {
  const label = encodeURIComponent(text.replace(/\s+/g, '+'));
  return `https://placehold.co/400x400/f5e0e0/${hue}?text=${label}`;
}

async function main() {
  const passwordHash = await bcrypt.hash('customer123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@artshop.local' },
    create: {
      email: 'admin@artshop.local',
      password: adminHash,
      name: 'Shop Owner',
      role: 'ADMIN',
    },
    update: { password: adminHash, role: 'ADMIN', name: 'Shop Owner' },
  });

  const customers: Array<{ id: string; email: string; name: string | null }> = [];
  for (const c of SEED_CUSTOMERS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      create: {
        email: c.email,
        password: passwordHash,
        name: c.name,
        role: 'CUSTOMER',
      },
      update: { password: passwordHash, name: c.name },
    });
    customers.push(user);
  }

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

  const products: Array<{ id: string; priceCents: number; title: string }> = [];
  for (const p of productData) {
    const { imageUrls, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: data,
      update: { title: p.title, description: p.description, priceCents: p.priceCents, stock: p.stock, categoryId: p.categoryId },
    });
    products.push({ id: product.id, priceCents: product.priceCents, title: product.title });
    const existingImages = await prisma.productImage.findMany({ where: { productId: product.id } });
    if (existingImages.length === 0 && imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url, idx) => ({ productId: product.id, url, sortOrder: idx })),
      });
    }
  }

  // Reviews — spread across customers and products
  for (let ci = 0; ci < customers.length; ci++) {
    const customer = customers[ci];
    const start = (ci * 4) % products.length;
    for (let r = 0; r < 4; r++) {
      const product = products[(start + r) % products.length];
      await prisma.review.upsert({
        where: { productId_userId: { productId: product.id, userId: customer.id } },
        create: {
          productId: product.id,
          userId: customer.id,
          rating: 3 + ((ci + r) % 3),
          comment: REVIEW_COMMENTS[(ci + r) % REVIEW_COMMENTS.length],
        },
        update: {
          rating: 3 + ((ci + r) % 3),
          comment: REVIEW_COMMENTS[(ci + r) % REVIEW_COMMENTS.length],
        },
      });
    }
  }

  // Favourites — 3 products per customer
  for (let ci = 0; ci < customers.length; ci++) {
    const customer = customers[ci];
    for (let f = 0; f < 3; f++) {
      const product = products[(ci * 5 + f * 2) % products.length];
      await prisma.favorite.upsert({
        where: { userId_productId: { userId: customer.id, productId: product.id } },
        create: { userId: customer.id, productId: product.id },
        update: {},
      });
    }
  }

  // Order history — 1–2 paid/shipped orders per customer (skip if they already have orders)
  const statuses: OrderStatus[] = ['PAID', 'SHIPPED', 'PAID'];
  for (let ci = 0; ci < customers.length; ci++) {
    const customer = customers[ci];
    const existingOrders = await prisma.order.count({ where: { userId: customer.id } });
    if (existingOrders > 0) continue;

    const orderCount = ci % 2 === 0 ? 2 : 1;
    for (let o = 0; o < orderCount; o++) {
      const p1 = products[(ci * 3 + o) % products.length];
      const p2 = products[(ci * 3 + o + 7) % products.length];
      const items = [
        { productId: p1.id, title: p1.title, priceCents: p1.priceCents, quantity: 1 },
        ...(o === 0
          ? [{ productId: p2.id, title: p2.title, priceCents: p2.priceCents, quantity: 2 }]
          : []),
      ];
      const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
      const daysAgo = 14 - ci * 2 - o * 3;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await prisma.order.create({
        data: {
          userId: customer.id,
          totalCents,
          status: statuses[(ci + o) % statuses.length],
          createdAt,
          items: { create: items },
        },
      });
    }
  }

  console.log(
    'Seed done:',
    products.length,
    'products;',
    customers.length,
    'customers (password customer123);',
    'admin admin@artshop.local / admin123;',
    'reviews, favourites, and orders created.',
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
