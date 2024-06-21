import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { eq, and } from 'drizzle-orm';
import { $params } from 'remix-routes';

import { scraperUrlsTable } from 'drizzle/schema';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { urlId } = $params('/in/scrapers/:scraperId/urls/:urlId', params);
  const { activeOrganizationId } = context.getSession();

  const scraperUrl = await context.db.query.scraperUrlsTable.findFirst({
    where: and(
      eq(scraperUrlsTable.id, urlId),
      eq(scraperUrlsTable.organizationId, activeOrganizationId),
    ),
    columns: {
      url: true,
      jsonResult: true,
    },
  });

  if (!scraperUrl) {
    throw new Response('Not Found', { status: 404 });
  }

  return new Response(scraperUrl.jsonResult, {
    headers: {
      'Content-Disposition': `attachment; filename="result-${scraperUrl.url}.txt"`,
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
