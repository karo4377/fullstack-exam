'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { auth as authApi } from '@/lib/api';

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
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
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

          <section className="auth-split__col" aria-labelledby="login-social-heading">
            <h2 id="login-social-heading" className="auth-split__heading">
              Social login
            </h2>
            <p className="auth-split__hint">Use an account you already have.</p>
            <div className="auth-social-buttons">
              <a href={authApi.googleLoginUrl()} className="btn btn-secondary btn-social btn-social--google">
                Continue with Google
              </a>
              <a href={authApi.facebookLoginUrl()} className="btn btn-secondary btn-social btn-social--facebook">
                Continue with Facebook
              </a>
            </div>
          </section>
        </div>

        <p className="footer-link">
          No account? <Link href="/register">Register</Link>
        </p>
      </main>
    </div>
  );
}
