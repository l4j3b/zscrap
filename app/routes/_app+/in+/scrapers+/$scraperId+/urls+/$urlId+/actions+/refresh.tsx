import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { scraperUrlsTable, ScraperUrlStatus } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';
import { sendScraperUrlsToSQS } from '~/lib/services.server/send-scraper-url-to-sqs';

const schema = z.object({});

const actionPath = (scraperId: string, urlId: string) =>
  $path('/in/scrapers/:scraperId/urls/:urlId/actions/refresh', { scraperId, urlId });

export async function action({ context, params }: ActionFunctionArgs) {
  const { scraperId, urlId } = $params('/in/scrapers/:scraperId/urls/:urlId', params);
  const { activeOrganizationId } = context.getSession();

  // Set the status to pending
  await context.db
    .update(scraperUrlsTable)
    .set({ status: ScraperUrlStatus.Pending })
    .where(
      and(
        eq(scraperUrlsTable.id, urlId),
        eq(scraperUrlsTable.scraperId, scraperId), // TODO: remove this? double check
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
    );

  // Trigger the url processing
  await sendScraperUrlsToSQS([urlId], context);

  return json({ error: null, status: 'success' });
}

export const useRefreshScraperUrlAction = (scraperId: string, urlId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId, urlId), schema)();
