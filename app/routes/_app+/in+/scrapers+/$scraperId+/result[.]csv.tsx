import { json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { eq, and } from 'drizzle-orm';
import { $params } from 'remix-routes';

import { scrapersTable } from 'drizzle/schema';
import { generateCSV } from '~/lib/utils';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { scraperId } = $params('/in/scrapers/:scraperId', params);
  const { activeOrganizationId } = context.getSession();

  const scraper = await context.db.query.scrapersTable.findFirst({
    where: and(
      eq(scrapersTable.id, scraperId),
      eq(scrapersTable.organizationId, activeOrganizationId),
    ),
    columns: {
      name: true,
    },
    with: {
      scraperUrls: {
        columns: {
          url: true,
          jsonResult: true,
        },
      },
    },
  });

  if (!scraper) {
    throw new Response('Not Found', { status: 404 });
  }

  const data = scraper.scraperUrls.map((url) => ({
    url: url.url,
    result: url.jsonResult,
  }));

  const csvData = generateCSV([data]);

  return json(csvData, {
    headers: {
      'Content-Disposition': `attachment; filename="result-${scraper.name}.csv"`,
      'Content-Type': 'text/csv',
    },
  });
}
