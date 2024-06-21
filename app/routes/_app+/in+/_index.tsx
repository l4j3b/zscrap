import { defer, LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { eq, desc, and, asc, count, or, ilike, SQL, sql } from 'drizzle-orm';
import { debounce } from 'lodash-es';
import { getParams, getSearchParams } from 'remix-params-helper';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { scrapersTable, scraperUrlsTable } from 'drizzle/schema';
import { DataTable, DEFAULT_PAGE_SIZE } from '~/components/data-table';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';
import { dashboardColumns } from '~/lib/data-table/dashboard-columns';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

export const meta: MetaFunction = () => {
  return [{ title: `Dashboard - ${config.app.name}` }];
};

const SearchParamsSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(DEFAULT_PAGE_SIZE),
  search: z.string().optional(),
  sortAttribute: z.string().optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

const getSortColumn = (sortAttribute: string) => {
  switch (sortAttribute) {
    case 'updatedAt':
      return scraperUrlsTable.updatedAt;
    case 'title':
      return scraperUrlsTable.title;
    case 'url':
      return scraperUrlsTable.url;
    case 'status':
      return scraperUrlsTable.status;
    case 'scraperName':
      return scrapersTable.name;
    default:
      return scraperUrlsTable.updatedAt;
  }
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { activeOrganizationId } = context.getSession();
  const parsedSearchParams = getSearchParams(request, SearchParamsSchema);

  if (!parsedSearchParams.success) {
    throw new Error();
  }

  const { page, pageSize, search, sortAttribute, sortOrder } = parsedSearchParams.data;
  const sortFunction = sortOrder === 'asc' ? asc : desc;
  const sortColumn = getSortColumn(sortAttribute);

  const conditions: (SQL<unknown> | undefined)[] = [
    eq(scraperUrlsTable.organizationId, activeOrganizationId),
  ];

  if (search) {
    conditions.push(
      or(
        ilike(scraperUrlsTable.title, `%${search}%`),
        ilike(scraperUrlsTable.url, `%${search}%`),
        sql<string>`cast(${scraperUrlsTable.status} as text) ilike '%' || ${search} || '%'`,
      ),
    );
  }

  const scraperUrls = context.db.query.scraperUrlsTable
    .findMany({
      where: and(...conditions),
      orderBy: [sortFunction(sortColumn)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: {
        scraper: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      columns: {
        id: true,
        url: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    .then((scraperUrls) =>
      scraperUrls.map((scraperUrl) => ({
        ...scraperUrl,
        to: $path('/in/scrapers/:scraperId/urls/:urlId', {
          scraperId: scraperUrl.scraper.id,
          urlId: scraperUrl.id,
        }),
      })),
    );

  const totalRowCount = context.db
    .select({
      count: count(scraperUrlsTable.id),
    })
    .from(scraperUrlsTable)
    .where(and(...conditions))
    .then((result) => result[0].count);

  return defer({ scraperUrls, totalRowCount });
}

export default function AppIndex() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const totalRowCount = useResolvePromise(data.totalRowCount, 'dashboard_urls_index_count');
  const scraperUrls = useResolvePromise(data.scraperUrls, 'dashboard_urls_index');
  const parsedSearchParams = getParams(searchParams, SearchParamsSchema);

  if (!parsedSearchParams.success) {
    throw new Error();
  }

  const debouncedSearch = debounce(setSearchParams, 500);

  const { page, pageSize, search, sortAttribute, sortOrder } = parsedSearchParams.data;

  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle>Dashboard</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <DataTable
          columns={dashboardColumns}
          data={scraperUrls.result}
          loading={scraperUrls.loading}
          rowCount={totalRowCount.result ?? undefined}
          initialState={{
            globalFilter: search,
            pagination: {
              pageIndex: page - 1,
              pageSize,
            },
            sorting: {
              sortAttribute,
              sortOrder,
            },
          }}
          onViewOptionChange={({ pagination, globalFilter, sorting }) => {
            const { pageIndex, pageSize } = pagination;
            const currentParams = new URLSearchParams(searchParams);
            const newParams = new URLSearchParams(currentParams);

            // Update pagination parameters
            newParams.set('page', (pageIndex + 1).toString());
            newParams.set('pageSize', pageSize.toString());

            // Update search term if present
            if (globalFilter) {
              newParams.set('search', globalFilter);
            } else {
              // eslint-disable-next-line drizzle/enforce-delete-with-where
              newParams.delete('search');
            }

            // Update sorting
            if (sorting.length) {
              newParams.set('sortAttribute', sorting[0].id);
              newParams.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
            }

            // Only update if params have changed
            if (currentParams.toString() !== newParams.toString()) {
              debouncedSearch(newParams);
            }
          }}
        />
      </SectionContent>
    </Section>
  );
}
