import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq, inArray, not } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { scraperUrlsTable, ScraperUrlStatus } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';
import { sendScraperUrlsToSQS } from '~/lib/services.server/send-scraper-url-to-sqs';

const schema = z.object({
  scraperUrlIds: z
    .string()
    .transform(
      (value) =>
        value
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean), // Ensure no empty values
    )
    .pipe(z.string().uuid().array()), // Ensures that each value is a valid UUID
});
const actionPath = (scraperId: string) =>
  $path('/in/scrapers/:scraperId/actions/refresh-urls', { scraperId });

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { scraperUrlIds } = submission.value;
  const { activeOrganizationId } = context.getSession();

  // Check if a scraperUrlId does not belong to the active organization
  // TODO: Check the scraperUrlIds belong to the active organization in the lambda function instead?
  const scraperUrls = await context.db.query.scraperUrlsTable.findMany({
    where: and(
      inArray(scraperUrlsTable.id, scraperUrlIds),
      not(eq(scraperUrlsTable.organizationId, activeOrganizationId)),
    ),
  });

  if (scraperUrls.length > 0) {
    throw new Error('Something went wrong. Please try again.');
  }

  // Set the status to pending
  await context.db
    .update(scraperUrlsTable)
    .set({ status: ScraperUrlStatus.Pending })
    .where(
      and(
        inArray(scraperUrlsTable.id, scraperUrlIds),
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
    );

  // Send the scraperUrlIds to SQS
  sendScraperUrlsToSQS(scraperUrlIds, context);

  return json({ error: null });
}

export const useRefreshScraperUrlsAction = (scraperId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId), schema)();
