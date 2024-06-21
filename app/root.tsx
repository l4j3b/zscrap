import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import nprogress from 'nprogress';
import { useRef } from 'react';
import { $path } from 'remix-routes';
import { PreventFlashOnWrongTheme, Theme, ThemeProvider, useTheme } from 'remix-themes';
import { useGlobalNavigationState } from 'remix-utils/use-global-navigation-state';

import { Loader } from '~/components/app/Loader';
import { Logo } from '~/components/app/Logo';
import { Toaster } from '~/components/ui/sonner';
import { TooltipProvider } from '~/components/ui/tooltip';
import { config } from '~/config';

import { ConfirmProvider } from './lib/hooks/use-confirm-dialog';
import { themeSessionResolver } from './lib/sessions.server';
import { setThemeActionPath } from './routes/actions+/set-theme';

import 'nprogress/nprogress.css';
import '~/tailwind.css';
import '~/styles.css';

nprogress.configure({ showSpinner: false });

export const meta: MetaFunction = () => {
  return [{ title: `${config.app.name}` }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);

  return {
    theme: getTheme(),
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>('root');

  return (
    <ThemeProvider
      specifiedTheme={data?.theme as Theme}
      themeAction={setThemeActionPath}
      disableTransitionOnThemeChange
    >
      <TooltipProvider>
        <ConfirmProvider>
          <InnerLayout ssrTheme={Boolean(data?.theme)}>{children}</InnerLayout>
        </ConfirmProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function InnerLayout({ ssrTheme, children }: { ssrTheme: boolean; children: React.ReactNode }) {
  const npProgressTimeOutId = useRef<NodeJS.Timeout | null>(null);
  const [theme] = useTheme();
  const states = useGlobalNavigationState();

  if (states.includes('loading')) {
    if (npProgressTimeOutId.current) {
      clearTimeout(npProgressTimeOutId.current);
    }

    nprogress.start();
  } else {
    npProgressTimeOutId.current = setTimeout(() => {
      nprogress.done();
    }, 120);
  }

  return (
    <html lang="en" data-theme={theme ?? ''} className="size-full overflow bg-background">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="title" content={config.app.name} />
        <meta name="description" content={config.app.description} />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
        <Links />
      </head>

      <body className="font-sans text-foreground">
        {children}
        <Scripts />
        <Toaster richColors duration={2400} />
        <ScrollRestoration />

        {/* <svg width="" height="" className="size-0">
          <linearGradient
            id="svg-brand-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            gradientTransform="rotate(-45)"
          >
            <stop offset="20%" id="svg-brand-gradient-stop-1" />
            <stop offset="60%" id="svg-brand-gradient-stop-2" />
            <stop offset="90%" id="svg-brand-gradient-stop-3" />
          </linearGradient>
        </svg> */}
      </body>
    </html>
  );
}

function App() {
  return <Outlet />;
}

export default withSentry(App);

export function HydrateFallback() {
  return <Loader loading />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isProd = !import.meta.env.DEV;

  console.log('Error', error);
  captureRemixErrorBoundaryError(error);

  let errorContent = (
    <>
      <h1 className="pb-4 text-5xl">Error :(</h1>

      <p>Something went wrong... 👾</p>
    </>
  );

  if (isRouteErrorResponse(error)) {
    errorContent = (
      <>
        <h1 className="pb-4 text-5xl">404</h1>

        {isProd ? (
          <>
            <p>This is not the web page you are looking for 🤖.</p>
          </>
        ) : (
          <>
            <p>{error.statusText}</p>
            <p>{error.data}</p>
          </>
        )}
      </>
    );
  } else if (error instanceof Error) {
    errorContent = (
      <>
        <h1 className="pb-4 text-5xl">500</h1>

        {isProd ? (
          <>
            <p>Sorry, something went wrong... 🔧</p>

            <p>
              The error has been reported. Please try again later. If the error persists, please
              contact us.
            </p>
          </>
        ) : (
          <>
            <p>{error.message}</p>
            <pre>{error.stack}</pre>
          </>
        )}
      </>
    );
  }

  return (
    <div className="m-4">
      <div className="ml-2 mr-7 flex items-center text-3xl">
        <Link to={$path('/')} className="mr-7 flex items-center">
          <Logo />
        </Link>
      </div>

      <div className="m-12">
        <div className="mx-auto max-w-6xl space-y-4">
          {errorContent}

          <p>
            To go back to the app, <a href={$path('/in')}>Click here</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
