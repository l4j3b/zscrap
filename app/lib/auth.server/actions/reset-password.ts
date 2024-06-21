import { type AppLoadContext } from '@remix-run/cloudflare';

export async function resetPassword({
  context,
  email,
}: {
  context: AppLoadContext;
  email: string;
}) {
  const { error } = await context.supabase.auth.resetPasswordForEmail(email);

  return { error };
}
