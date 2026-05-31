'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { formatDkk } from '@/lib/currency';
import {
  formatOrderDate,
  formatOrderStatus,
  lineTotalCents,
  orderItemCount,
  orderShortId,
  orderStatusClass,
  type OrderItem,
  type OrderSummary,
} from '@/lib/orders';
import { orders as ordersApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, loading } = useAuth();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!user && user.role !== 'ADMIN',
  });

  if (loading || !user) {
    return (
      <div className="page">
        <p className="empty-state">
          Please <Link href="/login">log in</Link> to view this order.
        </p>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="page">
        <p className="empty-state">
          Admins don’t place orders. View shop orders in{' '}
          <Link href="/admin/orders">Admin → Orders</Link>.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page">
        <p className="muted-text">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page">
        <p className="form-error">Order not found.</p>
        <Link href="/account/orders" className="back-link">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const summary = order as OrderSummary;
  const items = (summary.items ?? []) as OrderItem[];
  const itemUnits = orderItemCount(items);

  return (
    <div className="page">
      <PageHeader
        title={`Order #${orderShortId(summary.id)}`}
        subtitle={`Placed ${formatOrderDate(summary.createdAt)}`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Orders', href: '/account/orders' },
          { label: `#${orderShortId(summary.id)}` },
        ]}
      />

      <div className="order-detail-grid">
        <section className="card order-detail-summary" aria-label="Order summary">
          <dl className="order-detail-facts">
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`order-status ${orderStatusClass(summary.status)}`}>
                  {formatOrderStatus(summary.status)}
                </span>
              </dd>
            </div>
            <div>
              <dt>Order date</dt>
              <dd>{formatOrderDate(summary.createdAt)}</dd>
            </div>
            <div>
              <dt>Items</dt>
              <dd>
                {itemUnits} {itemUnits === 1 ? 'item' : 'items'}
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd className="order-detail-total">{formatDkk(Number(summary.totalCents))}</dd>
            </div>
          </dl>
        </section>

        <section className="card order-detail-items" aria-labelledby="order-items-title">
          <h2 id="order-items-title" className="order-detail-section-title">
            Items in this order
          </h2>
          {items.length === 0 ? (
            <p className="muted-text">No line items recorded.</p>
          ) : (
            <ul className="order-detail-lines">
              {items.map((item, index) => (
                <li key={item.id ?? `${item.productId}-${index}`} className="order-detail-line">
                  <div className="order-detail-line-main">
                    <p className="order-detail-line-title">
                      {item.productId ? (
                        <Link href={`/products/${item.productId}`} className="text-link">
                          {String(item.title ?? 'Item')}
                        </Link>
                      ) : (
                        String(item.title ?? 'Item')
                      )}
                    </p>
                    <p className="order-detail-line-meta">
                      {formatDkk(Number(item.priceCents ?? 0))} each · Qty {Number(item.quantity ?? 0)}
                    </p>
                  </div>
                  <span className="order-detail-line-total">{formatDkk(lineTotalCents(item))}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="order-detail-grand-total">
            <span>Order total</span>
            <strong>{formatDkk(Number(summary.totalCents))}</strong>
          </div>
        </section>
      </div>

      <Link href="/account/orders" className="back-link order-detail-back">
        ← Back to orders
      </Link>
    </div>
  );
}
