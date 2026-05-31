'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { formatDkk } from '@/lib/currency';
import { resolveProductImageSrc } from '@/lib/product-image';
import { useCart } from '@/context/cart-context';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, isLoading, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  const totalCents = items.reduce(
    (sum, item) => sum + (Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0)),
    0,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        const trigger = document.getElementById('cart-drawer-trigger');
        if (trigger?.contains(target)) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cart-drawer" ref={panelRef} role="dialog" aria-label="Cart preview">
      <div className="cart-drawer-head">
        <h2 className="cart-drawer-title">Your cart</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Close
        </button>
      </div>

      {isLoading ? (
        <p className="muted-text cart-drawer-empty">Loading cart…</p>
      ) : items.length === 0 ? (
        <p className="muted-text cart-drawer-empty">
          Your cart is empty.{' '}
          <Link href="/products" className="text-link" onClick={onClose}>
            Browse prints
          </Link>
        </p>
      ) : (
        <>
          <ul className="cart-drawer-lines">
            {items.map((item) => {
              const imageSrc = resolveProductImageSrc(item.product?.images?.[0]?.url);
              const lineCents =
                Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0);
              return (
                <li key={item.id} className="cart-drawer-line">
                  <div className="cart-drawer-line-thumb">
                    {imageSrc ? (
                      <img src={imageSrc} alt="" />
                    ) : (
                      <ImagePlaceholder compact className="image-placeholder--thumb" />
                    )}
                  </div>
                  <div className="cart-drawer-line-body">
                    <span className="cart-drawer-line-title">
                      {item.product?.title ?? 'Product'}
                    </span>
                    <span className="muted-text">Qty {item.quantity}</span>
                  </div>
                  <div className="cart-drawer-line-meta">
                    <span>{formatDkk(lineCents)}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeItem(item.id, item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="cart-drawer-total">
            <span>Subtotal</span>
            <strong>{formatDkk(totalCents)}</strong>
          </p>
        </>
      )}

      <div className="cart-drawer-actions">
        <Link href="/cart" className="btn btn-secondary" onClick={onClose}>
          View cart
        </Link>
        {items.length > 0 && (
          <Link href="/checkout" className="btn btn-primary" onClick={onClose}>
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
