import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { isAllowedRequestSource } from './allowed-origins';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const EXEMPT_PATH_PREFIXES = [
  '/auth/google',
  '/auth/facebook',
];

function isExemptPath(path: string): boolean {
  return EXEMPT_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

@Injectable()
export class OriginGuard implements CanActivate {
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

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Non-browser clients (curl, health checks) — CSRF does not apply.
    if (!origin && !referer) {
      return true;
    }

    const source = origin ?? referer;
    if (isAllowedRequestSource(source)) {
      return true;
    }

    throw new ForbiddenException('Invalid origin');
  }
}
