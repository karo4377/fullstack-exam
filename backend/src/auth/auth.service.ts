import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { buildDisplayName } from '../users/user-profile.util';
import { UsersService } from '../users/users.service';

export type OAuthLoginResult = { user: User; isNew: boolean };

type OAuthProfile = {
  provider: string;
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive || !user.password) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    return user;
  }

  async findOrCreateOAuthUser(profile: OAuthProfile): Promise<OAuthLoginResult> {
    const email = profile.email.toLowerCase().trim();
    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerId,
        },
      },
      include: { user: true },
    });
    if (existingAccount?.user.isActive) {
      return { user: existingAccount.user, isNew: false };
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      if (!existingUser.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }
      await this.prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: profile.provider,
            providerAccountId: profile.providerId,
          },
        },
        create: {
          userId: existingUser.id,
          provider: profile.provider,
          providerAccountId: profile.providerId,
        },
        update: {},
      });
      return { user: existingUser, isNew: false };
    }

    const firstName = profile.firstName?.trim() || undefined;
    const lastName = profile.lastName?.trim() || undefined;
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        name: buildDisplayName(firstName, lastName),
        accounts: {
          create: {
            provider: profile.provider,
            providerAccountId: profile.providerId,
          },
        },
      },
    });
    return { user, isNew: true };
  }

  async signToken(userId: string, role: string) {
    return this.jwtService.signAsync({ sub: userId, role });
  }
}

