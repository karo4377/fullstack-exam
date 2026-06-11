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

const IMAGE_LABELS = ['Poster', 'Room view'];

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

  if (isLoading) {
    return (
      <main className="page page--product-detail">
        <p className="products-status">Loading poster…</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="page page--product-detail">
        <PageHeader
          variant="compact"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/products' }]}
        />
        <div className="products-empty">
          <p className="products-empty-title">Poster not found</p>
          <p className="products-empty-text">It may have been removed or the link is incorrect.</p>
          <Link href="/products" className="btn btn-secondary btn-pill">
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const title = String(product.title);
  const priceCents = Number(product.priceCents);
  const stock = Number(product.stock);
  const description = String(product.description ?? '');
  const category = product.category as { id?: string; name?: string; slug?: string } | null | undefined;
  const images = ((product.images as Array<{ url: string }>) ?? [])
    .map((i) => ({ url: resolveProductImageSrc(i?.url) }))
    .filter((i): i is { url: string } => !!i.url);

  const reviews = Array.isArray(reviewList) ? reviewList : [];
  const inStock = stock > 0;

  const showNextImage = () => {
    if (images.length < 2) return;
    setSelectedImageIndex((i) => (i + 1) % images.length);
  };

  return (
    <main className="page page--product-detail product-detail">
      <PageHeader
        variant="compact"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/products' },
          ...(category?.id && category?.name
            ? [{ label: category.name, href: `/products?categoryId=${category.id}` }]
            : []),
          { label: title },
        ]}
      />

      <div className="product-detail-layout">
        <div className="product-gallery-column">
          <div className="product-gallery">
            {images.length > 0 ? (
              <div
                className={`product-gallery-main${images.length > 1 ? ' product-gallery-main--clickable' : ''}`}
                role={images.length > 1 ? 'button' : undefined}
                tabIndex={images.length > 1 ? 0 : undefined}
                aria-label={images.length > 1 ? 'Show next product image' : undefined}
                onClick={showNextImage}
                onKeyDown={(e) => {
                  if (images.length < 2) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showNextImage();
                  }
                }}
              >
                <img src={images[selectedImageIndex]?.url ?? images[0].url} alt={title} />
              </div>
            ) : (
              <ImagePlaceholder label="No image" className="image-placeholder--gallery" />
            )}
          </div>

          {images.length > 1 && (
            <div className="product-gallery-picker" role="tablist" aria-label="Product images">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  role="tab"
                  className={`product-gallery-picker-btn${selectedImageIndex === i ? ' is-selected' : ''}`}
                  onClick={() => setSelectedImageIndex(i)}
                  aria-label={`View ${IMAGE_LABELS[i] ?? `image ${i + 1}`}`}
                  aria-selected={selectedImageIndex === i}
                >
                  <img src={img.url} alt="" />
                  <span className="product-gallery-picker-label">
                    {IMAGE_LABELS[i] ?? `View ${i + 1}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-panel">
          {category?.name && (
            <Link
              href={category.id ? `/products?categoryId=${category.id}` : '/products'}
              className="products-category-pill product-detail-category"
            >
              {category.name}
            </Link>
          )}

          <h1 className="product-detail-title">{title}</h1>

          <div className="product-detail-price-row">
            <p className="price">{formatDkk(priceCents)}</p>
            <span className={`product-stock-badge${inStock ? ' product-stock-badge--in' : ' product-stock-badge--out'}`}>
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          {description && <p className="product-detail-description">{description}</p>}

          <ul className="product-detail-perks">
            <li>Premium paper, ready to frame</li>
            <li>Ships flat in protective packaging</li>
            <li>14-day returns on unused prints</li>
          </ul>

          <div className="product-detail-purchase">
            {user?.role !== 'ADMIN' && inStock && (
              <button
                type="button"
                className="btn btn-primary btn-pill product-detail-add"
                onClick={() => handleAddToCart(1)}
                disabled={addStatus === 'loading'}
              >
                {addStatus === 'loading' ? 'Adding…' : addStatus === 'done' ? 'Added to cart' : 'Add to cart'}
              </button>
            )}
            {user?.role !== 'ADMIN' && !inStock && (
              <p className="product-detail-unavailable">Currently out of stock — check back soon.</p>
            )}
            {user?.role === 'ADMIN' && (
              <div className="product-admin-actions">
                <Link href={`/admin/products/${id}/edit`} className="btn btn-primary btn-pill">
                  Edit product
                </Link>
                <p className="product-admin-note">Admins don’t place orders. Use a customer account to buy.</p>
              </div>
            )}
            <div className="product-detail-save">
              <FavoriteButton productId={id} />
            </div>
          </div>

          {category?.name && category?.id && (
            <Link
              href={`/products?categoryId=${category.id}`}
              className="product-detail-more"
            >
              More in {category.name}
            </Link>
          )}
        </div>
      </div>

      <section className="product-reviews" aria-labelledby="product-reviews-title">
        <header className="product-reviews-header">
          <h2 id="product-reviews-title" className="product-reviews-title">
            Reviews
          </h2>
          <p className="product-reviews-count">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </header>

        {reviews.length > 0 ? (
          <ul className="product-reviews-list">
            {reviews.map((r) => {
              const review = r as {
                id: string;
                rating?: number;
                comment?: string | null;
                user?: { name?: string };
              };
              return (
                <li key={String(review.id)} className="product-review-card">
                  <div className="product-review-card-head">
                    <span className="product-review-stars" aria-hidden>
                      {'★'.repeat(Number(review.rating ?? 0))}
                      <span className="visually-hidden">{review.rating} out of 5 stars</span>
                    </span>
                    <span className="product-review-author">{review.user?.name || 'Customer'}</span>
                  </div>
                  {review.comment ? <p className="product-review-comment">{review.comment}</p> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="product-reviews-empty">No reviews yet — be the first to share your thoughts.</p>
        )}

        {user?.role === 'CUSTOMER' && (
          <form
            className="product-review-form"
            onSubmit={(e) => {
              e.preventDefault();
              submitReview.mutate();
            }}
          >
            <h3 className="product-review-form-title">Write a review</h3>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment (optional)</label>
              <textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            {submitReview.isError && (
              <p className="form-error">
                {submitReview.error instanceof Error ? submitReview.error.message : 'Failed'}
              </p>
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
