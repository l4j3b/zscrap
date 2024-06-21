import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { setActiveOrg } from '~/lib/auth.server/utils/set-active-org';
import { findUserById, resolveUserOrgRole } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/actions/set-active-org');

const schema = z.object({
  organizationId: z.string(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { organizationId } = submission.value;
  const { sessionUserId, activeOrganizationId } = context.getSession();

  if (organizationId === activeOrganizationId) {
    // Do nothing if the organization is already active
    return json({ error: null });
  }

  // Check if the user is part of the requested organization
  const sessionUser = await findUserById(context.db, sessionUserId);
  const { role } = resolveUserOrgRole(sessionUser, organizationId);

  if (!role) {
    throw new Error('Unauthorized.');
  }

  // User is part of the organization, set it as the active organization
  await setActiveOrg(context, organizationId);

  return json({ error: null });
}

export const useSetActiveOrg = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
