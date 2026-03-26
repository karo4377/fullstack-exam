'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { admin } from '@/lib/api';

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => admin.orders(),
  });

  if (isLoading) return <p>Loading orders…</p>;
  if (error) return <p className="form-error">Failed to load orders.</p>;

  const list = Array.isArray(orders) ? orders : [];

  return (
    <>
      <h1 className="title-page">Orders</h1>
      <p className="subtitle">All orders across the shop.</p>
      {list.length === 0 ? (
        <p className="empty-state">No orders yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o: Record<string, unknown>) => {
                const user = o.user as Record<string, unknown> | undefined;
                const items = (o.items as Array<Record<string, unknown>>) ?? [];
                const totalCents = items.reduce((sum, i) => sum + (Number(i.priceCents) || 0) * (Number(i.quantity) || 0), 0);
                return (
                  <tr key={String(o.id)}>
                    <td><code style={{ fontSize: '0.85em' }}>{String(o.id).slice(0, 12)}…</code></td>
                    <td>{user ? `${String(user.email ?? '')} ${String(user.name ?? '')}`.trim() || '—' : '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{String(o.status ?? '').toLowerCase()}</td>
                    <td>{(totalCents / 100).toFixed(2)}</td>
                    <td>{o.createdAt ? new Date(String(o.createdAt)).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
