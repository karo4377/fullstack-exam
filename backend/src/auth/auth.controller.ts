import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { authCookieOptions } from './auth-cookie';
import { buildDisplayName, normalizeOptional, publicUserSelect, splitFullName } from '../users/user-profile.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const fromName = splitFullName(dto.name);
    const firstName = normalizeOptional(dto.firstName) ?? fromName.firstName;
    const lastName = normalizeOptional(dto.lastName) ?? fromName.lastName;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: buildDisplayName(firstName, lastName),
        firstName,
        lastName,
      },
      select: publicUserSelect,
    });
    const token = await this.authService.signToken(user.id, user.role);
    res.cookie('auth', token, authCookieOptions());
    return user;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.signToken(user.id, user.role);
    res.cookie('auth', token, authCookieOptions());
    const profile = await this.usersService.findPublicById(user.id);
    if (!profile) throw new UnauthorizedException();
    return profile;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth', authCookieOptions());
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    return (req as Request & { user: unknown }).user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = (req as Request & { user: { id: string; role: string } }).user;
    if (user.role !== 'CUSTOMER') {
      throw new UnauthorizedException('Only customers can update a profile');
    }
    return this.usersService.updateProfile(user.id, dto);
  }
}

