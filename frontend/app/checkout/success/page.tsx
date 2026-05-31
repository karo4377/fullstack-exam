'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <main className="page">
      <PageHeader
        title="Order placed"
        subtitle="Thank you — we’ve received your order."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Order confirmed' }]}
      />
      {orderId && (
        <p className="muted-text">
          Reference: <strong>{orderId}</strong>
        </p>
      )}
      <p>
        You’ll receive a confirmation email if you checked out as a guest. Registered customers can
        view orders under{' '}
        <Link href="/account/orders" className="text-link">
          order history
        </Link>
        .
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/products" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link href="/" className="btn btn-secondary">
          Home
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<main className="page"><p>Loading…</p></main>}>
      <SuccessContent />
    </Suspense>
  );
}
