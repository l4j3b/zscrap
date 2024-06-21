import { ActionFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { getSearchParams } from 'remix-params-helper';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { PRODUCT_IDS, ProductId } from '~/lib/stripe/products';
import { createCheckoutSession } from '~/lib/stripe/stripe.server';

const SearchParamsSchema = z.object({
  productId: z.enum(PRODUCT_IDS),
  quantity: z.number().int(),
  adjustableQuantity: z.boolean().optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const result = getSearchParams(request, SearchParamsSchema);

  if (!result.success) {
    return json(result.errors, { status: 400 });
  }

  const { productId, quantity, adjustableQuantity } = result.data;

  if (!productId) {
    return json({ error: 'Product Key is required' }, { status: 400 });
  }

  const url = await createCheckoutSession(
    request,
    context,
    productId,
    quantity,
    adjustableQuantity,
  );

  if (!url) {
    return json({ error: 'Something went wrong' }, { status: 500 });
  }

  return redirect(url);
};

/**
 * Used to redirect the user to the Stripe checkout page
 * @returns A custom fetcher with extended submit functions
 */
export const useStripeCheckout = () => {
  const fetcher = useFetcher<typeof action>();

  return {
    ...fetcher,
    // overwrites the default submit so you don't have to specify the action or method
    submit: (productId: ProductId, quantity: number, adjustableQuantity?: boolean) =>
      fetcher.submit(null, {
        method: 'POST',
        action: $path('/in/stripe/pay', {
          productId,
          quantity,
          adjustableQuantity,
        }),
      }),
  };
};
