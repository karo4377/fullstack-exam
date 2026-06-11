import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { shopFaviconSrc, shopName, shopTagline } from '@/lib/site';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

/** Avoid build-time static generation that waits on a sleeping Render API. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: shopName,
    template: `%s | ${shopName}`,
  },
  description: shopTagline,
  icons: {
    icon: shopFaviconSrc,
    apple: shopFaviconSrc,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
