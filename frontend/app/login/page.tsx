'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthSocialPanel } from '@/components/auth-social-panel';
import { PasswordField } from '@/components/password-field';
import { useAuth } from '@/context/auth-context';

function LoginSuccessBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('reset') !== 'success') return null;
  return (
    <p className="auth-success-message" role="status">
      Your password has been updated. You can log in now.
    </p>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const u = await login(email, password);
      router.push(u.role === 'ADMIN' ? '/admin' : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="page page--auth">
      <main className="auth-box auth-box--split">
        <h1 className="title-page auth-box__title">Log in</h1>

        <Suspense fallback={null}>
          <LoginSuccessBanner />
        </Suspense>

        <div className="auth-split">
          <section className="auth-split__col" aria-labelledby="login-credentials-heading">
            <h2 id="login-credentials-heading" className="auth-split__heading">
              Email &amp; password
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <PasswordField
                id="login-password"
                label="Password"
                value={password}
                onChange={setPassword}
                required
                autoComplete="current-password"
              />
              <p className="auth-forgot-link">
                <Link href="/forgot-password">Forgot password?</Link>
              </p>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Log in
                </button>
              </div>
            </form>
          </section>

          <div className="auth-split__divider" role="presentation">
            <span>or</span>
          </div>

          <AuthSocialPanel id="login-social-heading" mode="login" />
        </div>

        <p className="footer-link">
          No account? <Link href="/register">Register</Link>
        </p>
      </main>
    </div>
  );
}
