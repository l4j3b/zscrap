import { LoaderFunctionArgs } from '@remix-run/cloudflare';
// import { stringify } from 'csv-stringify/sync';
import { eq, and } from 'drizzle-orm';
import { $params } from 'remix-routes';

import { scraperUrlsTable } from 'drizzle/schema';
import { generateCSV } from '~/lib/utils';

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

  const data = { url: scraperUrl.url, result: scraperUrl.jsonResult };
  // const csvData = stringify([data], { header: true });
  const csvData = generateCSV([data]);

  return new Response(csvData, {
    headers: {
      'Content-Disposition': `attachment; filename="result-${scraperUrl.url}.csv"`,
      'Content-Type': 'text/csv',
    },
  });
}
