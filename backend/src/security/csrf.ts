import type { CookieOptions } from 'express';
import { authCookieOptions } from '../auth/auth-cookie';

export const CSRF_COOKIE_NAME = 'csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function csrfCookieOptions(): CookieOptions {
  return {
    ...authCookieOptions(),
    httpOnly: false,
  };
}
