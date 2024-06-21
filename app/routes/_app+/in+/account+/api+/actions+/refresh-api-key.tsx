import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { refreshApiKey } from '~/lib/api-keys.server';
import { requireOrgOwner, resolveSessionUser } from '~/lib/db.server/queries/find-user';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/account/api/actions/refresh-api-key');

const schema = z.object({});

export async function action({ context }: ActionFunctionArgs) {
  const { activeOrganizationId } = context.getSession();
  const sessionUser = await resolveSessionUser(context);
  requireOrgOwner(sessionUser, activeOrganizationId);

  const apiKey = await refreshApiKey(
    context.db,
    activeOrganizationId,
    context.cloudflare.env.API_KEY_SECRET,
  );

  if (!apiKey) {
    return json({
      apiKey: null,
      error: 'Failed to refresh API key.',
    });
  }

  return json({ error: null, apiKey });
}

export const useRefreshApiKeyAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
