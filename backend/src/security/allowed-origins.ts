const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
] as const;

export function isLocalDevOrigin(value: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value);
}

export function getAllowedOrigins(): Set<string> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return new Set([frontendUrl, ...DEV_ORIGINS]);
}

/** True when Origin or Referer matches an allowed frontend origin. */
export function isAllowedRequestSource(value: string | undefined): boolean {
  if (!value) return false;

  const allowed = getAllowedOrigins();
  for (const origin of allowed) {
    if (value === origin || value.startsWith(`${origin}/`)) {
      return true;
    }
  }

  return process.env.NODE_ENV !== 'production' && isLocalDevOrigin(value);
}
