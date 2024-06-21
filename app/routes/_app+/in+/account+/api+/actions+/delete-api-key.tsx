import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { apiKeysTable } from 'drizzle/schema';
import { requireOrgOwner, resolveSessionUser } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/api/actions/delete-api-key');

const schema = z.object({});

export async function action({ context }: ActionFunctionArgs) {
  const { activeOrganizationId } = context.getSession();
  const sessionUser = await resolveSessionUser(context);
  requireOrgOwner(sessionUser, activeOrganizationId);

  await context.db
    .delete(apiKeysTable)
    .where(eq(apiKeysTable.organizationId, activeOrganizationId));

  return json({ error: null });
}

export const useDeleteApiKeyAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
