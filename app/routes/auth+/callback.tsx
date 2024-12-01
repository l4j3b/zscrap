import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';

import { exchangeCodeForSession } from '~/lib/auth.server/actions/exchange-code-for-session';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectUrl = url.searchParams.get('redirect') || '/';

  try {
    await exchangeCodeForSession({ context, code });
  } catch (error) {
    if (error instanceof Error && error.message === 'waitlisted') {
      return redirect($path('/auth/no-access'));
    }

    throw error;
  }

  return redirect(redirectUrl);
}
