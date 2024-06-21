import { AppLoadContext } from '@remix-run/cloudflare';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

import {
  organizationsTable,
  stripeApiCreditsChargesTable,
  subscriptionsTable,
} from 'drizzle/schema';

import { CONSUMABLES, getPlanByPriceId, ProductId } from './products';
import { initStripe } from './stripe.server';

const getStripeEventOrThrow = async (
  request: Request,
  context: AppLoadContext,
): Promise<Stripe.Event> => {
  const signature = request.headers.get('stripe-signature');
  const payload = await request.text();

  if (!signature || !payload) {
    throw new Response('Invalid Stripe payload/signature', { status: 400 });
  }

  const stripe = initStripe(context.cloudflare.env.STRIPE_SECRET_KEY);

  try {
    return await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      context.cloudflare.env.STRIPE_WEBHOOK_SIGNING_SECRET,
    );
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      throw new Response(err.message, { status: 400 });
    } else {
      throw new Response(JSON.stringify(err), { status: 500 });
    }
  }
};

const handleCheckoutSessionCompleted = async (event: Stripe.Event, context: AppLoadContext) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const organizationId = session.metadata?.organizationId;
  const productId = session.metadata?.productId as ProductId;
  const quantity = session.metadata?.quantity;
  const customerId = session.customer as string;

  if (!userId || !organizationId || !productId || !quantity || !customerId) {
    throw new Error('Invalid metadata in checkout session');
  }

  console.log(
    `Checkout session completed for user ${userId} with product ${productId} and quantity ${quantity}`,
  );

  if (productId === CONSUMABLES.API_CREDITS.id) {
    console.log(`Adding ${quantity} API credits to organization ${organizationId}`);

    await context.db
      .update(organizationsTable)
      .set({
        apiCredits: sql`api_credits + ${quantity}`,
        stripeCustomerId: customerId,
      })
      .where(eq(organizationsTable.id, organizationId));

    await context.db.insert(stripeApiCreditsChargesTable).values({
      quantity: Number(quantity),
      organizationId,
    });
  } else if (typeof session.subscription === 'string') {
    const subscriptionId = session.subscription;

    console.log(
      `Creating subscription for user ${userId} with product ${productId} and subscription ID ${subscriptionId}`,
    );

    await context.db.delete(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));

    await context.db
      .update(organizationsTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(organizationsTable.id, organizationId));

    await context.db.insert(subscriptionsTable).values({
      userId,
      planId: productId,
      stripeSubscriptionId: subscriptionId,
    });
  }
};

const handleSubscriptionEvent = async (event: Stripe.Event, context: AppLoadContext) => {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  const priceId = subscription.items.data[0]?.price.id;
  const productId = getPlanByPriceId(priceId)?.id;

  if (!productId) {
    throw new Error('Product ID not found for the given price ID');
  }

  console.log(
    `Handling subscription event ${event.type} for product ${productId} with subscription ID ${subscriptionId}`,
  );

  const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : undefined;

  switch (event.type) {
    case 'customer.subscription.deleted':
      await context.db
        .delete(subscriptionsTable)
        .where(eq(subscriptionsTable.stripeSubscriptionId, subscriptionId));
      break;
    case 'customer.subscription.created':
      if (!subscription.metadata.userId) {
        throw new Error('User ID not found in subscription metadata');
      }

      await context.db
        .insert(subscriptionsTable)
        .values({
          userId: subscription.metadata.userId,
          planId: productId,
          stripeSubscriptionId: subscriptionId,
          endsAt: cancelAt,
          renewsAt: currentPeriodEnd,
        })
        .onConflictDoUpdate({
          target: subscriptionsTable.stripeSubscriptionId,
          set: {
            planId: productId,
            endsAt: cancelAt,
            renewsAt: currentPeriodEnd,
          },
        });
      break;
    case 'customer.subscription.updated':
      await context.db
        .update(subscriptionsTable)
        .set({
          planId: productId,
          endsAt: cancelAt,
          renewsAt: currentPeriodEnd,
        })
        .where(eq(subscriptionsTable.stripeSubscriptionId, subscriptionId));
      break;
  }
};

export const handleStripeWebhook = async (request: Request, context: AppLoadContext) => {
  const event = await getStripeEventOrThrow(request, context);

  console.log('Received event:', event.id, event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event, context);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event, context);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling event:', event.id, error);
    throw new Response('Webhook handler error', { status: 500 });
  }

  return null;
};
