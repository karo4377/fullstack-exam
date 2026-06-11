'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordField } from '@/components/password-field';
import { auth } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is invalid. Please request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(token, password);
      router.push('/login?reset=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <p className="form-error">This reset link is invalid or missing. Please request a new one.</p>
        <p className="footer-link">
          <Link href="/forgot-password">Request a new link</Link>
        </p>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PasswordField
        id="reset-password"
        label="New password"
        value={password}
        onChange={setPassword}
        required
        minLength={6}
        autoComplete="new-password"
      />
      <PasswordField
        id="reset-password-confirm"
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        minLength={6}
        autoComplete="new-password"
      />
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="page page--auth">
      <main className="auth-box">
        <h1 className="title-page auth-box__title">Choose a new password</h1>
        <p className="auth-box__lead">Enter your new password below. It must be at least 6 characters.</p>

        <Suspense fallback={<p>Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="footer-link">
          <Link href="/login">Back to log in</Link>
        </p>
      </main>
    </div>
  );
}
