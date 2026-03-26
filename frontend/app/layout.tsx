'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { DM_Sans, Fredoka } from 'next/font/google';
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/auth-context';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600'] });

const queryClient = new QueryClient();

function Nav() {
  const { user, loading, logout } = useAuth();
  return (
    <nav className="nav">
      <Link href="/" className="brand">Cute Art Shop</Link>
      <Link href="/products">Products</Link>
      {user ? (
        <>
          {user.role !== 'ADMIN' && (
            <>
              <Link href="/cart">Cart</Link>
              <Link href="/account/orders">Orders</Link>
            </>
          )}
          {user.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
          <span className="spacer" />
          <span className="user-email">{user.email}</span>
          <button type="button" className="btn-logout" onClick={() => logout()}>Log out</button>
        </>
      ) : !loading ? (
        <>
          <span className="spacer" />
          <Link href="/login">Log in</Link>
          <Link href="/register">Register</Link>
        </>
      ) : null}
    </nav>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fredoka.variable}`}>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

