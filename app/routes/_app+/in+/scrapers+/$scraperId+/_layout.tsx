import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { defer, Outlet, useLoaderData, useMatches, useNavigate, useParams } from '@remix-run/react';
import { eq, and, desc } from 'drizzle-orm';
import { CalendarIcon, DownloadIcon, Link, RefreshCcw, Terminal, Trash, User } from 'lucide-react';
import { useEffect } from 'react';
import { MdNumbers } from 'react-icons/md';
import { $params, $path, $routeId } from 'remix-routes';
import { toast } from 'sonner';

import { scrapersTable, scraperUrlsTable, ScraperUrlStatus } from 'drizzle/schema';
import { DateTooltip } from '~/components/app/DateTooltip';
import { Pre } from '~/components/app/Pre';
import { DataTable } from '~/components/data-table';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Section,
  SectionHeader,
  SectionTitle,
  SectionContent,
  SectionDescription,
} from '~/components/ui/section';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { scraperUrlsColumns } from '~/lib/data-table/scraper-urls-columns';
import { useConfirmDialog } from '~/lib/hooks/use-confirm-dialog';
import { useLivePageData } from '~/lib/hooks/use-live-page-data';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

import { useDeleteScraperAction } from './actions+/delete';
import { useDeleteScraperUrlsAction } from './actions+/delete-urls';
import { useRefreshScraperUrlsAction } from './actions+/refresh-urls';
import { AddScraperUrlDialog } from './components/AddScraperUrlDialog';
import { UpdateScraperDialog } from './components/UpdateScraperDialog';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { scraperId } = $params('/in/scrapers/:scraperId', params);
  const { activeOrganizationId } = context.getSession();

  const scraper = context.db.query.scrapersTable
    .findFirst({
      where: and(
        eq(scrapersTable.id, scraperId),
        eq(scrapersTable.organizationId, activeOrganizationId),
      ),
      with: {
        createdBy: true,
      },
    })
    .then((scraper) => scraper);

  const scraperUrls = context.db.query.scraperUrlsTable
    .findMany({
      where: and(
        eq(scraperUrlsTable.scraperId, scraperId),
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
      columns: {
        id: true,
        url: true,
        title: true,
        status: true,
        scraperId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: desc(scraperUrlsTable.updatedAt),
    })
    .then((scraperUrls) =>
      scraperUrls.map((scraperUrl) => ({
        ...scraperUrl,
        to: $path('/in/scrapers/:scraperId/urls/:urlId', {
          scraperId: scraperUrl.scraperId,
          urlId: scraperUrl.id,
        }),
      })),
    );

  return defer({ scraper, scraperUrls });
}

export default function Scraper() {
  const params = useParams();
  const { scraperId } = $params('/in/scrapers/:scraperId', params);
  const matches = useMatches();
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();
  const { start, stop } = useLivePageData();
  const confirmDialog = useConfirmDialog();
  const deleteScraperAction = useDeleteScraperAction(scraperId);
  const refreshScraperUrlsAction = useRefreshScraperUrlsAction(scraperId);
  const deleteScraperUrlAction = useDeleteScraperUrlsAction(scraperId);

  const { result: scraper, loading: scraperLoading } = useResolvePromise(
    data.scraper,
    `scraper-${scraperId}`,
  );

  const { result: scraperUrls, loading: scraperUrlsLoading } = useResolvePromise(
    data.scraperUrls,
    `scraper-${scraperId}_urls`,
  );

  // Check if the current route is a scraperUrl route for the layout
  const isScraperUrlRoute = matches.some(
    (match) => match.id === $routeId('routes/_app+/in+/scrapers+/$scraperId+/urls+/$urlId+/_index'),
  );

  // Refresh the page every 6 seconds if any scraperUrl is being processed
  useEffect(() => {
    const shouldRefresh = scraperUrls?.some(
      (scraperUrl) =>
        scraperUrl.status === ScraperUrlStatus.Processing ||
        scraperUrl.status === ScraperUrlStatus.Pending,
    );

    if (shouldRefresh) {
      start();
    } else {
      stop();
    }

    return () => stop();
  }, [scraperUrls]);

  const tabsList = (
    <TabsList>
      <TabsTrigger value="urls" className="flex items-center gap-3">
        <Link className="size-4" />
        URLs
      </TabsTrigger>
      <TabsTrigger value="prompt" className="flex items-center gap-3">
        <Terminal className="size-4" />
        Instructions
      </TabsTrigger>
    </TabsList>
  );

  return (
    <Tabs defaultValue="urls" className="flex flex-1">
      <Section>
        <SectionHeader className="flex flex-row justify-between">
          <SectionTitle className="flex-shrink truncate">{scraper?.name || 'Scraper'}</SectionTitle>
          <div className="flex flex-1 justify-between">
            <div className="ml-4 flex items-center">
              <UpdateScraperDialog scraperId={scraperId} scraperName={scraper?.name ?? ''} />

              <Button
                variant="ghost"
                size="icon"
                loading={refreshScraperUrlsAction.loading}
                onClick={async () => {
                  confirmDialog({
                    title: 'Delete scraper',
                    description:
                      'Are you sure you want to delete the scraper? All the results will be lost.',
                    okText: 'Delete scraper',
                    okType: 'destructive',
                    onConfirm: async () => {
                      const result = await deleteScraperAction.submit({});

                      if (result?.error) {
                        toast.error(result.error);
                      } else {
                        window.location.href = $path('/in/scrapers');
                      }
                    },
                  });
                }}
              >
                <Trash className="size-4" />
              </Button>
            </div>

            <AddScraperUrlDialog scraperId={scraperId} />
          </div>
        </SectionHeader>

        <SectionContent
          className={
            `flex !pt-0`
            // 'xl:grid xl:grid-cols-10 xl:gap-4 xl:space-y-0'
          }
        >
          <div>
            <SectionDescription className="m-0 flex flex-shrink items-center gap-2 py-0 pl-2">
              <div className="flex items-center gap-3">
                <MdNumbers className="size-4" />
                {scraper?.id || 'ID'}{' '}
                <Button
                  size={'sm'}
                  variant="ghost"
                  className="text-muted-foreground"
                  innerClassName="my-0 py-0"
                  onClick={() => {
                    navigator.clipboard.writeText(scraper?.id || '');
                  }}
                >
                  Copy ID
                </Button>
              </div>
            </SectionDescription>

            <SectionDescription className="m-0 flex flex-row justify-between py-0 pl-2">
              <div
                className={`
                  flex flex-col gap-3
                  sm:flex-row
                `}
              >
                <div className="flex items-center gap-3">
                  <User className="size-4" />
                  {scraper?.createdBy?.displayName || 'Created by'}
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="size-4" />
                  <DateTooltip date={scraper?.createdAt} label="Created at:" />
                </div>
              </div>
            </SectionDescription>
          </div>

          <TabsContent value="prompt" className={`flex-1 flex-col gap-3`}>
            <div>{tabsList}</div>
            <div className={`flex flex-1 flex-col gap-3`}>
              <Pre title="Instructions" loading={scraperLoading} className="flex flex-1">
                {scraper?.prompt}
              </Pre>
              <Pre title="JSON Schema" loading={scraperLoading} className="flex flex-1">
                {scraper?.jsonSchema}
              </Pre>
            </div>
          </TabsContent>

          <TabsContent value="urls" className="flex-1">
            <DataTable
              columns={scraperUrlsColumns}
              data={scraperUrls}
              loading={scraperUrlsLoading}
              initialState={{
                sorting: {
                  sortAttribute: 'updatedAt',
                  sortOrder: 'desc',
                },
              }}
              toolbar={(table) => {
                return (
                  <div className="flex items-center gap-2">
                    {tabsList}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <DownloadIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="start">
                        <DropdownMenuItem asChild>
                          <a href={`/in/scrapers/${scraperId}/result.csv`}>CSV</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/in/scrapers/${scraperId}/result.json`}>JSON</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/in/scrapers/${scraperId}/result.txt`}>TXT</a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="outline"
                      size="icon"
                      loading={refreshScraperUrlsAction.loading}
                      disabled={table.getSelectedRowModel().rows.length === 0}
                      onClick={async () => {
                        confirmDialog({
                          title: 'Reprocess URLs',
                          description:
                            'Are you sure you want to reprocess the selected URLs? Reprocessing will be charged 1 credit per URL.',
                          okText: 'Reprocess URLs',
                          onConfirm: async () => {
                            const result = await refreshScraperUrlsAction.submit({
                              scraperUrlIds: table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original.id),
                            });

                            if (result?.error) {
                              toast.error(result.error);
                            } else {
                              toast.success('Reprocessing URLs...');
                            }
                          },
                        });
                      }}
                    >
                      <RefreshCcw className="size-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      loading={deleteScraperUrlAction.loading}
                      disabled={table.getSelectedRowModel().rows.length === 0}
                      onClick={async () => {
                        confirmDialog({
                          title: 'Delete URLs',
                          description: 'Are you sure you want to delete the selected URLs?',
                          okText: 'Delete URLs',
                          okType: 'destructive',
                          onConfirm: async () => {
                            const result = await deleteScraperUrlAction.submit({
                              scraperUrlIds: table
                                .getSelectedRowModel()
                                .rows.map((row) => row.original.id),
                            });

                            if (result?.error) {
                              toast.error(result.error);
                            } else {
                              toast.success('URL deleted.');
                            }
                          },
                        });
                      }}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                );
              }}
            />
          </TabsContent>
        </SectionContent>
      </Section>

      <Sheet
        open={isScraperUrlRoute}
        onOpenChange={(open) => {
          if (!open) {
            navigate($path('/in/scrapers/:scraperId', { scraperId }));
          }
        }}
      >
        <SheetContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          side="right"
          className={`
            w-full overflow-y-scroll transition-all
            sm:w-[calc(100%-160px)]
          `}
        >
          <Outlet />
        </SheetContent>
      </Sheet>
    </Tabs>
  );
}
