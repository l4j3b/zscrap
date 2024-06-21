import { defer, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';

import { subscriptionsTable } from 'drizzle/schema';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { SectionHeader, SectionTitle, SectionContent, Section } from '~/components/ui/section';
import { config } from '~/config';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';
import { getPlanByProductId } from '~/lib/stripe/products';

const STRIPE_CUSTOMER_PORTAL_URL = !import.meta.env.DEV
  ? 'https://billing.stripe.com/p/login/aEU01ggg796Zd32dQQ'
  : 'https://billing.stripe.com/p/login/test_fZeaH9edl9Kp28U288';

export const meta: MetaFunction = () => {
  return [{ title: `Billing - ${config.app.name}` }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { sessionUserId } = context.getSession();

  const subscription = context.db.query.subscriptionsTable
    .findFirst({
      where: eq(subscriptionsTable.userId, sessionUserId),
    })
    .then((subscription) => subscription || null);

  return defer({ subscription });
}

export default function BillingRoute() {
  const data = useLoaderData<typeof loader>();
  const { result: subscription } = useResolvePromise(data.subscription);

  const product = subscription?.planId ? getPlanByProductId(subscription?.planId) : undefined;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Billing</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <Card className="flex h-full flex-1 flex-col">
          <CardContent>
            {!subscription ? (
              <div>
                <h3>{"You don't have an active subscription."}</h3>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <strong>Product:</strong> {product?.name}
                  </div>

                  <div>
                    <strong>Price:</strong> ${product?.price}
                  </div>

                  {subscription.endsAt && (
                    <div>
                      <strong>Ends at:</strong> {subscription.endsAt}
                    </div>
                  )}
                </div>

                <div>
                  <a href={STRIPE_CUSTOMER_PORTAL_URL} target="_blank" rel="noreferrer">
                    <Button>Manage subscription</Button>
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </SectionContent>
    </Section>
  );
}
