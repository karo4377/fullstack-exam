import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  listProductIdsForUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
  }

  async add(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return null;
    }
    return this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  }

  remove(userId: string, productId: string) {
    return this.prisma.favorite.deleteMany({
      where: { userId, productId },
    });
  }
}
