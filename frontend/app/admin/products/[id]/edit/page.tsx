'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { admin } from '@/lib/api';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [stock, setStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => admin.product(id),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => admin.categories(),
  });
  const catList = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    if (product && typeof product === 'object') {
      setTitle(String(product.title ?? ''));
      setSlug(String(product.slug ?? ''));
      setDescription(String(product.description ?? ''));
      setPriceCents(product.priceCents != null ? String(product.priceCents) : '');
      setStock(String(product.stock ?? 0));
      setIsActive(Boolean(product.isActive !== false));
      setCategoryId(product.categoryId ? String(product.categoryId) : '');
      const imgs = (product.images as Array<{ url: string }>) ?? [];
      setImageUrls(imgs.length ? imgs.map((i) => i.url) : ['']);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => admin.updateProduct(id, data),
    onSuccess: () => {
      router.push('/admin/products');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => admin.deleteProductPermanent(id),
    onSuccess: () => {
      router.push('/admin/products');
    },
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const urls = imageUrls.map((u) => u.trim()).filter(Boolean);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(priceCents, 10);
    const st = parseInt(stock, 10);
    if (Number.isNaN(price) || price < 0 || Number.isNaN(st) || st < 0 || !title.trim() || !slug.trim() || urls.length < 1) return;
    updateMutation.mutate({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      priceCents: price,
      stock: st,
      isActive,
      categoryId: categoryId || null,
      imageUrls: urls,
    });
  };

  const setImageUrl = (i: number, v: string) => {
    const next = [...imageUrls];
    next[i] = v;
    if (i === next.length - 1 && next.length < 4) next.push('');
    setImageUrls(next.filter((_, j) => j < 4 || _.trim()));
  };
  const removeImageUrl = (i: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, j) => j !== i));
  };
  const addImageUrl = () => {
    if (imageUrls.length < 4) setImageUrls([...imageUrls, '']);
  };

  const handleFileSelect = async (index: number, file: File | null) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PNG and JPG images are allowed.');
      return;
    }
    setUploadError(null);
    setUploadingIndex(index);
    try {
      const { url } = await admin.uploadImage(file);
      setImageUrl(index, url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingIndex(null);
    }
  };

  if (!id) return <p>Invalid product.</p>;
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p className="form-error">Failed to load product.</p>;
  if (!product) return null;

  return (
    <>
      <Link href="/admin/products" className="back-link">← Back to products</Link>
      <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price in DKK (e.g. 199.00)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={priceCents === '' ? '' : (Number(priceCents) / 100).toFixed(2)}
            onChange={(e) => {
              const v = e.target.value;
              setPriceCents(v === '' ? '' : String(Math.round(parseFloat(v) * 100)));
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Images (1–4) — paste a URL or upload PNG/JPG</label>
          {uploadError && <p className="form-error" style={{ marginBottom: '0.5rem' }}>{uploadError}</p>}
          {imageUrls.map((url, i) => (
            <div key={i} className="form-row-with-action image-url-row">
              <input
                type="url"
                placeholder={`Image ${i + 1} URL`}
                value={url}
                onChange={(e) => { setUploadError(null); setImageUrl(i, e.target.value); }}
              />
              <label className="btn btn-secondary btn-sm upload-file-label">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  className="upload-file-input"
                  disabled={uploadingIndex !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(i, f);
                    e.target.value = '';
                  }}
                />
                {uploadingIndex === i ? 'Uploading…' : 'Choose file'}
              </label>
              {imageUrls.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeImageUrl(i)} aria-label="Remove image">−</button>
              )}
            </div>
          ))}
          {imageUrls.length < 4 && (
            <button type="button" className="btn btn-ghost btn-sm add-image-btn" onClick={addImageUrl}>
              + Add image
            </button>
          )}
        </div>
        <div className="form-group form-group-checkbox">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive">Active (visible in shop)</label>
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— None —</option>
            {catList.map((c: Record<string, unknown>) => (
              <option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link href="/admin/products" className="btn btn-secondary">Cancel</Link>
        </div>
        {updateMutation.isError && (
          <p className="form-error" style={{ marginTop: '0.75rem' }}>{String(updateMutation.error?.message)}</p>
        )}

        <div className="form-danger-zone">
          <h3 className="form-danger-zone-title">Delete product</h3>
          <p className="form-danger-zone-text">Permanently remove this product. This cannot be undone.</p>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
            Delete product
          </button>
        </div>
      </form>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => { setDeleteConfirm(false); deleteMutation.reset(); }} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-modal-title">Delete product?</h3>
            <p>Are you sure you want to permanently delete “{title || 'this product'}”? This cannot be undone.</p>
            {deleteMutation.isError && <p className="form-error" style={{ marginBottom: '0.75rem' }}>{String(deleteMutation.error?.message)}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setDeleteConfirm(false); deleteMutation.reset(); }}>Cancel</button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
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
