import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq, not } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { OrganizationRoles, usersToOrganizations } from 'drizzle/schema';
import { setActiveOrg } from '~/lib/auth.server/utils/set-active-org';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/profile/leave-org');

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

  await context.db.delete(usersToOrganizations).where(
    and(
      eq(usersToOrganizations.organizationId, organizationId),
      eq(usersToOrganizations.userId, context.sessionUserId),
      // Do not allow removing of an owner
      not(eq(usersToOrganizations.role, OrganizationRoles.Owner)),
    ),
  );

  await setActiveOrg(context, null);

  return json({ error: null });
}

export const useLeaveOrgAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
