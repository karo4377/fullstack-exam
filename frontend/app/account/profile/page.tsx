'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/context/auth-context';
import { emptyProfileForm, userToProfileForm } from '@/lib/user-profile';

export default function AccountProfilePage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(emptyProfileForm);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setForm(userToProfileForm(user));
    }
  }, [user]);

  const update = (field: keyof typeof emptyProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="page">
        <p className="muted-text">Loading…</p>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="page">
        <p className="muted-text">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      <PageHeader
        title="Profile & delivery"
        subtitle="Save your details once — we’ll pre-fill checkout next time."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Profile' },
        ]}
      />

      <form className="card profile-form" onSubmit={handleSubmit}>
        <section className="profile-form-section">
          <h2 className="profile-form-heading">About you</h2>
          <div className="checkout-form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </div>
            <div className="form-group checkout-field--full">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={user.email} readOnly />
              <p className="form-hint">Email is tied to your login and cannot be changed here.</p>
            </div>
            <div className="form-group checkout-field--full">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="profile-form-section">
          <h2 className="profile-form-heading">Delivery address</h2>
          <div className="checkout-form-grid">
            <div className="form-group checkout-field--full">
              <label htmlFor="addressLine1">Address</label>
              <input
                id="addressLine1"
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
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>
            <div className="form-group checkout-field--full">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                autoComplete="country-name"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}
        {saved && <p className="form-success" role="status">Profile saved.</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          <Link href="/account" className="btn btn-secondary">
            Back to account
          </Link>
        </div>
      </form>
    </div>
  );
}
