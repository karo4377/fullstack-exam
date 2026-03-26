'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { orders as ordersApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
    enabled: !!user && user.role !== 'ADMIN',
  });

  if (loading || !user) {
    return (
      <main className="page">
        <p className="empty-state">Please <Link href="/login">log in</Link> to view orders.</p>
      </main>
    );
  }
  if (user.role === 'ADMIN') {
    return (
      <main className="page">
        <h1 className="title-page">Order history</h1>
        <p className="empty-state">Admins don’t place orders. View shop orders in <Link href="/admin/orders">Admin → Orders</Link>.</p>
      </main>
    );
  }
  if (isLoading) return <main className="page">Loading orders…</main>;

  const list = Array.isArray(orders) ? orders : [];

  return (
    <main className="page">
      <h1 className="title-page">Order history</h1>
      {list.length === 0 ? (
        <p className="empty-state">No orders yet. <Link href="/products">Browse products</Link> and add to cart to checkout.</p>
      ) : (
        <ul className="list-plain">
          {list.map((order: Record<string, unknown>) => (
            <li key={String(order.id)} className="order-card">
              <Link href={`/account/orders/${order.id}`}>
                Order {String(order.id).slice(0, 8)}…
              </Link>
              <p className="order-meta">
                {(order.totalCents as number) / 100} € · {String(order.status)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
