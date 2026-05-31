'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { favorites as favoritesApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function FavoritesPage() {
  const { user, loading } = useAuth();

  const { data: list = [], isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(),
    enabled: !!user && user.role === 'CUSTOMER',
    staleTime: 30_000,
  });

  if (loading) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user || user.role !== 'CUSTOMER') {
    return (
      <div className="page">
        <PageHeader
          title="Favourites"
          subtitle="Log in as a customer to save prints you love."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Favourites' }]}
        />
        <Link href="/login" className="btn btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Favourites"
        subtitle="Prints you have saved — ready when you are."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Favourites' },
        ]}
      />

      {isLoading && <p className="muted-text">Loading favourites…</p>}
      {error && <p className="form-error">Could not load favourites.</p>}

      {!isLoading && !error && list.length === 0 && (
        <p className="muted-text">
          No favourites yet.{' '}
          <Link href="/products" className="text-link">
            Browse the shop
          </Link>
          .
        </p>
      )}

      <div className="product-grid">
        {list.map((row) => {
          const p = row.product as {
            id: string;
            title: string;
            priceCents: number;
            category?: { name: string };
            images?: Array<{ url: string }>;
          };
          return (
            <ProductCard
              key={row.id}
              id={p.id}
              title={p.title}
              priceCents={p.priceCents}
              categoryName={p.category?.name}
              imageUrl={p.images?.[0]?.url}
            />
          );
        })}
      </div>
    </div>
  );
}
