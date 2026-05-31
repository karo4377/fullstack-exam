'use client';

import Link from 'next/link';
import { formatDkk } from '@/lib/currency';
import { useQuery } from '@tanstack/react-query';
import { orders as ordersApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, loading } = useAuth();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!user,
  });

  if (loading || !user) {
    return (
      <main className="page">
        <p className="empty-state">Please <Link href="/login">log in</Link> to view this order.</p>
      </main>
    );
  }
  if (isLoading) return <main className="page">Loading…</main>;
  if (error || !order) return <main className="page" style={{ color: 'var(--color-error)' }}>Order not found.</main>;

  type OrderItem = { id?: string; title?: string; quantity?: number; priceCents?: number };
  const items = (order.items as OrderItem[]) ?? [];

  return (
    <main className="page product-detail">
      <Link href="/account/orders" className="back-link">← Orders</Link>
      <h1 className="title-page">Order {String(order.id).slice(0, 8)}…</h1>
      <p className="order-meta" style={{ marginBottom: '0.25rem' }}>Status: {String(order.status)}</p>
      <p className="price" style={{ marginBottom: '1rem' }}>Total: {formatDkk(Number(order.totalCents))}</p>
      <ul className="list-plain" style={{ marginTop: '1rem' }}>
        {items.map((item, i) => (
          <li key={item.id ?? i} className="cart-item">
            <span>{String(item.title ?? 'Item')} × {Number(item.quantity ?? 0)}</span>
            <span className="card-price">
              {formatDkk(Number(item.priceCents ?? 0) * Number(item.quantity ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
