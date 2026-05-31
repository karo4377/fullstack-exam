import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string, categoryId?: string, collection?: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      include: { images: { orderBy: { sortOrder: 'asc' } }, artist: true, category: true },
      orderBy:
        collection === 'new'
          ? { createdAt: 'desc' }
          : collection === 'bestsellers'
            ? { stock: 'asc' }
            : { createdAt: 'desc' },
      ...(collection === 'bestsellers' ? { take: 24 } : {}),
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: { images: { orderBy: { sortOrder: 'asc' } }, artist: true, category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  listAllForAdmin() {
    return this.prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdForAdmin(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: { title: string; slug: string; description: string; priceCents: number; stock: number; categoryId?: string; imageUrls: string[] }) {
    const urls = data.imageUrls?.length ? data.imageUrls : [];
    return this.prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        stock: data.stock,
        categoryId: data.categoryId,
        images: urls.length
          ? { create: urls.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
      },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      priceCents?: number;
      stock?: number;
      isActive?: boolean;
      categoryId?: string | null;
      imageUrls?: string[];
    },
  ) {
    const { imageUrls, ...rest } = data;
    if (imageUrls !== undefined) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (imageUrls.length > 0) {
        await this.prisma.productImage.createMany({
          data: imageUrls.map((url, i) => ({ productId: id, url, sortOrder: i })),
        });
      }
    }
    return this.prisma.product.update({
      where: { id },
      data: rest,
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
  }

  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { images: true, category: true },
    });
  }

  async deletePermanent(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { productId: id } });
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      return tx.product.delete({
        where: { id },
      });
    });
  }
}

