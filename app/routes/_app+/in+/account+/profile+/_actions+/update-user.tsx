import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { get } from 'lodash-es';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { usersTable } from 'drizzle/schema';
import { resolveSessionUser, requireOrgAdmin } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/profile/update-user');

const schema = z.object({
  displayName: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name is too short (min 3 characters)')
    .max(24, 'Name is too long (min 24 characters)'),
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username is too short (min 3 characters)')
    .max(12, 'Username is too long (max 12 characters)'),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  try {
    if (submission.status !== 'success') {
      throw new Error('Invalid form submission.');
    }

    const { displayName, username } = submission.value;
    const { sessionUserId, activeOrganizationId } = context.getSession();

    // Check if the session user is an admin or owner of the organization
    const sessionUser = await resolveSessionUser(context);
    requireOrgAdmin(sessionUser, activeOrganizationId);

    await context.db
      .update(usersTable)
      .set({
        displayName,
        username,
      })
      .where(eq(usersTable.id, sessionUserId));

    // Update the session
    context.setSession({
      ...context.getSession(),
      displayName,
      username,
    });

    return json({ error: null });
  } catch (error) {
    // Catching the error here so we can verify that case
    if (get(error, 'code') === '23505') {
      // if error is unique constraint violation on username
      return json({
        error: 'Username is already taken.',
      });
    }

    throw error;
  }
}

export const useUpdateUserAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
