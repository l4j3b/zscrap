import { AppLoadContext } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { $path } from 'remix-routes';
import Stripe from 'stripe';

import { organizationsTable } from 'drizzle/schema';

import { ProductId, PRODUCTS } from './products';

export function initStripe(stripeSecretKey: string) {
  return new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
  });
}

export const createCheckoutSession = async (
  request: Request,
  context: AppLoadContext,
  productId: ProductId,
  quantity = 1,
  adjustableQuantity = false,
) => {
  const { protocol, host } = new URL(request.url);
  const product = PRODUCTS[productId];
  const { sessionUserId, email, activeOrganizationId } = context.getSession();

  const stripe = initStripe(context.cloudflare.env.STRIPE_SECRET_KEY);

  // Creates a new Checkout Session for the order
  const session = await stripe.checkout.sessions.create({
    success_url: `${protocol}//${host}${$path('/in/stripe/success')}`,
    cancel_url: `${protocol}//${host}${$path('/in')}`,
    customer_email: email,
    mode: product.mode,
    client_reference_id: activeOrganizationId,
    metadata: {
      ...product,
      userId: sessionUserId,
      organizationId: activeOrganizationId,
      productId,
      quantity: quantity.toString(),
    },
    line_items: [
      {
        price: product.priceId,
        quantity,
        adjustable_quantity: adjustableQuantity
          ? {
              enabled: true,
              minimum: 200,
              maximum: 10000,
            }
          : undefined,
      },
    ],
  });

  // The url to redirect the user to for him to pay (Stripe checkout page)
  return session.url;
};

export const listOrganizationCharges = async (context: AppLoadContext, organizationId: string) => {
  const organization = await context.db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.id, organizationId),
  });

  if (!organization?.stripeCustomerId) {
    return null;
  }

  const stripe = initStripe(context.cloudflare.env.STRIPE_SECRET_KEY);

  const charges = await stripe.charges.list({
    customer: organization.stripeCustomerId,
  });

  return charges;
};
