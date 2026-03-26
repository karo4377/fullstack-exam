'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { admin } from '@/lib/api';

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => admin.categories(),
  });
  const catList = Array.isArray(categories) ? categories : [];

  const createMutation = useMutation({
    mutationFn: (data: { title: string; slug: string; description: string; priceCents: number; stock: number; categoryId?: string; imageUrls: string[] }) =>
      admin.createProduct(data),
    onSuccess: () => {
      router.push('/admin/products');
    },
  });

  const handleTitleChange = (v: string) => {
    setTitle(v);
    setSlug(slugify(v));
  };

  const urls = imageUrls.map((u) => u.trim()).filter(Boolean);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = priceCents === '' ? 0 : parseInt(priceCents, 10);
    const st = parseInt(stock, 10);
    if (Number.isNaN(price) || price < 0 || Number.isNaN(st) || st < 0 || !title.trim() || !slug.trim() || urls.length < 1) return;
    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      description: description.trim(),
      priceCents: price,
      stock: st,
      categoryId: categoryId || undefined,
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

  return (
    <>
      <Link href="/admin/products" className="back-link">← Back to products</Link>
      <h1 className="title-page">Add product</h1>
      <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
          <label htmlFor="price">Price (e.g. 19.99)</label>
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
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving…' : 'Create product'}
          </button>
          <Link href="/admin/products" className="btn btn-secondary">Cancel</Link>
        </div>
        {createMutation.isError && (
          <p className="form-error" style={{ marginTop: '0.75rem' }}>{String(createMutation.error?.message)}</p>
        )}
      </form>
    </>
  );
}
