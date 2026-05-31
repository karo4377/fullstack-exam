import { NextResponse } from 'next/server';

/** GET /api/sentry-test — triggers a test error when SENTRY_DSN is configured. */
export async function GET() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return NextResponse.json(
      { message: 'Set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN to enable Sentry.' },
      { status: 404 },
    );
  }
  throw new Error('Sentry test error (frontend API route)');
}
