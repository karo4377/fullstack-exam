import { auth as authApi } from '@/lib/api';

type AuthSocialPanelProps = {
  id: string;
  mode: 'login' | 'register';
};

export function AuthSocialPanel({ id, mode }: AuthSocialPanelProps) {
  const isRegister = mode === 'register';
  const heading = isRegister ? 'Social sign-up' : 'Social login';
  const hint = isRegister
    ? 'Creates your account with one click — no password needed.'
    : 'Use an account you already have.';
  const googleLabel = isRegister ? 'Sign up with Google' : 'Continue with Google';
  const facebookLabel = isRegister ? 'Sign up with Facebook' : 'Continue with Facebook';

  return (
    <section className="auth-split__col" aria-labelledby={id}>
      <h2 id={id} className="auth-split__heading">
        {heading}
      </h2>
      <p className="auth-split__hint">{hint}</p>
      <div className="auth-social-buttons">
        <a
          href={authApi.googleLoginUrl()}
          className="btn btn-secondary btn-social btn-social--google"
        >
          {googleLabel}
        </a>
        <a
          href={authApi.facebookLoginUrl()}
          className="btn btn-secondary btn-social btn-social--facebook"
        >
          {facebookLabel}
        </a>
      </div>
    </section>
  );
}
