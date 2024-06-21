import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { OrganizationRoles, usersToOrganizations } from 'drizzle/schema';
import {
  findUserByEmail,
  requireOrgAdmin,
  resolveSessionUser,
} from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/organization/add-user');

const schema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Email is invalid'),
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

  const { email, role } = submission.value;
  const { activeOrganizationId } = context.getSession();

  // Check if the session user is an admin or owner of the organization
  const sessionUser = await resolveSessionUser(context);
  requireOrgAdmin(sessionUser, activeOrganizationId);

  // Find the target user id
  const targetUser = await findUserByEmail(context.db, email);

  if (!targetUser) {
    return json({
      error: 'User not found.',
    });
  }

  // Add the target user to the organization
  await context.db.insert(usersToOrganizations).values({
    userId: targetUser.id,
    organizationId: activeOrganizationId,
    role: role as OrganizationRoles,
  });

  return json({ error: null });
}

export const useAddUserAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
