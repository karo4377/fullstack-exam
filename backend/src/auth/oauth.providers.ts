import type { Provider } from '@nestjs/common';
import { FacebookAuthGuard } from './facebook-auth.guard';
import { FacebookStrategy } from './facebook.strategy';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleStrategy } from './google.strategy';

/** Only register OAuth strategies when credentials exist (avoids Render boot crash). */
export function oauthProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleStrategy, GoogleAuthGuard);
  }
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    providers.push(FacebookStrategy, FacebookAuthGuard);
  }
  return providers;
}
