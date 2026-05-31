'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/context/auth-context';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <PageHeader
          title="My account"
          subtitle="Log in to view orders and checkout."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
        />
        <div className="account-guest">
          <Link href="/login" className="btn btn-primary">
            Log in
          </Link>
          <Link href="/register" className="btn btn-secondary">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="page">
        <p>Redirecting to admin…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="My account"
        subtitle={`Signed in as ${user.email}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
      />
      <ul className="account-links">
        <li>
          <Link href="/account/profile" className="account-link-card">
            <span className="account-link-title">Profile & delivery</span>
            <span className="account-link-desc">Name, phone, and address for faster checkout</span>
            <span className="account-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link href="/account/favorites" className="account-link-card">
            <span className="account-link-title">Favourites</span>
            <span className="account-link-desc">Saved prints you want to keep</span>
            <span className="account-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link href="/account/orders" className="account-link-card">
            <span className="account-link-title">Order history</span>
            <span className="account-link-desc">View past orders and details</span>
            <span className="account-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link href="/cart" className="account-link-card">
            <span className="account-link-title">Cart</span>
            <span className="account-link-desc">Review items before checkout</span>
            <span className="account-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link href="/checkout" className="account-link-card">
            <span className="account-link-title">Checkout</span>
            <span className="account-link-desc">Complete your purchase</span>
            <span className="account-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link href="/products" className="account-link-card">
            <span className="account-link-title">Continue shopping</span>
            <span className="account-link-desc">Browse prints and originals</span>
            <span className="account-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
