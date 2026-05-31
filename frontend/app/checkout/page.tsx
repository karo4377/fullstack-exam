'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { orders as ordersApi } from '@/lib/api';
import { formatDkk } from '@/lib/currency';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { clearGuestCart } from '@/lib/guest-cart';
import { registeredPerksNote } from '@/lib/site';
import { profileToCheckoutFields } from '@/lib/user-profile';

type PaymentMethod = 'card' | 'mobilepay';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'Denmark',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
};

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, isLoading, isGuest, refresh } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    ...initialForm,
    email: user?.email ?? '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  useEffect(() => {
    if (!user || isGuest) return;
    const profile = profileToCheckoutFields(user);
    setForm((prev) => ({
      ...prev,
      ...profile,
      cardNumber: prev.cardNumber,
      cardExpiry: prev.cardExpiry,
      cardCvc: prev.cardCvc,
    }));
  }, [user, isGuest]);

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (isGuest) {
        return ordersApi.createGuest({
          email: form.email.trim(),
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }
      return ordersApi.create();
    },
    onSuccess: (order) => {
      if (isGuest) {
        clearGuestCart();
        refresh();
      }
      const id = order && typeof order === 'object' && 'id' in order ? String(order.id) : '';
      router.push(id ? `/checkout/success?orderId=${id}` : '/checkout/success');
    },
  });

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    placeOrder.mutate();
  };

  const formValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.addressLine1.trim() &&
    form.city.trim() &&
    form.postalCode.trim() &&
    form.country.trim() &&
    (paymentMethod === 'mobilepay' ||
      (form.cardNumber.replace(/\s/g, '').length >= 12 &&
        form.cardExpiry.trim() &&
        form.cardCvc.trim().length >= 3));

  if (authLoading || isLoading) {
    return (
      <main className="page">
        <PageHeader title="Checkout" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Checkout' }]} />
        <p className="muted-text">Loading…</p>
      </main>
    );
  }

  if (user?.role === 'ADMIN') {
    return (
      <main className="page">
        <PageHeader title="Checkout" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Checkout' }]} />
        <p className="empty-state">Admins cannot place orders. Use a customer account to shop.</p>
      </main>
    );
  }

  const totalCents = items.reduce(
    (sum, item) => sum + (Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0)),
    0,
  );

  return (
    <main className="page">
      <PageHeader title="Checkout" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Checkout' }]} />
      <p className="subtitle checkout-subtitle">
        Simulated checkout — no real payment is taken. Your order is created when you confirm.
      </p>

      {isGuest && (
        <div className="notice-banner notice-banner--info" role="status">
          <p>
            <strong>Guest checkout</strong> — you don&apos;t need an account, but you won&apos;t be able to
            view this order in order history later. {registeredPerksNote}
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-link">
              Log in
            </Link>{' '}
            for a faster checkout.
          </p>
        </div>
      )}

      {!isGuest && user && (
        <div className="notice-banner notice-banner--info" role="status">
          <p>
            Your saved profile details are pre-filled below.{' '}
            <Link href="/account/profile" className="text-link">
              Update profile
            </Link>
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty-state">
          Your cart is empty. <Link href="/products">Browse products</Link>.
        </p>
      ) : (
        <form className="checkout-layout" onSubmit={onSubmit}>
          <div className="checkout-main">
            <section className="card checkout-section" aria-labelledby="checkout-contact">
              <h2 id="checkout-contact" className="checkout-section-title">
                Contact &amp; delivery
              </h2>
              <div className="checkout-form-grid">
                <div className="form-group checkout-field--full">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    required
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    readOnly={!isGuest && !!user?.email}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                  />
                </div>
                <div className="form-group checkout-field--full">
                  <label htmlFor="addressLine1">Address</label>
                  <input
                    id="addressLine1"
                    required
                    autoComplete="address-line1"
                    value={form.addressLine1}
                    onChange={(e) => update('addressLine1', e.target.value)}
                  />
                </div>
                <div className="form-group checkout-field--full">
                  <label htmlFor="addressLine2">Address line 2 (optional)</label>
                  <input
                    id="addressLine2"
                    autoComplete="address-line2"
                    value={form.addressLine2}
                    onChange={(e) => update('addressLine2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal code</label>
                  <input
                    id="postalCode"
                    required
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(e) => update('postalCode', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                </div>
                <div className="form-group checkout-field--full">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    required
                    autoComplete="country-name"
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="card checkout-section" aria-labelledby="checkout-payment">
              <h2 id="checkout-payment" className="checkout-section-title">
                Payment
              </h2>
              <fieldset className="checkout-payment-options">
                <legend className="visually-hidden">Payment method</legend>
                <label className="checkout-payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span>Debit / credit card</span>
                </label>
                <label className="checkout-payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobilepay"
                    checked={paymentMethod === 'mobilepay'}
                    onChange={() => setPaymentMethod('mobilepay')}
                  />
                  <span>MobilePay</span>
                </label>
              </fieldset>

              {paymentMethod === 'card' ? (
                <div className="checkout-form-grid checkout-card-fields">
                  <div className="form-group checkout-field--full">
                    <label htmlFor="cardNumber">Card number</label>
                    <input
                      id="cardNumber"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={form.cardNumber}
                      onChange={(e) => update('cardNumber', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardExpiry">Expiry</label>
                    <input
                      id="cardExpiry"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      value={form.cardExpiry}
                      onChange={(e) => update('cardExpiry', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardCvc">CVC</label>
                    <input
                      id="cardCvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={form.cardCvc}
                      onChange={(e) => update('cardCvc', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <p className="checkout-mobilepay-note muted-text">
                  You will be redirected to MobilePay in a real store. Here we simulate approval
                  instantly.
                </p>
              )}
            </section>
          </div>

          <aside className="card checkout-summary">
            <h2 className="checkout-section-title">Order summary</h2>
            <ul className="list-plain checkout-summary-lines">
              {items.map((item) => (
                <li key={item.id} className="checkout-summary-line">
                  <span>
                    {String(item.product?.title ?? 'Item')} × {Number(item.quantity ?? 0)}
                  </span>
                  <span>
                    {formatDkk(
                      Number(item.product?.priceCents ?? 0) * Number(item.quantity ?? 0),
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="checkout-total">
              <span>Total</span>
              <strong>{formatDkk(totalCents)}</strong>
            </p>

            {placeOrder.isError && (
              <p className="form-error">
                {placeOrder.error instanceof Error ? placeOrder.error.message : 'Checkout failed'}
              </p>
            )}

            <div className="checkout-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={placeOrder.isPending || !formValid}
              >
                {placeOrder.isPending
                  ? 'Processing…'
                  : paymentMethod === 'mobilepay'
                    ? `Pay with MobilePay · ${formatDkk(totalCents)}`
                    : `Pay ${formatDkk(totalCents)}`}
              </button>
              <Link href="/cart" className="btn btn-secondary">
                Back to cart
              </Link>
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
