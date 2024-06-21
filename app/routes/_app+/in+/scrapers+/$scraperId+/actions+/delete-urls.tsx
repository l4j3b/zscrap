import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq, inArray } from 'drizzle-orm';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { scraperUrlsTable } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';

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
  $path('/in/scrapers/:scraperId/actions/delete-urls', { scraperId });

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { scraperUrlIds } = submission.value;
  const { activeOrganizationId } = context.getSession();

  // Add the URLs to the scraper
  await context.db
    .delete(scraperUrlsTable)
    .where(
      and(
        inArray(scraperUrlsTable.id, scraperUrlIds),
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
    );

  return json({ error: null });
}

export const useDeleteScraperUrlsAction = (scraperId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId), schema)();
