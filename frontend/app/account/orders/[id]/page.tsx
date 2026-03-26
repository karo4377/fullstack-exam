'use client';

import Link from 'next/link';
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

  const items = (order.items as Array<Record<string, unknown>>) ?? [];

  return (
    <main className="page product-detail">
      <Link href="/account/orders" className="back-link">← Orders</Link>
      <h1 className="title-page">Order {String(order.id).slice(0, 8)}…</h1>
      <p className="order-meta" style={{ marginBottom: '0.25rem' }}>Status: {String(order.status)}</p>
      <p className="price" style={{ marginBottom: '1rem' }}>Total: {(order.totalCents as number) / 100} €</p>
      <ul className="list-plain" style={{ marginTop: '1rem' }}>
        {items.map((item: Record<string, unknown>, i: number) => (
          <li key={i} className="cart-item">
            <span>{item.title} × {item.quantity}</span>
            <span className="card-price">{(Number(item.priceCents) * Number(item.quantity)) / 100} €</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
