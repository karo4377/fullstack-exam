'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { resolveProductImageSrc } from '@/lib/product-image';
import { formatDkk } from '@/lib/currency';
import { useCart } from '@/context/cart-context';
import { registeredPerksNote } from '@/lib/site';
import { useAuth } from '@/context/auth-context';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, isLoading, removeItem, isGuest } = useCart();

  if (authLoading || isLoading) {
    return (
      <main className="page">
        <PageHeader title="Cart" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        <p className="muted-text">Loading cart…</p>
      </main>
    );
  }

  if (user?.role === 'ADMIN') {
    return (
      <main className="page">
        <PageHeader title="Cart" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        <p className="empty-state">
          Admins don’t place orders. Use a customer account to shop, or go to{' '}
          <Link href="/admin">Admin</Link> to manage the shop.
        </p>
      </main>
    );
  }

  const totalCents = items.reduce(
    (sum, item) => sum + (Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0)),
    0,
  );

  return (
    <main className="page">
      <PageHeader title="Cart" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
      {isGuest && (
        <div className="notice-banner" role="status">
          <p>
            You&apos;re checking out as a guest. Order history won&apos;t be saved to an account.{' '}
            {registeredPerksNote}{' '}
            <Link href="/register" className="text-link">
              Create an account
            </Link>{' '}
            or{' '}
            <Link href="/login" className="text-link">
              log in
            </Link>
            .
          </p>
        </div>
      )}
      {items.length === 0 ? (
        <p className="empty-state">
          Your cart is empty. <Link href="/products">Browse posters</Link>.
        </p>
      ) : (
        <>
          <ul className="list-plain cart-lines">
            {items.map((item) => {
              const imageSrc = resolveProductImageSrc(item.product?.images?.[0]?.url);
              return (
                <li key={item.id} className="cart-line">
                  <div className="cart-line-thumb">
                    {imageSrc ? (
                      <img src={imageSrc} alt="" />
                    ) : (
                      <ImagePlaceholder compact className="image-placeholder--thumb" />
                    )}
                  </div>
                  <div className="cart-line-body">
                    <strong>{item.product?.title ?? 'Product'}</strong>
                    <span className="muted-text">Qty {item.quantity}</span>
                  </div>
                  <div className="cart-line-price">
                    {formatDkk(Number(item.product?.priceCents ?? 0) * item.quantity)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeItem(item.id, item.productId)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <p style={{ marginTop: '1rem', fontWeight: 700 }}>Total: {formatDkk(totalCents)}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <Link href="/checkout" className="btn btn-primary">
              Checkout
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Continue shopping
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
