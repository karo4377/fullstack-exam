'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { formatDkk } from '@/lib/currency';
import { resolveProductImageSrc } from '@/lib/product-image';
import { FavoriteButton } from '@/components/favorite-button';
import { PageHeader } from '@/components/page-header';
import { products as productsApi, reviews as reviewsApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    staleTime: 60_000,
  });

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);
  const { data: reviewList = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.list(id),
    staleTime: 60_000,
  });

  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleAddToCart = async (qty: number) => {
    setAddStatus('loading');
    try {
      await addItem(id, qty);
      setAddStatus('done');
      setTimeout(() => setAddStatus('idle'), 2000);
    } catch {
      setAddStatus('idle');
    }
  };

  const submitReview = useMutation({
    mutationFn: () => reviewsApi.create(id, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    },
  });

  if (isLoading) return <main className="page">Loading…</main>;
  if (error || !product) return <main className="page" style={{ color: 'var(--color-error)' }}>Product not found.</main>;

  const title = String(product.title);
  const priceCents = Number(product.priceCents);
  const stock = Number(product.stock);
  const description = String(product.description ?? '');
  const category = product.category as { id?: string; name?: string; slug?: string } | null | undefined;
  const images = ((product.images as Array<{ url: string }>) ?? [])
    .map((i) => ({ url: resolveProductImageSrc(i?.url) }))
    .filter((i): i is { url: string } => !!i.url);

  return (
    <main className="page product-detail">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          ...(category?.id && category?.name
            ? [{ label: category.name, href: `/products?categoryId=${category.id}` }]
            : []),
          { label: title },
        ]}
      />
      {category?.name && (
        <div className="product-tags" aria-label="Categories">
          <Link
            href={category.id ? `/products?categoryId=${category.id}` : '/products'}
            className="product-tag"
          >
            {category.name}
          </Link>
        </div>
      )}
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
            <ImagePlaceholder label="No image" className="image-placeholder--gallery" />
          )}
        </div>
        <div className="product-detail-info">
          <p className="price">{formatDkk(priceCents)}</p>
          <FavoriteButton productId={id} />
          <p className="description">{description}</p>
          <p className={`stock ${stock > 0 ? 'stock--in' : 'stock--out'}`}>
            {stock > 0 ? 'In stock' : 'Out of stock'}
          </p>
      {user?.role !== 'ADMIN' && stock > 0 && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleAddToCart(1)}
          disabled={addStatus === 'loading'}
          style={{ marginTop: '0.5rem' }}
        >
          {addStatus === 'loading' ? 'Adding…' : addStatus === 'done' ? 'Added' : 'Add to cart'}
        </button>
      )}
      {user?.role === 'ADMIN' && (
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
          Admins don’t place orders. Use a customer account to buy.
        </p>
      )}
        </div>
      </div>

      <section className="product-reviews" style={{ marginTop: '2.5rem' }}>
        <h2 className="home-section-title">Reviews</h2>
        <ul className="list-plain">
          {(Array.isArray(reviewList) ? reviewList : []).map((r) => {
            const review = r as { id: string; rating?: number; comment?: string | null; user?: { name?: string } };
            return (
            <li key={String(review.id)} className="review-item">
              <strong>{'★'.repeat(Number(review.rating ?? 0))}</strong>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                {review.user?.name || 'Customer'}
              </span>
              {review.comment ? <p style={{ margin: '0.35rem 0 0' }}>{review.comment}</p> : null}
            </li>
            );
          })}
        </ul>
        {(Array.isArray(reviewList) ? reviewList : []).length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet.</p>
        )}
        {user?.role === 'CUSTOMER' && (
          <form
            className="card"
            style={{ padding: '1rem', marginTop: '1rem', maxWidth: '480px' }}
            onSubmit={(e) => {
              e.preventDefault();
              submitReview.mutate();
            }}
          >
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} stars</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment (optional)</label>
              <textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            {submitReview.isError && (
              <p className="form-error">{submitReview.error instanceof Error ? submitReview.error.message : 'Failed'}</p>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitReview.isPending}>
              {submitReview.isPending ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
