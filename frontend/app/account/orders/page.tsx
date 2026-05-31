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

function OrderItemsPreview({ items }: { items: OrderItem[] }) {
  if (items.length === 0) {
    return <p className="order-history-empty">No line items recorded.</p>;
  }

  return (
    <ul className="order-history-items">
      {items.map((item, index) => (
        <li key={item.id ?? `${item.productId}-${index}`} className="order-history-item">
          <span className="order-history-item-title">
            {item.productId ? (
              <Link href={`/products/${item.productId}`} className="text-link">
                {String(item.title ?? 'Item')}
              </Link>
            ) : (
              String(item.title ?? 'Item')
            )}
            <span className="order-history-item-qty"> × {Number(item.quantity ?? 0)}</span>
          </span>
          <span className="order-history-item-price">{formatDkk(lineTotalCents(item))}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderHistoryCard({ order }: { order: OrderSummary }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemUnits = orderItemCount(items);

  return (
    <article className="order-history-card">
      <header className="order-history-header">
        <div>
          <Link href={`/account/orders/${order.id}`} className="order-history-id">
            Order #{orderShortId(order.id)}
          </Link>
          <p className="order-history-date">{formatOrderDate(order.createdAt)}</p>
        </div>
        <span className={`order-status ${orderStatusClass(order.status)}`}>
          {formatOrderStatus(order.status)}
        </span>
      </header>

      <OrderItemsPreview items={items} />

      <footer className="order-history-footer">
        <span className="order-history-count">
          {itemUnits} {itemUnits === 1 ? 'item' : 'items'}
        </span>
        <strong className="order-history-total">{formatDkk(Number(order.totalCents))}</strong>
        <Link href={`/account/orders/${order.id}`} className="order-history-details-link text-link">
          View details
        </Link>
      </footer>
    </article>
  );
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
    enabled: !!user && user.role !== 'ADMIN',
  });

  if (loading || !user) {
    return (
      <div className="page">
        <PageHeader
          title="Order history"
          subtitle="Log in to see your past orders."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Account', href: '/account' },
            { label: 'Orders' },
          ]}
        />
        <p className="empty-state">
          Please <Link href="/login">log in</Link> to view orders.
        </p>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="page">
        <PageHeader
          title="Order history"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Account', href: '/account' },
            { label: 'Orders' },
          ]}
        />
        <p className="empty-state">
          Admins don’t place orders. View shop orders in{' '}
          <Link href="/admin/orders">Admin → Orders</Link>.
        </p>
      </div>
    );
  }

  const list = (Array.isArray(orders) ? orders : []) as OrderSummary[];

  return (
    <div className="page">
      <PageHeader
        title="Order history"
        subtitle="Your past purchases — items, status, and totals."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Orders' },
        ]}
      />

      {isLoading && <p className="muted-text">Loading orders…</p>}

      {!isLoading && list.length === 0 && (
        <p className="empty-state">
          No orders yet. <Link href="/products">Browse products</Link> and add to cart to checkout.
        </p>
      )}

      {!isLoading && list.length > 0 && (
        <div className="order-history-list">
          {list.map((order) => (
            <OrderHistoryCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
