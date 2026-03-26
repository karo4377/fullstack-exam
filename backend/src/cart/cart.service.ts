import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } } } },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } } } },
      });
    }
    return cart;
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new BadRequestException('Product not found');
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });
    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.stock);
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: true },
      });
    }
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: Math.min(quantity, product.stock),
      },
      include: { product: true },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });
    if (!item) throw new BadRequestException('Cart item not found');
    const newQty = Math.max(0, Math.min(quantity, item.product.stock));
    if (newQty === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return null;
    }
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQty },
      include: { product: true },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new BadRequestException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { success: true };
  }
}

