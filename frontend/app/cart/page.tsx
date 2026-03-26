'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cart as cartApi, orders as ordersApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function CartPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user && user.role !== 'ADMIN',
  });
  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
  const createOrder = useMutation({
    mutationFn: () => ordersApi.create(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/account/orders');
    },
  });

  if (loading || !user) {
    return (
      <main className="page">
        <p className="empty-state">Please <Link href="/login">log in</Link> to view your cart.</p>
      </main>
    );
  }
  if (user.role === 'ADMIN') {
    return (
      <main className="page">
        <h1 className="title-page">Cart</h1>
        <p className="empty-state">Admins don’t place orders. Use a customer account to shop, or go to <Link href="/admin">Admin</Link> to manage the shop.</p>
      </main>
    );
  }
  if (isLoading) return <main className="page">Loading cart…</main>;

  const items = (cart?.items as Array<Record<string, unknown> & { product?: Record<string, unknown> }>) ?? [];
  const totalCents = items.reduce(
    (sum, item) => sum + (Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0)),
    0
  );

  return (
    <main className="page">
      <h1 className="title-page">Cart</h1>
      {items.length === 0 ? (
        <p className="empty-state">Your cart is empty. <Link href="/products">Browse products</Link>.</p>
      ) : (
        <div className="card" style={{ padding: '1.25rem' }}>
          <ul className="list-plain">
            {items.map((item: Record<string, unknown> & { id: string; product?: { title?: string; priceCents?: number; images?: Array<{ url: string }> }; quantity?: number }) => {
              const img = item.product?.images?.[0]?.url;
              return (
                <li key={item.id} className="cart-item">
                  {img && <img src={img} alt="" className="cart-item-thumb" />}
                  <span className="cart-item-title">{item.product?.title as string} × {item.quantity}</span>
                  <span className="card-price">{(Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0)) / 100} €</span>
                  <button type="button" className="btn btn-ghost" onClick={() => removeItem.mutate(item.id)} disabled={removeItem.isPending}>Remove</button>
                </li>
              );
            })}
          </ul>
          <p style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>Total: {totalCents / 100} €</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => createOrder.mutate()}
            disabled={createOrder.isPending}
            style={{ marginTop: '1rem' }}
          >
            {createOrder.isPending ? 'Placing order…' : 'Checkout'}
          </button>
        </div>
      )}
    </main>
  );
}
