import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

/** Loads Express Request cookie typings from @types/cookie-parser */
import 'cookie-parser';

export interface JwtPayload {
  sub: string;
  role: string;
}

function jwtFromAuthCookie(req: Request): string | null {
  const token: unknown = req.cookies?.auth;
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: jwtFromAuthCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findPublicById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
