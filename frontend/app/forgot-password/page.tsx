'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page--auth">
      <main className="auth-box">
        <h1 className="title-page auth-box__title">Forgot password</h1>
        <p className="auth-box__lead">
          Enter the email you used to sign up and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <p className="auth-success-message" role="status">
            If an account with that email exists, we&apos;ve sent password reset instructions. Check
            your inbox (and spam folder).
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
          </form>
        )}

        <p className="footer-link">
          <Link href="/login">Back to log in</Link>
        </p>
      </main>
    </div>
  );
}
