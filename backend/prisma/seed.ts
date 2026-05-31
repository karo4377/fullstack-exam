import * as bcrypt from 'bcrypt';
import { OrderStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CategoryTheme = {
  suffix: string;
  adjectives: string[];
  subjects: string[];
  description: (title: string) => string;
};

const CATEGORY_THEMES: Record<'prints' | 'stickers' | 'originals', CategoryTheme> = {
  prints: {
    suffix: 'Print',
    adjectives: ['Minimal', 'Pastel', 'Line Art', 'Scandi', 'Whimsical', 'Muted', 'Bold', 'Dreamy'],
    subjects: ['Forest', 'Mountains', 'Bicycle', 'Reading Nook', 'Wildflowers', 'Seaside', 'Rainbow', 'Terrazzo'],
    description: (title) => `${title} – giclée art print on premium paper, ready to frame.`,
  },
  stickers: {
    suffix: 'Sticker Set',
    adjectives: ['Matte', 'Waterproof', 'Mini', 'Pastel', 'Glow', 'Vintage', 'Cute', 'Bold'],
    subjects: ['Floral', 'Paw Prints', 'Stars', 'Fruit', 'Hearts', 'Letters', 'Clouds', 'Arrows'],
    description: (title) => `${title} – vinyl stickers for laptops, journals, and gifts.`,
  },
  originals: {
    suffix: 'Original',
    adjectives: ['Hand-painted', 'One-of-a-kind', 'Mini', 'Textured', 'Signed', 'Studio', 'Mixed Media'],
    subjects: ['Landscape', 'Still Life', 'Portrait Study', 'Abstract', 'Botanical', 'Coastal Scene', 'Cityscape'],
    description: (title) => `${title} – unique studio piece, shipped with care.`,
  },
};

function categoryKey(
  categoryId: string,
  printsId: string,
  stickersId: string,
  originalsId: string,
): 'prints' | 'stickers' | 'originals' {
  if (categoryId === stickersId) return 'stickers';
  if (categoryId === originalsId) return 'originals';
  return 'prints';
}

function buildGeneratedProduct(
  index: number,
  categoryId: string,
  printsId: string,
  stickersId: string,
  originalsId: string,
) {
  const key = categoryKey(categoryId, printsId, stickersId, originalsId);
  const theme = CATEGORY_THEMES[key];
  const adj = theme.adjectives[index % theme.adjectives.length];
  const subject = theme.subjects[(index * 3 + 1) % theme.subjects.length];
  const title = `${adj} ${subject} ${theme.suffix}`;
  const slug = `${key}-seed-${String(index + 1).padStart(2, '0')}`;
  return {
    slug,
    title,
    description: theme.description(title),
    priceCents: seedPriceForCategory(key, index),
    stock: 5 + (index % 25),
    categoryId,
    imageUrls: [placeholder(title.slice(0, 14))],
  };
}

const SEED_CUSTOMERS = [
  {
    email: 'customer@artshop.local',
    firstName: 'Demo',
    lastName: 'Customer',
    phone: '+45 12 34 56 78',
    addressLine1: 'Vesterbrogade 12',
    city: 'København V',
    postalCode: '1553',
    country: 'Denmark',
  },
  {
    email: 'emma@artshop.local',
    firstName: 'Emma',
    lastName: 'Nielsen',
    phone: '+45 20 11 22 33',
    addressLine1: 'Nørrebrogade 45',
    city: 'København N',
    postalCode: '2200',
    country: 'Denmark',
  },
  {
    email: 'noah@artshop.local',
    firstName: 'Noah',
    lastName: 'Larsen',
    phone: '+45 30 44 55 66',
    addressLine1: 'Strøget 8',
    city: 'København K',
    postalCode: '1160',
    country: 'Denmark',
  },
  {
    email: 'sofia@artshop.local',
    firstName: 'Sofia',
    lastName: 'Andersen',
    phone: '+45 40 77 88 99',
    addressLine1: 'Jægersborg Allé 3',
    city: 'Charlottenlund',
    postalCode: '2920',
    country: 'Denmark',
  },
  {
    email: 'lucas@artshop.local',
    firstName: 'Lucas',
    lastName: 'Pedersen',
    phone: '+45 50 12 34 56',
    addressLine1: 'Banegårdspladsen 1',
    city: 'Aarhus C',
    postalCode: '8000',
    country: 'Denmark',
  },
  {
    email: 'maya@artshop.local',
    firstName: 'Maya',
    lastName: 'Johansen',
    phone: '+45 60 98 76 54',
    addressLine1: 'Torvet 5',
    city: 'Odense C',
    postalCode: '5000',
    country: 'Denmark',
  },
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

/** Prices in øre — small/large prints, sticker sets, originals. */
const SEED_PRICES = {
  printSmall: 19995,
  printLarge: 44995,
  stickerSet: 9995,
  stickerSetSmall: 7995,
  originalMini: 129995,
  originalLarge: 249995,
} as const;

function seedPriceForCategory(key: 'prints' | 'stickers' | 'originals', index: number): number {
  switch (key) {
    case 'prints':
      return index % 2 === 0 ? SEED_PRICES.printSmall : SEED_PRICES.printLarge;
    case 'stickers':
      return index % 2 === 0 ? SEED_PRICES.stickerSetSmall : SEED_PRICES.stickerSet;
    case 'originals':
      return index % 3 === 0 ? SEED_PRICES.originalLarge : SEED_PRICES.originalMini;
  }
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
    const name = `${c.firstName} ${c.lastName}`;
    const user = await prisma.user.upsert({
      where: { email: c.email },
      create: {
        email: c.email,
        password: passwordHash,
        name,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        addressLine1: c.addressLine1,
        city: c.city,
        postalCode: c.postalCode,
        country: c.country,
        role: 'CUSTOMER',
      },
      update: {
        password: passwordHash,
        name,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        addressLine1: c.addressLine1,
        city: c.city,
        postalCode: c.postalCode,
        country: c.country,
      },
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
    { slug: 'cute-cat-print', title: 'Cute Cat Print', description: 'A lovely minimalist cat illustration. A3 print.', priceCents: SEED_PRICES.printLarge, stock: 20, categoryId: prints.id, imageUrls: [placeholder('Cat Print'), placeholder('Detail')] },
    { slug: 'sunset-dreams', title: 'Sunset Dreams', description: 'Soft pastel sunset art print. A3 size.', priceCents: SEED_PRICES.printLarge, stock: 15, categoryId: prints.id, imageUrls: [placeholder('Sunset'), placeholder('Frame')] },
    { slug: 'bunny-garden', title: 'Bunny Garden', description: 'Whimsical bunny in a flower garden. A4 print.', priceCents: SEED_PRICES.printSmall, stock: 30, categoryId: prints.id, imageUrls: [placeholder('Bunny', '7ba87b')] },
    { slug: 'coffee-lover', title: 'Coffee Lover', description: 'Minimal line art of a steaming cup. A4 print.', priceCents: SEED_PRICES.printSmall, stock: 25, categoryId: prints.id, imageUrls: [placeholder('Coffee', '6b5b55')] },
    { slug: 'moon-phase', title: 'Moon Phase', description: 'Elegant moon phase cycle illustration. A3 print.', priceCents: SEED_PRICES.printLarge, stock: 18, categoryId: prints.id, imageUrls: [placeholder('Moon')] },
    { slug: 'sticker-set-botanical', title: 'Botanical Sticker Set', description: 'Set of 6 vinyl stickers: leaves and flowers.', priceCents: SEED_PRICES.stickerSet, stock: 50, categoryId: stickers.id, imageUrls: [placeholder('Botanical', '7ba87b')] },
    { slug: 'sticker-set-cats', title: 'Cat Sticker Set', description: 'Set of 5 cute cat face stickers.', priceCents: SEED_PRICES.stickerSetSmall, stock: 45, categoryId: stickers.id, imageUrls: [placeholder('Cats')] },
    { slug: 'mini-original-abstract', title: 'Mini Original – Abstract', description: 'Small original acrylic painting, 10×10 cm.', priceCents: SEED_PRICES.originalMini, stock: 1, categoryId: originals.id, imageUrls: [placeholder('Original')] },
  ];

  for (let i = 0; i < 32; i++) {
    const categoryId = i % 5 === 0 ? originals.id : i % 3 === 0 ? stickers.id : prints.id;
    productData.push(buildGeneratedProduct(i, categoryId, prints.id, stickers.id, originals.id));
  }

  const seedSlugs = new Set(productData.map((p) => p.slug));
  const handcraftedSlugs = new Set([
    'cute-cat-print',
    'sunset-dreams',
    'bunny-garden',
    'coffee-lover',
    'moon-phase',
    'sticker-set-botanical',
    'sticker-set-cats',
    'mini-original-abstract',
  ]);
  const existingProducts = await prisma.product.findMany({ select: { id: true, slug: true } });
  for (const existing of existingProducts) {
    if (seedSlugs.has(existing.slug) || handcraftedSlugs.has(existing.slug)) continue;
    const isLegacyGenerated =
      /^[a-z]+-[a-z]+-\d+$/.test(existing.slug) ||
      /^(prints|stickers|originals)-/.test(existing.slug);
    if (isLegacyGenerated) {
      await prisma.product.delete({ where: { id: existing.id } }).catch(() => undefined);
    }
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

  const validProductIds = products.map((p) => p.id);
  const catalogById = new Map(products.map((p) => [p.id, p]));

  await prisma.favorite.deleteMany({ where: { productId: { notIn: validProductIds } } });
  await prisma.review.deleteMany({ where: { productId: { notIn: validProductIds } } });
  await prisma.cartItem.deleteMany({ where: { productId: { notIn: validProductIds } } });

  await syncOrderItemsToCatalog(validProductIds, catalogById);
  await removeUnreferencedLegacyProducts(seedSlugs, handcraftedSlugs);

  // Reviews — spread across customers and current catalogue
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

  // Order history — refresh seed customer orders to match current catalogue
  const seedCustomerIds = customers.map((c) => c.id);
  await prisma.order.deleteMany({ where: { userId: { in: seedCustomerIds } } });

  const statuses: OrderStatus[] = ['PAID', 'SHIPPED', 'PAID'];
  for (let ci = 0; ci < customers.length; ci++) {
    const customer = customers[ci];
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

  // Guest demo order — one shipped order with current product snapshots
  await prisma.order.deleteMany({ where: { guestEmail: 'guest@artshop.local' } });
  const guestItems = [
    products[0],
    products[3],
    products[8],
  ].map((p, idx) => ({
    productId: p.id,
    title: p.title,
    priceCents: p.priceCents,
    quantity: idx === 1 ? 2 : 1,
  }));
  await prisma.order.create({
    data: {
      guestEmail: 'guest@artshop.local',
      totalCents: guestItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: { create: guestItems },
    },
  });

  console.log(
    'Seed done:',
    products.length,
    'products;',
    customers.length,
    'customers (password customer123);',
    'admin admin@artshop.local / admin123;',
    'reviews, favourites, and orders synced to catalogue.',
  );
}

async function syncOrderItemsToCatalog(
  validProductIds: string[],
  catalogById: Map<string, { id: string; title: string; priceCents: number }>,
) {
  if (validProductIds.length === 0) return;

  const orderItems = await prisma.orderItem.findMany({ orderBy: { id: 'asc' } });
  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    const product = catalogById.get(item.productId);
    const target =
      product ?? catalogById.get(validProductIds[i % validProductIds.length])!;
    const needsUpdate =
      item.productId !== target.id ||
      item.title !== target.title ||
      item.priceCents !== target.priceCents;
    if (needsUpdate) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          productId: target.id,
          title: target.title,
          priceCents: target.priceCents,
        },
      });
    }
  }

  const orders = await prisma.order.findMany({ include: { items: true } });
  for (const order of orders) {
    const totalCents = order.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    if (totalCents !== order.totalCents) {
      await prisma.order.update({ where: { id: order.id }, data: { totalCents } });
    }
  }
}

async function removeUnreferencedLegacyProducts(
  seedSlugs: Set<string>,
  handcraftedSlugs: Set<string>,
) {
  const keepSlugs = new Set([...seedSlugs, ...handcraftedSlugs]);
  const candidates = await prisma.product.findMany({
    where: { slug: { notIn: [...keepSlugs] } },
    select: {
      id: true,
      slug: true,
      _count: { select: { orderItems: true, reviews: true, favorites: true, cartItems: true } },
    },
  });

  for (const product of candidates) {
    const refs =
      product._count.orderItems +
      product._count.reviews +
      product._count.favorites +
      product._count.cartItems;
    if (refs === 0) {
      await prisma.product.delete({ where: { id: product.id } }).catch(() => undefined);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
