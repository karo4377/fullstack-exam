'use client';

import type { ReactNode } from 'react';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

const dmSansDisplay = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSansDisplay.variable}`}>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <div className="site-shell">
                <SiteHeader />
                <main className="site-main">{children}</main>
                <SiteFooter />
              </div>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
