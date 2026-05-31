'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlaceholder } from '@/components/image-placeholder';
import { resolveProductImageSrc } from '@/lib/product-image';
import { admin } from '@/lib/api';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <h1 className="title-page">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
      </div>
      {deleteError && <p className="form-error" style={{ marginBottom: '1rem' }}>{deleteError}</p>}
      {list.length === 0 ? (
        <p className="empty-state">No products yet. <Link href="/admin/products/new">Add one</Link>.</p>
      ) : (
        <div className="admin-table-wrap">
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
              {list.map((p: Record<string, unknown>) => {
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
                  <td><code style={{ fontSize: '0.85em' }}>{String(p.slug)}</code></td>
                  <td>{(Number(p.priceCents) / 100).toFixed(2)} kr.</td>
                  <td>{String(p.stock)}</td>
                  <td style={{ width: '6rem' }}>{p.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <div className="actions">
                      <Link href={`/admin/products/${p.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}>Edit</Link>
                      {p.isActive ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', minWidth: '6.5rem' }}
                          disabled={removeMutation.isPending}
                          onClick={() => p.id && removeMutation.mutate(String(p.id))}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', color: 'var(--color-primary)', minWidth: '6.5rem' }}
                          disabled={activateMutation.isPending}
                          onClick={() => p.id && activateMutation.mutate(String(p.id))}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', color: 'var(--color-error)' }}
                        onClick={() => p.id && setDeleteTarget({ id: String(p.id), title: String(p.title ?? 'this product') })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
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
