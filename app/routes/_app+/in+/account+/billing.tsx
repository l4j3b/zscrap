import { defer, LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { Await, useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { Suspense } from 'react';

import { stripeApiCreditsChargesTable } from 'drizzle/schema';
import { DateTooltip } from '~/components/app/DateTooltip';
import { Loader } from '~/components/app/Loader';
import { Card, CardContent, CardDescription, CardHeader } from '~/components/ui/card';
import { SectionHeader, SectionTitle, SectionContent, Section } from '~/components/ui/section';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { config } from '~/config';

// import { listOrganizationCharges } from '~/lib/stripe/stripe.server';

// const STRIPE_CUSTOMER_PORTAL_URL = !import.meta.env.DEV
//   ? 'https://billing.stripe.com/p/login/aEU01ggg796Zd32dQQ'
//   : 'https://billing.stripe.com/p/login/test_fZeaH9edl9Kp28U288';

export const meta: MetaFunction = () => {
  return [{ title: `Billing - ${config.app.name}` }];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { activeOrganizationId } = context.getSession();
  // const charges = listOrganizationCharges(context, activeOrganizationId);

  const charges = await context.db.query.stripeApiCreditsChargesTable.findMany({
    where: eq(stripeApiCreditsChargesTable.organizationId, activeOrganizationId),
  });

  return defer({ charges });
};

export default function BillingRoute() {
  const { charges } = useLoaderData<typeof loader>();

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Billing</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <Card className="flex h-full flex-1 flex-col">
          <CardHeader>
            <CardDescription>Charges for your organization will be displayed here.</CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense fallback={<Loader loading relative />}>
              <Await resolve={charges}>
                {(charges) => (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {charges.map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell>{charge.id}</TableCell>
                          <TableCell>API Credit</TableCell>
                          <TableCell>{charge.quantity}</TableCell>
                          <TableCell>
                            <DateTooltip date={charge.createdAt} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Await>
            </Suspense>
          </CardContent>
        </Card>
      </SectionContent>
    </Section>
  );
}
