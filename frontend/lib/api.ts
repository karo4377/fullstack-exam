const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const hasBody = options.body != null && options.body !== '';
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (e) {
    const msg = e instanceof Error && e.message === 'Failed to fetch'
      ? `Cannot reach the API at ${API_BASE}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.`
      : e instanceof Error ? e.message : 'Request failed';
    throw new Error(msg);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || res.statusText || 'Request failed');
  }
  const contentType = res.headers.get('content-type');
  if (res.status === 204 || !contentType?.includes('application/json')) {
    return undefined as T;
  }
  return res.json();
}

export const auth = {
  me: () => api<{ id: string; email: string; name: string | null; role: string }>('/auth/me'),
  login: (email: string, password: string) =>
    api<{ id: string; email: string; name: string | null; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name?: string) =>
    api<{ id: string; email: string; name: string | null; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
  logout: () => api<{ success: boolean }>('/auth/logout', { method: 'POST' }),
};

export const products = {
  list: (params?: { search?: string; categoryId?: string; collection?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.categoryId) q.set('categoryId', params.categoryId);
    if (params?.collection) q.set('collection', params.collection);
    const qs = q.toString();
    return api<Array<Record<string, unknown>>>(qs ? `/products?${qs}` : '/products');
  },
  get: (id: string) => api<Record<string, unknown>>(`/products/${id}`),
};

export const categories = {
  list: () => api<Array<{ id: string; slug: string; name: string }>>('/categories'),
};

export const reviews = {
  list: (productId: string) =>
    api<Array<Record<string, unknown>>>(`/products/${productId}/reviews`),
  create: (productId: string, data: { rating: number; comment?: string }) =>
    api<Record<string, unknown>>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const cart = {
  get: () => api<{ id: string; items: Array<Record<string, unknown>> }>('/cart'),
  addItem: (productId: string, quantity = 1) =>
    api<Record<string, unknown>>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  updateItem: (itemId: string, quantity: number) =>
    api<Record<string, unknown> | null>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (itemId: string) =>
    api<{ success: boolean }>(`/cart/items/${itemId}`, { method: 'DELETE' }),
};

export const orders = {
  list: () => api<Array<Record<string, unknown>>>('/orders'),
  get: (id: string) => api<Record<string, unknown>>(`/orders/${id}`),
  create: () => api<Record<string, unknown>>('/orders', { method: 'POST' }),
  createGuest: (data: {
    email: string;
    items: Array<{ productId: string; quantity: number }>;
  }) =>
    api<Record<string, unknown>>('/checkout/guest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const admin = {
  users: () => api<Array<Record<string, unknown>>>('/admin/users'),
  updateUser: (id: string, data: { isActive: boolean }) =>
    api<Record<string, unknown>>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${API_BASE}/admin/upload`;
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      const msg = (err as { message?: string }).message || res.statusText || 'Upload failed';
      if (res.status === 404) {
        throw new Error(`${msg}. Restart the backend (npm run start:dev in backend/) so the upload route is loaded.`);
      }
      throw new Error(msg);
    }
    return res.json();
  },
  products: () => api<Array<Record<string, unknown>>>('/admin/products'),
  product: (id: string) => api<Record<string, unknown>>(`/admin/products/${id}`),
  createProduct: (data: { title: string; slug: string; description: string; priceCents: number; stock: number; categoryId?: string; imageUrls: string[] }) =>
    api<Record<string, unknown>>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  removeProduct: (id: string) =>
    api<Record<string, unknown>>(`/admin/products/${id}`, { method: 'DELETE' }),
  deleteProductPermanent: (id: string) =>
    api<void>(`/admin/products/${id}?permanent=true`, { method: 'DELETE' }),
  orders: () => api<Array<Record<string, unknown>>>('/admin/orders'),
  stats: () =>
    api<{
      productCount: number;
      customerCount: number;
      orderCount: number;
      reviewCount: number;
      pendingOrders: number;
      revenueCents: number;
    }>('/admin/stats'),
  categories: () => api<Array<Record<string, unknown>>>('/admin/categories'),
};

export const favorites = {
  list: () =>
    api<
      Array<{
        id: string;
        productId: string;
        product: Record<string, unknown>;
      }>
    >('/favorites'),
  ids: () => api<Array<{ productId: string }>>('/favorites/ids'),
  add: (productId: string) =>
    api<{ id: string }>(`/favorites/${productId}`, { method: 'POST' }),
  remove: (productId: string) =>
    api<{ count: number }>(`/favorites/${productId}`, { method: 'DELETE' }),
};
