import { redirect, type AppLoadContext } from '@remix-run/cloudflare';

export async function signOut({ context }: { context: AppLoadContext }) {
  await context.supabase.auth.signOut();
  context.destroySession();

  return redirect('/');
}
