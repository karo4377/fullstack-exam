'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Package, User, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/context/auth-context';
import { userFirstName } from '@/lib/user-display';
import { shopName } from '@/lib/site';
import { formatSavedAddress, isProfileComplete, userFullName } from '@/lib/user-profile';

const ACCOUNT_TILES = [
  {
    href: '/account/profile',
    label: 'Profile & delivery',
    desc: 'Name, phone, and shipping address',
    icon: User,
  },
  {
    href: '/account/favorites',
    label: 'Favourites',
    desc: 'Prints you have saved',
    icon: Heart,
  },
  {
    href: '/account/orders',
    label: 'Order history',
    desc: 'Past orders and details',
    icon: Package,
  },
] as const;

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
      <div className="page account-page">
        <p className="muted-text">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page account-page">
        <PageHeader
          title="My account"
          subtitle="Sign in to save favourites, track orders, and checkout faster."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
        />
        <div className="account-guest-card card">
          <h2 className="account-guest-title">Welcome to {shopName}</h2>
          <p className="account-guest-text">
            Create a free account to keep your delivery details on file and pick up where you left off.
          </p>
          <ul className="account-guest-perks">
            <li>Saved profile for quick checkout</li>
            <li>Favourite prints in one place</li>
            <li>Order history whenever you need it</li>
          </ul>
          <div className="account-guest-actions">
            <Link href="/login" className="btn btn-primary">
              Log in
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="page account-page">
        <p className="muted-text">Redirecting…</p>
      </div>
    );
  }

  const firstName = userFirstName(user);
  const displayName = userFullName(user) || firstName;
  const savedAddress = formatSavedAddress(user);
  const profileComplete = isProfileComplete(user);

  return (
    <div className="page account-page">
      <PageHeader
        title={`Hi, ${firstName}!`}
        subtitle="Manage your details, favourites, and orders."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
      />

      {!profileComplete && (
        <div className="account-nudge notice-banner notice-banner--info" role="status">
          <p>
            <strong>Complete your profile</strong> — add your name and delivery address so checkout is
            pre-filled next time.{' '}
            <Link href="/account/profile" className="text-link">
              Update profile
            </Link>
          </p>
        </div>
      )}

      <div className="account-hub">
        <aside className="account-summary card" aria-label="Account summary">
          <p className="account-summary-eyebrow">Your account</p>
          <p className="account-summary-name">{displayName}</p>
          <p className="account-summary-email">{user.email}</p>
          {user.phone && <p className="account-summary-meta">{user.phone}</p>}
          {savedAddress ? (
            <p className="account-summary-address">{savedAddress}</p>
          ) : (
            <p className="account-summary-address account-summary-address--empty">
              No delivery address saved yet.
            </p>
          )}
          <Link href="/account/profile" className="btn btn-secondary btn-sm account-summary-action">
            Edit profile
          </Link>
        </aside>

        <div className="account-hub-main">
          <h2 className="account-section-title">Quick links</h2>
          <div className="account-tiles">
            {ACCOUNT_TILES.map(({ href, label, desc, icon: Icon }) => (
              <Link key={href} href={href} className="account-tile card card-link">
                <span className="account-tile-icon" aria-hidden>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className="account-tile-label">{label}</span>
                <span className="account-tile-desc">{desc}</span>
              </Link>
            ))}
          </div>

          <p className="account-shop-link">
            <Link href="/products" className="text-link account-shop-link-inner">
              Continue shopping
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
