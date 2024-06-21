import type { ActionFunctionArgs } from '@remix-run/cloudflare';

import { handleStripeWebhook } from '~/lib/stripe/webhook.server';

export const action = ({ request, context }: ActionFunctionArgs) => {
  return handleStripeWebhook(request, context);
};
