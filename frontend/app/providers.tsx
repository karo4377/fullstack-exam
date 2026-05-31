'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

const queryClient = new QueryClient();

function HeaderFallback() {
  return (
    <header className="site-header site-header--placeholder" aria-hidden>
      <div className="site-header-banner" />
      <div className="site-header-main" style={{ minHeight: '3.25rem' }} />
    </header>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="site-shell">
            <Suspense fallback={<HeaderFallback />}>
              <SiteHeader />
            </Suspense>
            <main className="site-main">{children}</main>
            <SiteFooter />
          </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
