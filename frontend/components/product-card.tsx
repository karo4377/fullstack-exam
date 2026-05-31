import Link from 'next/link';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { formatDkk } from '@/lib/currency';
import { resolveProductImageSrc } from '@/lib/product-image';

type ProductCardProps = {
  id: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
  categoryName?: string;
};

export function ProductCard({ id, title, priceCents, imageUrl, categoryName }: ProductCardProps) {
  const src = resolveProductImageSrc(imageUrl);

  return (
    <Link href={`/products/${id}`} className="card card-link product-card">
      <div className="card-image-wrap">
        {src ? (
          <img src={src} alt="" className="card-image" />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="card-body">
        <span className="card-title">{title}</span>
        {categoryName && <p className="card-category">{categoryName}</p>}
        <p className="card-price">{formatDkk(priceCents)}</p>
      </div>
    </Link>
  );
}
