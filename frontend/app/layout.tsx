import type { ReactNode } from 'react';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

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

/** Avoid build-time static generation that waits on a sleeping Render API. */
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSansDisplay.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
