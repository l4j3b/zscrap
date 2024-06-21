import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { scraperUrlsTable } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';

const schema = z.object({});

const actionPath = (scraperId: string, urlId: string) =>
  $path('/in/scrapers/:scraperId/urls/:urlId/actions/delete', { scraperId, urlId });

export async function action({ context, params }: ActionFunctionArgs) {
  const { scraperId, urlId } = $params('/in/scrapers/:scraperId/urls/:urlId', params);
  const { activeOrganizationId } = context.getSession();

  await context.db
    .delete(scraperUrlsTable)
    .where(
      and(
        eq(scraperUrlsTable.id, urlId),
        eq(scraperUrlsTable.scraperId, scraperId),
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
    );

  return json({ error: null, status: 'success' });
}

export const useDeleteScraperUrlAction = (scraperId: string, urlId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId, urlId), schema)();
