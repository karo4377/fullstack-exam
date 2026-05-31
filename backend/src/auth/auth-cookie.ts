import type { CookieOptions } from 'express';

export function authCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL ?? '';
  // Vercel frontend + Render API (or any cross-domain setup) needs SameSite=None.
  const crossSite =
    isProduction &&
    frontendUrl.length > 0 &&
    !frontendUrl.includes('onrender.com');

  return {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  };
}
