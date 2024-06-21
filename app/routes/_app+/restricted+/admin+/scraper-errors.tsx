import { type LoaderFunctionArgs, defer } from '@remix-run/cloudflare';
import { Await, useLoaderData } from '@remix-run/react';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { Suspense } from 'react';

import { scraperUrlsTable, ScraperUrlStatus } from 'drizzle/schema';
import { Loader } from '~/components/app/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/ui/table';

export async function loader({ context }: LoaderFunctionArgs) {
  const scraperErrors = context.db.query.scraperUrlsTable
    .findMany({
      where: and(
        eq(scraperUrlsTable.status, ScraperUrlStatus.Failed),
        isNotNull(scraperUrlsTable.error),
      ),
      orderBy: desc(scraperUrlsTable.createdAt),
    })
    .then((scraperErrors) => scraperErrors);

  return defer({
    scraperErrors,
  });
}

export default function AdminScraperErrors() {
  const { scraperErrors } = useLoaderData<typeof loader>();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scraper errors</CardTitle>
        </CardHeader>

        <CardContent className="relative min-h-24">
          <Suspense fallback={<Loader loading relative />}>
            <Await resolve={scraperErrors}>
              {(scraperErrors) => (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Title</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {scraperErrors.map((scraperError) => (
                      <TableRow key={scraperError.id}>
                        <TableCell>{scraperError.id}</TableCell>
                        <TableCell>{scraperError.error}</TableCell>
                        <TableCell>{scraperError.url}</TableCell>
                        <TableCell>{scraperError.title}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Await>
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
