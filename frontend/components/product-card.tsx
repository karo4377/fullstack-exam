'use client';

import Link from 'next/link';
import { FavoriteButton } from '@/components/favorite-button';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { formatDkk } from '@/lib/currency';
import { resolveProductImageSrc } from '@/lib/product-image';

type ProductCardProps = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
  categoryName?: string;
  showFavorite?: boolean;
};

export function ProductCard({
  id,
  title,
  priceCents,
  imageUrl,
  categoryName,
  showFavorite = true,
}: ProductCardProps) {
  const src = resolveProductImageSrc(imageUrl);

  return (
    <article className="card product-card">
      <div className="card-image-wrap">
        <Link href={`/products/${id}`} className="card-image-link" aria-label={`View ${title}`}>
          {src ? (
            <img src={src} alt="" className="card-image" />
          ) : (
            <ImagePlaceholder />
          )}
        </Link>
        {showFavorite && (
          <div className="product-card-favorite">
            <FavoriteButton productId={id} compact />
          </div>
        )}
      </div>
      <Link href={`/products/${id}`} className="card-body card-link">
        <span className="card-title">{title}</span>
        {categoryName && <p className="card-category">{categoryName}</p>}
        <p className="card-price">{formatDkk(priceCents)}</p>
      </Link>
    </article>
  );
}
