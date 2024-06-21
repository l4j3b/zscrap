import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { scrapersTable } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';

const schema = z.object({});

const actionPath = (scraperId: string) =>
  $path('/in/scrapers/:scraperId/actions/delete', { scraperId });

export async function action({ context, params }: ActionFunctionArgs) {
  const { scraperId } = $params('/in/scrapers/:scraperId', params);
  const { activeOrganizationId } = context.getSession();

  await context.db
    .delete(scrapersTable)
    .where(
      and(eq(scrapersTable.id, scraperId), eq(scrapersTable.organizationId, activeOrganizationId)),
    );

  return json({ error: null });
}

export const useDeleteScraperAction = (scraperId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId), schema)();
