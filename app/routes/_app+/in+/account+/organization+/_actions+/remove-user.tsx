import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq, not } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { OrganizationRoles, usersToOrganizations } from 'drizzle/schema';
import { requireOrgAdmin, resolveSessionUser } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/organization/remove-user');

const schema = z.object({
  userId: z.string(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { userId } = submission.value;
  const { activeOrganizationId } = context.getSession();

  // if (userId === sessionUserId) {
  //   return json({
  //     error: "You cannot remove yourself from the organization.",
  //   });
  // }

  const sessionUser = await resolveSessionUser(context);
  requireOrgAdmin(sessionUser, activeOrganizationId);

  const result = await context.db.delete(usersToOrganizations).where(
    and(
      eq(usersToOrganizations.organizationId, activeOrganizationId),
      eq(usersToOrganizations.userId, userId),
      // Do not allow removing of an owner
      not(eq(usersToOrganizations.role, OrganizationRoles.Owner)),
    ),
  );

  if (!result.length) {
    return json({
      error: 'You cannot remove an organization owner.',
    });
  }

  return json({ error: null });
}

export const useRemoveUserAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
