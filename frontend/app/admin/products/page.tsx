'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { resolveProductImageSrc } from '@/lib/product-image';
import { admin } from '@/lib/api';

type AdminProduct = Record<string, unknown>;

function AdminProductActions({
  product,
  removeMutation,
  activateMutation,
  onDelete,
}: {
  product: AdminProduct;
  removeMutation: { isPending: boolean; mutate: (id: string) => void };
  activateMutation: { isPending: boolean; mutate: (id: string) => void };
  onDelete: (id: string, title: string) => void;
}) {
  const id = String(product.id);
  const title = String(product.title ?? 'this product');

  return (
    <div className="admin-product-actions">
      <Link href={`/admin/products/${id}/edit`} className="btn btn-secondary btn-sm">
        Edit
      </Link>
      {product.isActive ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={removeMutation.isPending}
          onClick={() => removeMutation.mutate(id)}
        >
          Deactivate
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm admin-btn-activate"
          disabled={activateMutation.isPending}
          onClick={() => activateMutation.mutate(id)}
        >
          Activate
        </button>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-sm admin-btn-delete"
        onClick={() => onDelete(id, title)}
      >
        Delete
      </button>
    </div>
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => admin.products(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => admin.removeProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => admin.updateProduct(id, { isActive: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => admin.deleteProductPermanent(id),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
  const deleteError = deleteMutation.isError ? (deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Delete failed') : null;

  const closeModal = () => {
    setDeleteTarget(null);
    deleteMutation.reset();
  };

  if (isLoading) return <p>Loading products…</p>;
  if (error) return <p className="form-error">Failed to load products. {error instanceof Error ? error.message : ''}</p>;

  const list = Array.isArray(products) ? products : [];

  return (
    <>
      <div className="admin-page-toolbar">
        <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
      </div>
      {deleteError && <p className="form-error" style={{ marginBottom: '1rem' }}>{deleteError}</p>}
      {list.length === 0 ? (
        <p className="empty-state">No products yet. <Link href="/admin/products/new">Add one</Link>.</p>
      ) : (
        <>
          <ul className="admin-product-cards">
            {list.map((p: AdminProduct) => {
              const images = (p.images as Array<{ url: string }>) ?? [];
              const thumb = resolveProductImageSrc(images[0]?.url);
              return (
                <li key={String(p.id)} className="admin-product-card">
                  <div className="admin-product-card-head">
                    <div className="admin-product-card-thumb">
                      {thumb ? (
                        <img src={thumb} alt="" className="admin-table-thumb" />
                      ) : (
                        <ImagePlaceholder compact label="—" className="image-placeholder--thumb" />
                      )}
                    </div>
                    <div className="admin-product-card-title-wrap">
                      <h3 className="admin-product-card-title">{String(p.title)}</h3>
                      <p className="admin-product-card-slug">
                        <code>{String(p.slug)}</code>
                      </p>
                    </div>
                    <span
                      className={`admin-product-card-status${p.isActive ? '' : ' admin-product-card-status--inactive'}`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <dl className="admin-product-card-meta">
                    <div>
                      <dt>Price</dt>
                      <dd>{(Number(p.priceCents) / 100).toFixed(2)} kr.</dd>
                    </div>
                    <div>
                      <dt>Stock</dt>
                      <dd>{String(p.stock)}</dd>
                    </div>
                  </dl>
                  <AdminProductActions
                    product={p}
                    removeMutation={removeMutation}
                    activateMutation={activateMutation}
                    onDelete={(id, title) => setDeleteTarget({ id, title })}
                  />
                </li>
              );
            })}
          </ul>

          <div className="admin-table-wrap admin-table-wrap--desktop">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '56px' }}></th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ width: '6rem' }}>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p: AdminProduct) => {
                  const images = (p.images as Array<{ url: string }>) ?? [];
                  const thumb = resolveProductImageSrc(images[0]?.url);
                  return (
                    <tr key={String(p.id)}>
                      <td>
                        {thumb ? (
                          <img src={thumb} alt="" className="admin-table-thumb" />
                        ) : (
                          <ImagePlaceholder compact label="—" className="image-placeholder--thumb" />
                        )}
                      </td>
                      <td>{String(p.title)}</td>
                      <td>
                        <code className="admin-table-code">{String(p.slug)}</code>
                      </td>
                      <td>{(Number(p.priceCents) / 100).toFixed(2)} kr.</td>
                      <td>{String(p.stock)}</td>
                      <td>{p.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        <AdminProductActions
                          product={p}
                          removeMutation={removeMutation}
                          activateMutation={activateMutation}
                          onDelete={(id, title) => setDeleteTarget({ id, title })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-modal-title">Delete product?</h3>
            <p>Are you sure you want to permanently delete “{deleteTarget.title}”? This cannot be undone.</p>
            {deleteMutation.isError && <p className="form-error" style={{ marginBottom: '0.75rem' }}>{deleteError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
