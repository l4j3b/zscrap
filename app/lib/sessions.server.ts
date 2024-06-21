import { createCookieSessionStorage } from '@remix-run/cloudflare';
import { createThemeSessionResolver } from 'remix-themes';

// const isProduction = import.meta.env.PROD;

export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: '__remix-themes',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secrets: ['ke*wap[@20ca'],
      // TODO: enable
      // Set domain and secure only if in production
      // ...(isProduction
      // 	? { domain: "your-production-domain.com", secure: true }
      // 	: {}),
    },
  }),
);
