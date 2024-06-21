import type { AppLoadContext } from '@remix-run/cloudflare';

export async function editPassword({
  context,
  password,
}: {
  context: AppLoadContext;
  password: string;
}) {
  const { error } = await context.supabase.auth.updateUser({
    password: password,
  });

  return { error };
}
