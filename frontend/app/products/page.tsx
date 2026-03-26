'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { products as productsApi } from '@/lib/api';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const { data: list, isLoading, error } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsApi.list(search || undefined),
    staleTime: 60_000,
  });

  if (isLoading) return <main className="page">Loading…</main>;
  if (error) return <main className="page" style={{ color: 'var(--color-error)' }}>Error loading products.</main>;

  const products = Array.isArray(list) ? list : [];

  return (
    <main className="page">
      <h1 className="title-page">Products</h1>
      <input
        type="search"
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <ul className="product-grid">
        {products.map((p: Record<string, unknown>) => {
          const images = (p.images as Array<{ url: string }>) ?? [];
          const thumb = images[0]?.url;
          return (
            <li key={String(p.id)}>
              <Link href={`/products/${p.id}`} className="card card-link product-card">
                <div className="card-image-wrap">
                  {thumb ? (
                    <img src={thumb} alt="" className="card-image" />
                  ) : (
                    <div className="card-image card-image-placeholder" aria-hidden />
                  )}
                </div>
                <div className="card-body">
                  <span className="card-title">{String(p.title)}</span>
                  <p className="card-price">{(p.priceCents as number) / 100} €</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {products.length === 0 && <p className="empty-state">No products found.</p>}
    </main>
  );
}
