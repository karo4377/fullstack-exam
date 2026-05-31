import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAllForAdmin() {
    return this.prisma.order.findMany({
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });
    if (!order) throw new BadRequestException('Order not found');
    return order;
  }

  async createFromCart(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      let totalCents = 0;
      const orderItems: { productId: string; title: string; priceCents: number; quantity: number }[] = [];
      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new BadRequestException(`Insufficient stock for ${item.product.title}`);
        }
        totalCents += item.product.priceCents * item.quantity;
        orderItems.push({
          productId: item.product.id,
          title: item.product.title,
          priceCents: item.product.priceCents,
          quantity: item.quantity,
        });
      }
      const order = await tx.order.create({
        data: {
          userId,
          totalCents,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }

  async createGuestOrder(
    guestEmail: string,
    items: { productId: string; quantity: number }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      let totalCents = 0;
      const orderItems: { productId: string; title: string; priceCents: number; quantity: number }[] =
        [];

      for (const line of items) {
        const product = await tx.product.findFirst({
          where: { id: line.productId, isActive: true },
        });
        if (!product) {
          throw new BadRequestException(`Product not found: ${line.productId}`);
        }
        if (line.quantity > product.stock) {
          throw new BadRequestException(`Insufficient stock for ${product.title}`);
        }
        totalCents += product.priceCents * line.quantity;
        orderItems.push({
          productId: product.id,
          title: product.title,
          priceCents: product.priceCents,
          quantity: line.quantity,
        });
      }

      const order = await tx.order.create({
        data: {
          guestEmail,
          totalCents,
          status: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: true },
      });

      for (const line of orderItems) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }

      return order;
    });
  }
}

