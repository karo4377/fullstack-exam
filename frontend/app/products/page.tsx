'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { ProductCard } from '@/components/product-card';
import { products as productsApi, categories as categoriesApi } from '@/lib/api';

const PRODUCT_SORTS = ['newest', 'name-asc', 'name-desc', 'price-asc', 'price-desc'] as const;
type ProductSort = (typeof PRODUCT_SORTS)[number];

function isProductSort(value: string | null): value is ProductSort {
  return value !== null && (PRODUCT_SORTS as readonly string[]).includes(value);
}

function sortProducts(items: Record<string, unknown>[], sort: ProductSort) {
  const list = [...items];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => Number(a.priceCents) - Number(b.priceCents));
    case 'price-desc':
      return list.sort((a, b) => Number(b.priceCents) - Number(a.priceCents));
    case 'name-asc':
      return list.sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { sensitivity: 'base' }));
    case 'name-desc':
      return list.sort((a, b) => String(b.title).localeCompare(String(a.title), undefined, { sensitivity: 'base' }));
    default:
      return list;
  }
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('categoryId') ?? '';
  const collectionFromUrl = searchParams.get('collection') ?? '';
  const sortFromUrl = searchParams.get('sort');
  const sort: ProductSort = isProductSort(sortFromUrl) ? sortFromUrl : 'newest';
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

  const setSort = useCallback(
    (nextSort: ProductSort) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextSort === 'newest') params.delete('sort');
      else params.set('sort', nextSort);
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
  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);
  const catList = Array.isArray(categories) ? categories : [];
  const activeCategory = catList.find((c) => c.id === categoryId);

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
  };

  const hasFilters = Boolean(search.trim() || categoryId);

  const shopTitle = activeCategory ? activeCategory.name : 'Shop posters';
  const shopSubtitle = activeCategory
    ? `Children\u2019s wall art from the ${activeCategory.name} collection.`
    : 'Children\u2019s posters by character and theme — ready to frame.';
  const shopBreadcrumbs = activeCategory
    ? [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/products' },
        { label: activeCategory.name },
      ]
    : [{ label: 'Home', href: '/' }, { label: 'Shop' }];

  if (isLoading) {
    return (
      <div className="page page--products">
        <PageHeader title={shopTitle} subtitle={shopSubtitle} breadcrumbs={shopBreadcrumbs} />
        <p className="products-status">Loading posters…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page--products">
        <PageHeader title={shopTitle} subtitle={shopSubtitle} breadcrumbs={shopBreadcrumbs} />
        <p className="products-status products-status--error">Could not load products. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="page page--products">
      <PageHeader title={shopTitle} subtitle={shopSubtitle} breadcrumbs={shopBreadcrumbs} />

      <div className="products-toolbar">
        <label className="products-search">
          <Search size={18} className="products-search-icon" aria-hidden />
          <span className="visually-hidden">Search posters</span>
          <input
            type="search"
            placeholder="Search posters…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="products-search-input"
          />
        </label>

        <div className="products-categories" role="navigation" aria-label="Filter by category">
          <button
            type="button"
            className={`products-category-pill${categoryId === '' ? ' is-active' : ''}`}
            onClick={() => setCategoryFilter('')}
          >
            All
          </button>
          {catList.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`products-category-pill${categoryId === c.id ? ' is-active' : ''}`}
              onClick={() => setCategoryFilter(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="products-meta">
        <p className="products-count">
          {products.length} {products.length === 1 ? 'poster' : 'posters'}
          {activeCategory ? ` in ${activeCategory.name}` : ''}
        </p>
        <div className="products-sort">
          <label className="products-sort-label" htmlFor="products-sort">
            Sort by
          </label>
          <select
            id="products-sort"
            className="products-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSort)}
          >
            <option value="newest">Newest</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="name-desc">Name (Z–A)</option>
            <option value="price-asc">Price (low to high)</option>
            <option value="price-desc">Price (high to low)</option>
          </select>
        </div>
        {hasFilters && (
          <button type="button" className="products-clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {products.length > 0 ? (
        <ul className="products-grid">
          {sortedProducts.map((p: Record<string, unknown>) => {
            const images = (p.images as Array<{ url: string }>) ?? [];
            const category = p.category as { name?: string } | null;
            return (
              <li key={String(p.id)}>
                <ProductCard
                  id={String(p.id)}
                  title={String(p.title)}
                  priceCents={p.priceCents as number}
                  imageUrl={images[0]?.url}
                  categoryName={activeCategory ? undefined : category?.name}
                  uniformCategoryRow={!activeCategory}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="products-empty">
          <p className="products-empty-title">No posters found</p>
          <p className="products-empty-text">
            Try another search or browse a different category.
          </p>
          {hasFilters && (
            <button type="button" className="btn btn-secondary btn-pill" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="page page--products">
          <PageHeader
            title="Shop posters"
            subtitle="Children's posters by character and theme — ready to frame."
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shop' }]}
          />
          <p className="products-status">Loading posters…</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
