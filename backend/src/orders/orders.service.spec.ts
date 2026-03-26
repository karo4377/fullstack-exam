import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    order: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    cart: { findUnique: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
    product: { update: jest.fn() },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listForUser', () => {
    it('should return orders for user', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: '1', userId: 'u1' }]);
      const result = await service.listForUser('u1');
      expect(result).toHaveLength(1);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createFromCart', () => {
    it('should throw when cart is empty', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 'c1', userId: 'u1', items: [] });
      await expect(service.createFromCart('u1')).rejects.toThrow(BadRequestException);
    });
  });
});
