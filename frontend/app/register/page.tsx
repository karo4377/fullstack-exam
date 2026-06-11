'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthSocialPanel } from '@/components/auth-social-panel';
import { PasswordField } from '@/components/password-field';
import { useAuth } from '@/context/auth-context';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await register(email, password, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      router.push('/account/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="page page--auth">
      <main className="auth-box auth-box--split">
        <h1 className="title-page auth-box__title">Register</h1>

        <div className="auth-split">
          <section className="auth-split__col" aria-labelledby="register-credentials-heading">
            <h2 id="register-credentials-heading" className="auth-split__heading">
              Email &amp; password
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-first-name">First name</label>
                <input
                  id="reg-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-last-name">Last name</label>
                <input
                  id="reg-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <PasswordField
                id="reg-password"
                label="Password"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <PasswordField
                id="reg-password-confirm"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </div>
            </form>
          </section>

          <div className="auth-split__divider" role="presentation">
            <span>or</span>
          </div>

          <AuthSocialPanel id="register-social-heading" mode="register" />
        </div>

        <p className="footer-link">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </main>
    </div>
  );
}
