import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Provider } from '@supabase/supabase-js';
import { $path } from 'remix-routes';

import { signInWithOauth } from '~/lib/auth.server/actions/sign-in-with-oauth';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') as Provider;
  const redirectUrl = url.searchParams.get('redirect') || $path('/');
  const redirectTo = `${url.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`;

  if (!provider) {
    return redirect($path('/'));
  }

  const { error, data } = await signInWithOauth({
    context,
    provider,
    redirectTo,
  });

  if (error || !data.url) {
    return redirect($path('/auth/no-access'));
  }

  return redirect(data.url);
}
