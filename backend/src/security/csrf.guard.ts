import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const EXEMPT_PATHS = new Set(['/auth/csrf']);

const EXEMPT_PATH_PREFIXES = [
  '/auth/google',
  '/auth/facebook',
];

function isExemptPath(path: string): boolean {
  if (EXEMPT_PATHS.has(path)) {
    return true;
  }
  return EXEMPT_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function tokensMatch(headerToken: string, cookieToken: string): boolean {
  if (headerToken.length !== cookieToken.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken));
}

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();

    if (!MUTATING_METHODS.has(method)) {
      return true;
    }

    const path = req.path;
    if (isExemptPath(path)) {
      return true;
    }

    const headerToken = req.headers[CSRF_HEADER_NAME];
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    if (
      typeof headerToken !== 'string' ||
      typeof cookieToken !== 'string' ||
      !tokensMatch(headerToken, cookieToken)
    ) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
