import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildDisplayName,
  normalizeOptional,
  publicUserSelect,
  type PublicUser,
} from './user-profile.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findPublicById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findFirst({
      where: { id, isActive: true },
      select: publicUserSelect,
    });
  }

  async updateProfile(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    },
  ): Promise<PublicUser> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { firstName: true, lastName: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    const nextFirstName =
      data.firstName !== undefined ? normalizeOptional(data.firstName) : existing.firstName;
    const nextLastName =
      data.lastName !== undefined ? normalizeOptional(data.lastName) : existing.lastName;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: normalizeOptional(data.firstName) } : {}),
        ...(data.lastName !== undefined ? { lastName: normalizeOptional(data.lastName) } : {}),
        ...(data.firstName !== undefined || data.lastName !== undefined
          ? { name: buildDisplayName(nextFirstName, nextLastName) }
          : {}),
        ...(data.phone !== undefined ? { phone: normalizeOptional(data.phone) } : {}),
        ...(data.addressLine1 !== undefined ? { addressLine1: normalizeOptional(data.addressLine1) } : {}),
        ...(data.addressLine2 !== undefined ? { addressLine2: normalizeOptional(data.addressLine2) } : {}),
        ...(data.city !== undefined ? { city: normalizeOptional(data.city) } : {}),
        ...(data.postalCode !== undefined ? { postalCode: normalizeOptional(data.postalCode) } : {}),
        ...(data.country !== undefined ? { country: normalizeOptional(data.country) } : {}),
      },
      select: publicUserSelect,
    });
  }

  listAll(excludeUserId?: string) {
    return this.prisma.user.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
  }

  async updateActive(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
  }
}

