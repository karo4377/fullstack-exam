'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <div className="page">
      <nav className="admin-nav">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/products/new">Add product</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/orders">Orders</Link>
      </nav>
      {children}
    </div>
  );
}
