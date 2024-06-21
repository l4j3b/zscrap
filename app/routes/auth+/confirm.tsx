import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { EmailOtpType } from '@supabase/supabase-js';
import { $path } from 'remix-routes';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');

  if (!token_hash || !type) {
    throw new Error('Invalid token_hash or type');
  }

  await context.supabase.auth.verifyOtp({
    token_hash,
    type: type as EmailOtpType,
  });

  return redirect($path('/in'));
}
