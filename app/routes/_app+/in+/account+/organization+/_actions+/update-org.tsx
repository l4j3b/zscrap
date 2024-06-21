import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { organizationsTable } from 'drizzle/schema';
import { requireOrgAdmin, resolveSessionUser } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/organization/update-org');

const schema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name is too short (min 3 characters)')
    .max(24, 'Name is too long (max 24 characters)'),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { name } = submission.value;
  const { activeOrganizationId } = context.getSession();

  // Check if the session user is an admin or owner of the organization
  const sessionUser = await resolveSessionUser(context);
  requireOrgAdmin(sessionUser, activeOrganizationId);

  await context.db
    .update(organizationsTable)
    .set({
      name,
    })
    .where(eq(organizationsTable.id, activeOrganizationId));

  return json({ error: null });
}

export const useUpdateOrgAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
