'use client';

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { products as productsApi } from '@/lib/api';

const FEATURED_COUNT = 8;

const SLIDER_EDGE_TOLERANCE = 25;

function useSliderArrows(sliderRef: React.RefObject<HTMLDivElement | null>, hasProducts: boolean) {
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const isAtStart = scrollLeft <= SLIDER_EDGE_TOLERANCE;
    const isAtEnd = maxScroll <= SLIDER_EDGE_TOLERANCE || scrollLeft >= maxScroll - SLIDER_EDGE_TOLERANCE;
    setAtStart(isAtStart);
    setAtEnd(isAtEnd);
  }, [sliderRef]);

  useLayoutEffect(() => {
    if (!hasProducts) return;
    const el = sliderRef.current;
    if (!el) return;

    el.scrollLeft = 0;
    setAtStart(true);
    setAtEnd(el.scrollWidth <= el.clientWidth + SLIDER_EDGE_TOLERANCE);

    el.addEventListener('scroll', updateArrows);
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', updateArrows);
      ro.disconnect();
    };
  }, [hasProducts, updateArrows, sliderRef]);

  useEffect(() => {
    if (!hasProducts) return;
    const el = sliderRef.current;
    if (!el) return;
    const t = setTimeout(updateArrows, 200);
    return () => clearTimeout(t);
  }, [hasProducts, updateArrows, sliderRef]);

  return { atStart, atEnd };
}

export default function HomePage() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
    staleTime: 60_000,
  });

  const products = Array.isArray(list) ? list.slice(0, FEATURED_COUNT) : [];
  const { atStart, atEnd } = useSliderArrows(sliderRef, products.length > 0);

  const scrollSlider = (direction: 'prev' | 'next') => {
    const el = sliderRef.current;
    if (!el) return;
    const step = 280; // card width + gap
    el.scrollBy({ left: direction === 'prev' ? -step : step, behavior: 'smooth' });
  };

  return (
    <>
      <section className="home-hero">
        <h1 className="home-hero-title">Cute Art Shop</h1>
        <p className="home-hero-subtitle">
          Independent art and prints. Discover something special for your walls.
        </p>
        <div className="home-hero-cta">
          <Link href="/products" className="btn btn-primary">
            Browse all products
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Most popular</h2>
        {isLoading && <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>}
        {error && (
          <p style={{ color: 'var(--color-error)' }}>Could not load products. Try again later.</p>
        )}
        {!isLoading && !error && products.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>
            No products yet. <Link href="/products">Browse products</Link>.
          </p>
        )}
        {!isLoading && !error && products.length > 0 && (
          <div className="home-slider-wrap">
            <button
              type="button"
              className={`home-slider-btn home-slider-btn-prev${atStart ? ' home-slider-btn-disabled' : ''}`}
              onClick={() => !atStart && scrollSlider('prev')}
              disabled={atStart}
              aria-label="Previous products"
            >
              ‹
            </button>
            <button
              type="button"
              className={`home-slider-btn home-slider-btn-next${atEnd ? ' home-slider-btn-disabled' : ''}`}
              onClick={() => !atEnd && scrollSlider('next')}
              disabled={atEnd}
              aria-label="Next products"
            >
              ›
            </button>
            <div className="home-slider" ref={sliderRef}>
              {products.map((p: Record<string, unknown>) => {
                const images = (p.images as Array<{ url: string }>) ?? [];
                const thumb = images[0]?.url;
                return (
                  <div key={String(p.id)} className="home-slider-item">
                    <Link href={`/products/${p.id}`} className="card-link">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
