import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { StrictMode, startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';

Sentry.init({
  // enabled: !import.meta.env.DEV,
  enabled: true,
  environment: import.meta.env.DEV ? 'development' : 'production',
  dsn: 'https://<public-key>@<org-id>.ingest.us.sentry.io/<project-id>',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
    // eslint-disable-next-line import/namespace
    Sentry.replayIntegration(),
  ],
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});

// if (import.meta.env.DEV) {
//   import('@spotlightjs/spotlight').then((Spotlight) => Spotlight.init({ injectImmediately: true }));
// }
