import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { setAuthSession } from '~/lib/auth.server/utils/set-auth-session';
import { findUserById } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/restricted/admin/actions/switch-user');

const schema = z.object({
  userId: z.string(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { isAdmin } = context.getSession();

  if (!isAdmin) {
    throw new Error('Unauthorized.');
  }

  const { userId } = submission.value;
  const user = await findUserById(context.db, userId);

  if (!user) {
    throw new Error('User not found.');
  }

  setAuthSession(context, {
    whitelisted: user.whitelisted,
    sessionUserId: user.id,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    isAdmin: true, // TODO: optional?
    activeOrganizationId: user.usersToOrganizations[0].organizationId,
  });

  return json({ error: null });
}

export const useSwitchUser = createUseActionHook<typeof action, typeof schema>(actionPath, schema);
