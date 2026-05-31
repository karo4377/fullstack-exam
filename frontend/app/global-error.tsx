'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="page" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <h1 className="title-page">Something went wrong</h1>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
            An unexpected error occurred. You can try again.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
