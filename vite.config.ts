import path from 'path';

import devServer, { defaultOptions } from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
import { vitePlugin as remix } from '@remix-run/dev';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { remixDevTools } from 'remix-development-tools';
import { flatRoutes } from 'remix-flat-routes';
import { remixRoutes } from 'remix-routes/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// import spotlightSidecar from '@spotlightjs/sidecar/vite-plugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    build: {
      sourcemap: true, // For Sentry
    },
    resolve: {
      alias: {
        ...(mode === 'development' && {
          postgres: path.resolve(__dirname, 'node_modules/postgres/src/index.js'),
        }),
      },
    },
    ssr: {
      resolve: {
        externalConditions: ['workerd', 'worker'],
      },
    },
    plugins: [
      remixDevTools(),
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
        ignoredRouteFiles: ['**/*'],
        routes: async (defineRoutes) => {
          return flatRoutes('routes', defineRoutes, {
            ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}', '**/__*.*'],
          });
        },
      }),
      remixRoutes({
        outDir: '.',
      }),
      tsconfigPaths(),
      devServer({
        adapter,
        entry: 'server/index.ts',
        exclude: [...defaultOptions.exclude, '/assets/**', '/app/**'],
        injectClientScript: false,
      }),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'l4j3b',
        project: 'zscrap',
      }),
      // spotlightSidecar(),
    ],
    server: {
      port: 5173,
    },
  };
});
