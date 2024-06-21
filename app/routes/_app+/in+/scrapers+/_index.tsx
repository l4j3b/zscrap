import { defer, LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { count, desc, eq } from 'drizzle-orm';
import { $path } from 'remix-routes';

import { scrapersTable, scraperUrlsTable, usersTable } from 'drizzle/schema';
import { DataTable } from '~/components/data-table';
import { Button } from '~/components/ui/button';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';
import { scrapersColumns } from '~/lib/data-table/scrapers-columns';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

export const meta: MetaFunction = () => {
  return [{ title: `Scrapers - ${config.app.name}` }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { activeOrganizationId } = context.getSession();

  // const scrapers = context.db.query.scrapersTable
  //   .findMany({
  //     where: eq(scrapersTable.organizationId, activeOrganizationId),
  //     orderBy: [desc(scrapersTable.createdAt)],
  //     with: {
  //       createdBy: true,
  //     },
  //   })
  //   .then((scrapers) => scrapers);

  const scrapersQuery = context.db
    .select({
      id: scrapersTable.id,
      name: scrapersTable.name,
      createdBy: usersTable.displayName,
      createdAt: scrapersTable.createdAt,
      urlCount: count(scraperUrlsTable.id),
    })
    .from(scrapersTable)
    .where(eq(scrapersTable.organizationId, activeOrganizationId))
    .leftJoin(scraperUrlsTable, eq(scrapersTable.id, scraperUrlsTable.scraperId))
    .leftJoin(usersTable, eq(scrapersTable.createdById, usersTable.id))
    .groupBy(scrapersTable.id, usersTable.id)
    .orderBy(desc(scrapersTable));

  const scrapers = scrapersQuery.then((scrapers) =>
    scrapers.map((scraper) => ({
      ...scraper,
      to: $path('/in/scrapers/:scraperId', {
        scraperId: scraper.id,
      }),
    })),
  );

  return defer({ scrapers });
}

export default function Scrapers() {
  const data = useLoaderData<typeof loader>();
  const scrapers = useResolvePromise(data.scrapers, 'scrapers_index');

  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle>SCRAPERS</SectionTitle>

        <Link to={$path('/in/scrapers/new')}>
          <Button variant={'secondary'}>New scraper</Button>
        </Link>
      </SectionHeader>

      <SectionContent>
        <DataTable columns={scrapersColumns} data={scrapers.result} loading={scrapers.loading} />
        <Outlet />
      </SectionContent>
    </Section>
  );
}
