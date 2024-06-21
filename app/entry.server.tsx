import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
// import * as Sentry from '@sentry/remix';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (!request.signal.aborted) {
    throw error;
  }
}

// export const handleError = Sentry.sentryHandleError;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext,
) {
  let status = responseStatusCode;

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        console.error(error);
        status = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent') || '')) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(body, {
    headers: responseHeaders,
    status,
  });
}
