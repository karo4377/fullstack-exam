import * as Sentry from '@sentry/nextjs';
import { getSentryInitOptions } from './sentry.shared';

const options = getSentryInitOptions();
if (options.enabled) {
  Sentry.init(options);
}
