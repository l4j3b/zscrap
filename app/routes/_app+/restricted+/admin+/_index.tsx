import { LoaderFunctionArgs, defer } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { format, eachDayOfInterval } from 'date-fns';
import { count, sql } from 'drizzle-orm';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Theme, useTheme } from 'remix-themes';

import { organizationsTable, scraperUrlsTable, usersTable } from 'drizzle/schema';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '~/components/ui/chart';
import { Label } from '~/components/ui/label';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

export async function loader({ context }: LoaderFunctionArgs) {
  // Get the number of users by createdAt date
  const users = context.db
    .select({
      count: count(),
      createdAt: sql<Date>`DATE(${usersTable.createdAt})`,
    })
    .from(usersTable)
    .groupBy(sql`DATE(${usersTable.createdAt})`)
    .then((users) => users);

  // Get the number of organizations
  const numOrgs = context.db
    .select({ count: count() })
    .from(organizationsTable)
    .then((numOrgs) => numOrgs[0].count);

  // Get the number of pending, processing and completed, failed (group by status) scraper urls
  const scraperUrls = context.db
    .select({
      status: scraperUrlsTable.status,
      count: count(),
    })
    .from(scraperUrlsTable)
    .groupBy(sql`${scraperUrlsTable.status}`)
    .then((scraperUrls) => scraperUrls);

  return defer({
    users,
    numOrgs,
    scraperUrls,
  });
}

export default function AdminDashboard() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const { result: users } = useResolvePromise(data.users);
  const { result: numOrgs } = useResolvePromise(data.numOrgs);
  const { result: scraperUrls } = useResolvePromise(data.scraperUrls);
  const numUsers = users?.reduce((acc, user) => acc + user.count, 0);

  // Generate a list of all dates in the range
  const startDate = new Date(users?.[0].createdAt || '');
  const endDate = new Date(users?.[users?.length - 1].createdAt || '');
  const allDates = eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
    format(date, 'yyyy-MM-dd'),
  );

  // Merge the list of all dates with the user data
  const chartData = allDates.map((date) => {
    const user = users?.find((user) => user.createdAt === date);

    return {
      day: date,
      users: user ? user.count : 0,
    };
  });

  const chartConfig = {
    users: {
      label: 'Users',
      color: theme === Theme.DARK ? '#ffffff24' : '#0000003b',
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-3">
            <Label>Num orgs:</Label>
            {numOrgs}
          </div>

          <div className="flex items-center gap-3">
            <Label>Num users:</Label>
            {numUsers}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scraper URLs</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col">
            {scraperUrls?.map((scraperUrl) => (
              <div key={scraperUrl.status} className="flex items-center gap-3">
                <Label>{scraperUrl.status}:</Label>
                {scraperUrl.count}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account creation per day</CardTitle>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="users" fill="var(--color-users)" radius={2} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
