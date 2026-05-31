'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { products as productsApi, categories as categoriesApi } from '@/lib/api';

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('categoryId') ?? '';
  const collectionFromUrl = searchParams.get('collection') ?? '';
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(categoryFromUrl);

  useEffect(() => {
    setCategoryId(categoryFromUrl);
  }, [categoryFromUrl]);

  const setCategoryFilter = useCallback(
    (id: string) => {
      setCategoryId(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set('categoryId', id);
      else params.delete('categoryId');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
    staleTime: 300_000,
  });

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['products', search, categoryId, collectionFromUrl],
    queryFn: () =>
      productsApi.list({
        search: search || undefined,
        categoryId: categoryId || undefined,
        collection: collectionFromUrl || undefined,
      }),
    staleTime: 60_000,
  });

  const products = Array.isArray(list) ? list : [];
  const catList = Array.isArray(categories) ? categories : [];
  const activeCategory = catList.find((c) => c.id === categoryId);

  if (isLoading) {
    return (
      <div className="page">
        <PageHeader title="Products" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ color: 'var(--color-error)' }}>
        <PageHeader title="Products" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />
        <p>Error loading products.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title={activeCategory ? activeCategory.name : 'Products'}
        subtitle={
          activeCategory
            ? `Works in ${activeCategory.name}`
            : 'Prints and originals from our curated artists.'
        }
        breadcrumbs={
          activeCategory
            ? [
                { label: 'Home', href: '/' },
                { label: 'Products', href: '/products' },
                { label: activeCategory.name },
              ]
            : [{ label: 'Home', href: '/' }, { label: 'Products' }]
        }
      />
      <div className="products-filters">
        <label className="products-filter">
          <span className="products-filter-label">Search</span>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </label>
        <label className="products-filter">
          <span className="products-filter-label">Category</span>
          <select
            className="search-input"
            value={categoryId}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {catList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="product-grid">
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
      {products.length === 0 && <p className="empty-state">No products found.</p>}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="page">
          <p>Loading…</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
