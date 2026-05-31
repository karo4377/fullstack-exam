import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  listForProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(productId: string, userId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    try {
      return await this.prisma.review.create({
        data: {
          productId,
          userId,
          rating: dto.rating,
          comment: dto.comment?.trim() || null,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    } catch {
      throw new BadRequestException('You have already reviewed this product');
    }
  }
}

