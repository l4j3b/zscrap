import { AppLoadContext } from '@remix-run/cloudflare';
import { Provider } from '@supabase/supabase-js';

export async function signInWithOauth({
  context,
  provider,
  redirectTo,
}: {
  context: AppLoadContext;
  provider: Provider;
  redirectTo: string;
}) {
  const { data, error } = await context.supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  return { error, data };
}
