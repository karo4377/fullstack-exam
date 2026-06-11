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
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService, type OAuthLoginResult } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { authCookieOptions } from './auth-cookie';
import { FacebookAuthGuard } from './facebook-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { buildDisplayName, normalizeOptional, publicUserSelect, splitFullName } from '../users/user-profile.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  private async finishOAuthLogin(result: OAuthLoginResult, res: Response) {
    const { user, isNew } = result;
    const token = await this.authService.signToken(user.id, user.role);
    res.cookie('auth', token, authCookieOptions());
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    let path = '/account';
    if (user.role === 'ADMIN') path = '/admin';
    else if (isNew) path = '/account/profile';
    res.redirect(`${frontendUrl}${path}`);
  }

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

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Passport redirects to Google.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    await this.finishOAuthLogin((req as Request & { user: OAuthLoginResult }).user, res);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookAuth() {
    // Passport redirects to Facebook.
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    await this.finishOAuthLogin((req as Request & { user: OAuthLoginResult }).user, res);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(dto.email);
    return {
      message:
        'If an account with that email exists, we have sent password reset instructions.',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Your password has been updated. You can log in now.' };
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

