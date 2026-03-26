'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { products as productsApi, cart as cartApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    staleTime: 60_000,
  });

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);
  const addToCart = useMutation({
    mutationFn: (qty: number) => cartApi.addItem(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  if (isLoading) return <main className="page">Loading…</main>;
  if (error || !product) return <main className="page" style={{ color: 'var(--color-error)' }}>Product not found.</main>;

  const title = String(product.title);
  const priceCents = Number(product.priceCents);
  const stock = Number(product.stock);
  const description = String(product.description ?? '');
  const images = ((product.images as Array<{ url: string }>) ?? []).filter((i) => i?.url);

  return (
    <main className="page product-detail">
      <Link href="/products" className="back-link">← Products</Link>
      <div className="product-detail-layout">
        <div className="product-gallery">
          {images.length > 0 ? (
            <>
              <div className="product-gallery-main">
                <img src={images[selectedImageIndex]?.url ?? images[0].url} alt={title} />
              </div>
              {images.length > 1 && (
                <div className="product-gallery-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`product-gallery-thumb ${selectedImageIndex === i ? 'is-selected' : ''}`}
                      onClick={() => setSelectedImageIndex(i)}
                      aria-label={`View image ${i + 1}`}
                      aria-pressed={selectedImageIndex === i}
                    >
                      <img src={img.url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="product-gallery-placeholder" aria-hidden />
          )}
        </div>
        <div className="product-detail-info">
          <h1 className="title-page">{title}</h1>
          <p className="price">{priceCents / 100} €</p>
          <p className="description">{description}</p>
          <p className="stock">In stock: {stock}</p>
      {user && user.role !== 'ADMIN' && stock > 0 && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => addToCart.mutate(1)}
          disabled={addToCart.isPending}
          style={{ marginTop: '0.5rem' }}
        >
          {addToCart.isPending ? 'Adding…' : 'Add to cart'}
        </button>
      )}
      {user?.role === 'ADMIN' && <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Admins don’t place orders. Use a customer account to buy.</p>}
      {!user && <p style={{ marginTop: '1rem' }}><Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>Log in</Link> to add to cart.</p>}
        </div>
      </div>
    </main>
  );
}
