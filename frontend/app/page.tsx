'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { products as productsApi } from '@/lib/api';

const FEATURED_COUNT = 8;

export default function HomePage() {
  const { data: list, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
    staleTime: 60_000,
  });

  const products = Array.isArray(list) ? list.slice(0, FEATURED_COUNT) : [];

  return (
    <div className="home">
      <div className="page page--home">
        <PageHeader
          title="Art for little walls"
          subtitle="Soft prints and originals for kids' rooms — calm colours, simple shapes, and pieces you'd happily hang above a reading nook."
          actions={
            <>
              <Link href="/products" className="btn btn-primary btn-lg">
                Shop prints
              </Link>
              <Link href="/about" className="btn btn-secondary">
                Our story
              </Link>
            </>
          }
        />

        <section className="home-block" aria-labelledby="home-products-title">
          <header className="home-block-header">
            <h2 id="home-products-title" className="home-block-title">
              Popular prints
            </h2>
            <Link href="/products" className="home-block-link">
              View all products
            </Link>
          </header>

          {isLoading && <p className="home-status muted-text">Loading products…</p>}
          {error && (
            <p className="home-status form-error">Could not load products. Try again later.</p>
          )}
          {!isLoading && !error && products.length === 0 && (
            <p className="home-status muted-text">
              No products yet.{' '}
              <Link href="/products" className="text-link">
                Browse the shop
              </Link>
              .
            </p>
          )}
          {!isLoading && !error && products.length > 0 && (
            <ul className="home-product-grid">
              {products.map((p: Record<string, unknown>) => {
                const images = (p.images as Array<{ url: string }>) ?? [];
                const category = p.category as { name?: string } | null;
                return (
                  <li key={String(p.id)}>
                    <ProductCard
                      id={String(p.id)}
                      title={String(p.title)}
                      priceCents={p.priceCents as number}
                      imageUrl={images[0]?.url}
                      categoryName={category?.name}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <div className="page home-cta-inner">
          <div className="home-cta-copy">
            <h2 id="home-cta-title">Questions before you order?</h2>
            <p>Shipping, returns, and friendly help — we usually reply within a day.</p>
          </div>
          <div className="home-cta-actions">
            <Link href="/faq" className="btn btn-secondary">
              Read FAQ
            </Link>
            <Link href="/contact" className="btn btn-primary">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
