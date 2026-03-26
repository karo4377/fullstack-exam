import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  const productData = [
    { slug: 'cute-cat-print', title: 'Cute Cat Print', description: 'A lovely minimalist cat illustration. A3 print.', priceCents: 1999, stock: 20, categoryId: prints.id, imageUrls: ['https://placehold.co/400x400/f5e0e0/c47b7b?text=Cat+Print', 'https://placehold.co/400x400/fff5f2/6b5b55?text=Detail'] },
    { slug: 'sunset-dreams', title: 'Sunset Dreams', description: 'Soft pastel sunset art print.', priceCents: 2499, stock: 15, categoryId: prints.id, imageUrls: ['https://placehold.co/400x400/f5e0e0/c47b7b?text=Sunset', 'https://placehold.co/400x400/fff5f2/c47b7b?text=Frame'] },
    { slug: 'bunny-garden', title: 'Bunny Garden', description: 'Whimsical bunny in a flower garden. A4 print.', priceCents: 1499, stock: 30, categoryId: prints.id, imageUrls: ['https://placehold.co/400x400/f5e0e0/7ba87b?text=Bunny'] },
    { slug: 'coffee-lover', title: 'Coffee Lover', description: 'Minimal line art of a steaming cup. Perfect for kitchen.', priceCents: 1299, stock: 25, categoryId: prints.id, imageUrls: ['https://placehold.co/400x400/f5e0e0/6b5b55?text=Coffee', 'https://placehold.co/400x400/fff5f2/c47b7b?text=Detail'] },
    { slug: 'moon-phase', title: 'Moon Phase', description: 'Elegant moon phase cycle illustration.', priceCents: 1799, stock: 18, categoryId: prints.id, imageUrls: ['https://placehold.co/400x400/fff5f2/6b5b55?text=Moon', 'https://placehold.co/400x400/f5e0e0/c47b7b?text=Close-up'] },
    { slug: 'sticker-set-botanical', title: 'Botanical Sticker Set', description: 'Set of 6 vinyl stickers: leaves and flowers.', priceCents: 899, stock: 50, categoryId: stickers.id, imageUrls: ['https://placehold.co/400x400/7ba87b/f5e0e0?text=Botanical', 'https://placehold.co/400x400/f5e0e0/7ba87b?text=Set'] },
    { slug: 'sticker-set-cats', title: 'Cat Sticker Set', description: 'Set of 5 cute cat face stickers.', priceCents: 799, stock: 45, categoryId: stickers.id, imageUrls: ['https://placehold.co/400x400/f5e0e0/c47b7b?text=Cats'] },
    { slug: 'mini-original-abstract', title: 'Mini Original – Abstract', description: 'Small original acrylic painting, 10×10 cm.', priceCents: 4999, stock: 1, categoryId: originals.id, imageUrls: ['https://placehold.co/400x400/c47b7b/f5e0e0?text=Original', 'https://placehold.co/400x400/6b5b55/fff5f2?text=Detail', 'https://placehold.co/400x400/f5e0e0/c47b7b?text=Side'] },
  ];

  for (const p of productData) {
    const { imageUrls, ...data } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: data,
      update: { title: p.title, description: p.description, priceCents: p.priceCents, stock: p.stock, categoryId: p.categoryId },
    });
    const existingImages = await prisma.productImage.findMany({ where: { productId: product.id } });
    if (existingImages.length === 0 && imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url, i) => ({ productId: product.id, url, sortOrder: i })),
      });
    }
  }

  console.log('Seed done: admin user (admin@artshop.local / admin123), categories, and', productData.length, 'products.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
