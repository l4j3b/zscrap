import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq, not } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { OrganizationRoles, usersToOrganizations } from 'drizzle/schema';
import {
  requireOrgAdmin,
  resolveSessionUser,
  resolveUserOrgRole,
} from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/organization/update-user-role');

const schema = z.object({
  userId: z.string(),
  role: z.enum([OrganizationRoles.Member, OrganizationRoles.Admin], {
    message: 'Role is invalid',
  }),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { userId, role } = submission.value;

  // Check if the session user is an admin or owner of the organization
  const { activeOrganizationId } = context.getSession();
  const sessionUser = await resolveSessionUser(context);
  requireOrgAdmin(sessionUser, activeOrganizationId);

  const { isOrgOwner } = resolveUserOrgRole(sessionUser, activeOrganizationId);

  await context.db
    .update(usersToOrganizations)
    .set({
      role,
    })
    .where(
      and(
        eq(usersToOrganizations.userId, userId),
        eq(usersToOrganizations.organizationId, activeOrganizationId),
        // Do not allow updating role of an owner unless the user is a owner
        isOrgOwner ? undefined : not(eq(usersToOrganizations.role, OrganizationRoles.Owner)),
      ),
    );

  return json({
    error: null,
  });
}

export const useUpdateUserRoleAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
