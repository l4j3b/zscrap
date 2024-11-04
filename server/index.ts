import { sentry } from '@hono/sentry';
import {
  type AppLoadContext,
  createWorkersKVSessionStorage,
  ServerBuild,
} from '@remix-run/cloudflare';
import type { User } from '@supabase/supabase-js';
import { type Context, Hono } from 'hono';
// import { basicAuth } from 'hono/basic-auth';
import { secureHeaders } from 'hono/secure-headers';
import { staticAssets } from 'remix-hono/cloudflare';
import { remix } from 'remix-hono/handler';
import { session, getSession } from 'remix-hono/session';
import { $path } from 'remix-routes';
import { Resend } from 'resend';

import { initializeDbClient } from '~/lib/db.server/initialize-db-client';
import { createSupabaseServerClient } from '~/lib/supabase.server';

import { AUTH_SESSION_KEY, type SessionData, type SessionFlashData } from './sessions';

/* All routes are Admin routes by default */

function isPublicRoute(path: string) {
  return path === '/' || path.startsWith('/auth/') || path.startsWith('/webhooks');
}

function isLoggedInRoute(path: string) {
  return path.startsWith('/in');
}

function isAdminRoute(path: string) {
  return !isPublicRoute(path) && !isLoggedInRoute(path);
}

interface ContextEnv {
  Bindings: Env;
  Variables: {
    supabaseUser: User | null;
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  };
}

const isProd = (context: Context<ContextEnv>) => {
  return context.env.VITE_ENV !== 'development';
};

const app = new Hono<ContextEnv>();

app.use(secureHeaders());

app.get('/health', (c) => c.text('♥', 200));

app.use('*', (c, next) => {
  return sentry({
    enabled: true,
    environment: c.env.VITE_ENV,
    dsn: c.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  })(c, next);
});

/*
 * Basic auth middleware for the whole app (will be removed when the app becomes public).
 */

// app.use('*', (c, next) => {
//   // Only enable basic auth in production while the app is in development
//   if (isProd(c)) {
//     return basicAuth({
//       username: c.env.BASIC_AUTH_USERNAME,
//       password: c.env.BASIC_AUTH_PASSWORD,
//     })(c, next);
//   }

//   return next();
// });

/*
 * Middleware responsible for:
 * - Serving static assets.
 */

app.use('*', async (c, next) => {
  if (isProd(c)) {
    return staticAssets()(c, next);
  }

  await next();
});

/*
 * Middleware responsible for:
 * - Setting up the session KV storage.
 */

app.use(
  '*',
  session({
    autoCommit: true,
    createSessionStorage(c) {
      if (!c.env.SESSIONS_KV || !c.env.SESSIONS_SECRET) {
        throw new Error('Sessions KV or secret is not set');
      }

      return createWorkersKVSessionStorage({
        kv: c.env.SESSIONS_KV,
        cookie: {
          name: '__session',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: isProd(c),
          secrets: [c.env.SESSIONS_SECRET],
          httpOnly: true,
          sameSite: 'lax',
        },
      });
    },
  }),
);

/*
 * Middleware responsible for:
 * - Protecting logged-in routes.
 */

app.use('*', async (c, next) => {
  const session = getSession<SessionData, SessionFlashData>(c);

  // Verify the user session
  // const {
  // 	data: { user },
  // } = await supabase.auth.getUser();

  // c.set("supabase", supabase);
  // c.set("supabaseUser", user);

  const isAdmin = session.get(AUTH_SESSION_KEY)?.isAdmin;

  if (isAdminRoute(c.req.path) && isAdmin) {
    return next();
  }

  if (isLoggedInRoute(c.req.path)) {
    return next();
  }

  if (isPublicRoute(c.req.path)) {
    return next();
  }

  return c.redirect($path('/auth/sign-in'));
});

/*
 *  Middleware is responsible for setting up Remix.
 */

app.use('*', async (c, next) => {
  const getLoadContext = async (c: Context<ContextEnv>) => {
    const session = getSession<SessionData, SessionFlashData>(c);
    // const sessionStorage = getSessionStorage(c);
    // const user = c.get("supabaseUser");

    const db = await initializeDbClient({
      databaseUrl: c.env.DATABASE_URL,
    });

    const supabase = await createSupabaseServerClient({
      session,
      supabaseUrl: c.env.SUPABASE_URL,
      supabaseKey: c.env.SUPABASE_SECRET_KEY,
    });

    // Refresh session if needed
    await supabase.auth.getSession();

    const sessionUserId = session.get(AUTH_SESSION_KEY)?.sessionUserId;

    return {
      cloudflare: {
        env: c.env,
      },
      db,
      resend: new Resend(c.env.RESEND_API_KEY),
      session,
      supabase,
      // supabaseUser: c.get("supabaseUser"),
      sessionUserId,
      flashMessage: (key: keyof SessionFlashData, message: string) => {
        session.flash(key, JSON.stringify({ message, id: Math.random() }));
      },
      readFlashMessage: (key: keyof SessionFlashData) => {
        const message = session.get(key);

        if (message) {
          return JSON.parse(message);
        }
      },
      getSession: () => {
        const auth = session.get(AUTH_SESSION_KEY);

        if (!auth) {
          // Get session should only be called on authenticated routes.
          // That error is for development purposes only.
          throw new Error('User is not authenticated');
        }

        return auth;
      },
      setSession: (auth) => {
        session.set(AUTH_SESSION_KEY, auth);
      },
      destroySession: () => {
        session.unset(AUTH_SESSION_KEY);
      },
      // sessionStorage: {
      // 	...sessionStorage,
      // 	commitSession: async (session: AuthSession) => {
      // 		if (Object.keys(session.data).length === 0) {
      // 			return; // Skip committing if the session is empty
      // 		}
      // 		return sessionStorage.commitSession(session);
      // 	},
      // 	// destroySession: async (session) => {
      // 	// 	await sessionStorage.destroySession(session);
      // 	// 	await supabase.auth.signOut();
      // 	// }
      // },
    } as AppLoadContext;
  };

  console.log('MODE:', c.env.VITE_ENV);

  if (process.env.NODE_ENV !== 'development' || c.env.VITE_ENV !== 'development') {
    // eslint-disable-next-line import/no-unresolved
    const build = await import('../build/server');

    return remix({
      build: build as unknown as ServerBuild,
      mode: 'production',
      getLoadContext,
    })(c, next);
  } else {
    // @ts-expect-error it's not typed
    // eslint-disable-next-line import/no-unresolved
    const build = await import('virtual:remix/server-build');

    return remix({
      build,
      mode: 'development',
      getLoadContext,
    })(c, next);
  }
});

export default app;
