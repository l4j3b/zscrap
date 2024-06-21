import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { defer, useLoaderData, useParams } from '@remix-run/react';
import { eq, desc, and } from 'drizzle-orm';
import { CalendarIcon, DownloadIcon, ExternalLink, RefreshCcw, Trash } from 'lucide-react';
import { useEffect } from 'react';
import { $params } from 'remix-routes';
import { toast } from 'sonner';

import { scraperUrlsTable, ScraperUrlStatus } from 'drizzle/schema';
import { DateTooltip } from '~/components/app/DateTooltip';
import { Pre } from '~/components/app/Pre';
import { StatusDot } from '~/components/app/StatusDot';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useConfirmDialog } from '~/lib/hooks/use-confirm-dialog';
import { useLivePageData } from '~/lib/hooks/use-live-page-data';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

import { useDeleteScraperUrlAction } from './actions+/delete';
import { useRefreshScraperUrlAction } from './actions+/refresh';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { urlId } = $params('/in/scrapers/:scraperId/urls/:urlId', params);
  const { activeOrganizationId } = context.getSession();

  const scraperUrl = context.db.query.scraperUrlsTable
    .findFirst({
      where: and(
        eq(scraperUrlsTable.id, urlId),
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
      columns: {
        error: false,
        html: false,
        text: false,
        rawResult: false,
      },
      orderBy: [desc(scraperUrlsTable.updatedAt)],
    })
    .then((scraperUrls) => scraperUrls);

  const scraperUrlExtra = context.db.query.scraperUrlsTable
    .findFirst({
      where: and(
        eq(scraperUrlsTable.id, urlId),
        eq(scraperUrlsTable.organizationId, activeOrganizationId),
      ),
      columns: {
        error: true,
        html: true,
        text: true,
        // rawResult: true,
      },
      orderBy: [desc(scraperUrlsTable.updatedAt)],
    })
    .then((scraperUrls) => {
      return scraperUrls;
    });

  return defer({ scraperUrl, scraperUrlExtra });
}

export default function Url() {
  const params = useParams();
  const data = useLoaderData<typeof loader>();
  const { scraperId, urlId } = $params('/in/scrapers/:scraperId/urls/:urlId', params);
  const { start, stop } = useLivePageData();
  const confirmDialog = useConfirmDialog();
  const refreshUrl = useRefreshScraperUrlAction(scraperId, urlId);
  const deleteUrl = useDeleteScraperUrlAction(scraperId, urlId);

  const { result: scraperUrl, loading } = useResolvePromise(
    data.scraperUrl,
    `scraper-url-${urlId}`,
  );
  const { result: scraperUrlExtra, loading: extraLoading } = useResolvePromise(
    data.scraperUrlExtra,
    `scraper-url-extra-${urlId}`,
  );

  console.log({
    data,
    scraperUrl,
    scraperUrlExtra,
  });

  // Refresh the page every 6 seconds if any scraperUrl is being processed
  useEffect(() => {
    const shouldRefresh =
      scraperUrl?.status === ScraperUrlStatus.Pending ||
      scraperUrl?.status === ScraperUrlStatus.Processing;

    if (shouldRefresh) {
      start();
    } else {
      stop();
    }

    return () => stop();
  }, [scraperUrl?.status]);

  return (
    <div className="flex size-full flex-col">
      <SheetHeader className="space-y-4 pb-4">
        <SheetTitle className="flex items-center">
          <span className="truncate">{scraperUrl?.title || 'URL'}</span>
        </SheetTitle>

        <SheetDescription className="space-y-2" asChild>
          <div>
            <a
              href={scraperUrl?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 truncate"
            >
              <ExternalLink className="size-4 flex-shrink-0" />
              {scraperUrl?.url || 'URL'}
            </a>

            <div className="flex items-center gap-3">
              <StatusDot status={scraperUrl?.status} className="ml-[2px] mr-[2px] size-[10px]" />
              <span className="capitalize">{scraperUrl?.status || 'Status'}</span>
            </div>

            <div className="flex items-center gap-3">
              <CalendarIcon className="size-4" />
              <DateTooltip date={scraperUrl?.updatedAt} label="Last updated:" />
            </div>
          </div>
        </SheetDescription>
      </SheetHeader>

      <Tabs defaultValue="json" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <DownloadIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem asChild>
                  <a href={`/in/scrapers/${scraperId}/urls/${urlId}/result.csv`}>CSV</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/in/scrapers/${scraperId}/urls/${urlId}/result.json`}>JSON</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/in/scrapers/${scraperId}/urls/${urlId}/result.txt`}>TXT</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div>
              <Button
                variant="outline"
                size="icon"
                loading={refreshUrl.loading}
                onClick={async () => {
                  confirmDialog({
                    title: 'Refresh URL',
                    description: 'Are you sure you want to refresh this URL?',
                    okText: 'Refresh URL',
                    onConfirm: async () => {
                      const result = await refreshUrl.submit({});

                      if (result?.error) {
                        toast.error(result.error);
                      } else {
                        toast.success('Processing url...');
                      }
                    },
                  });
                }}
              >
                <RefreshCcw className="size-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              loading={deleteUrl.loading}
              onClick={async () => {
                confirmDialog({
                  title: 'Delete URL',
                  description: 'Are you sure you want to delete this URL?',
                  okText: 'Delete URL',
                  okType: 'destructive',
                  onConfirm: async () => {
                    const result = await deleteUrl.submit({});

                    if (result?.error) {
                      toast.error(result.error);
                    } else {
                      toast.success('URL deleted.');

                      // Redirect to the scraper page
                      window.location.replace(`/in/scrapers/${scraperId}`);
                    }
                  },
                });
              }}
            >
              <Trash className="size-4" />
            </Button>
          </div>

          <TabsList className="max-w-lg">
            <TabsTrigger value="json">JSON</TabsTrigger>
            {/* <TabsTrigger value="raw">RAW</TabsTrigger> */}
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            {scraperUrlExtra?.error && <TabsTrigger value="error">Error</TabsTrigger>}
          </TabsList>
        </div>

        <div className="relative flex flex-1">
          <div className="absolute inset-0 top-3 flex w-full">
            {/* <TabsContent value="raw" asChild>
              <Pre loading={loading}>{scraperUrlExtra?.rawResult}</Pre>
            </TabsContent> */}

            <TabsContent value="error" className="w-full">
              <Pre loading={extraLoading}>{scraperUrlExtra?.error || 'No error'}</Pre>
            </TabsContent>

            <TabsContent value="json" className="w-full">
              <Pre loading={loading}>
                {JSON.stringify(scraperUrl?.jsonResult, null, 2) || 'No jsonResult'}
              </Pre>
            </TabsContent>

            <TabsContent value="text" className="w-full">
              <Pre loading={extraLoading}>{scraperUrlExtra?.text || 'No text'}</Pre>
            </TabsContent>

            <TabsContent value="html" className="w-full">
              <Pre loading={extraLoading}>{scraperUrlExtra?.html || 'No HTML'}</Pre>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
