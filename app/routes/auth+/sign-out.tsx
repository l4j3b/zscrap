import { redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { signOut } from '~/lib/auth.server/actions/sign-out';
import { createUseActionHook } from '~/lib/hooks/use-action';

export async function action({ context }: ActionFunctionArgs) {
  await signOut({ context });

  return redirect($path('/'));
}

export async function loader() {
  return redirect($path('/'));
}

const actionPath = $path('/auth/sign-out');

const schema = z.object({});

export const useSignOutAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
