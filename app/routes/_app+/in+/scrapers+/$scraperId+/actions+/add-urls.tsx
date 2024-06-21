import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { scraperUrlsTable } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';
import { sendScraperUrlsToSQS } from '~/lib/services.server/send-scraper-url-to-sqs';

export const MAX_URLS = 1000;

const schema = z.object({
  urls: z
    .string()
    .transform((value) =>
      value
        .split(/[,\n]+/)
        .map((url) => url.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .string()
        .trim()
        .url('Url is invalid')
        .array()
        .max(MAX_URLS, `You can only add up to ${MAX_URLS} URLs at a time.`),
    ),
});

const actionPath = (scraperId: string) =>
  $path('/in/scrapers/:scraperId/actions/add-urls', { scraperId });

export async function action({ request, context, params }: ActionFunctionArgs) {
  const { scraperId } = $params('/in/scrapers/:scraperId', params);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { urls } = submission.value;

  if (urls.length > MAX_URLS) {
    throw new Error(`You can only add up to ${MAX_URLS.toLocaleString()} URLs at a time.`);
  }

  const { activeOrganizationId } = context.getSession();

  // Add the URLs to the scraper
  const scraperUrls = await context.db
    .insert(scraperUrlsTable)
    .values(
      urls.map((url) => ({
        url,
        scraperId,
        organizationId: activeOrganizationId,
      })),
    )
    .returning();

  // Extract scraperUrlIds
  const scraperUrlIds = scraperUrls.map((su) => su.id);

  // Send the scraperUrlIds to SQS
  await sendScraperUrlsToSQS(scraperUrlIds, context);

  return json({ error: null });
}

export const useAddScraperUrlsAction = (scraperId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId), schema)();
