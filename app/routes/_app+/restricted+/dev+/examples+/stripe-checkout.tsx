import { useTheme } from 'remix-themes';

import { Pre } from '~/components/app/Pre';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import { PRODUCTS, PRODUCT_IDS } from '~/lib/stripe/products';
import { cn } from '~/lib/utils';
import { useStripeCheckout } from '~/routes/_app+/in+/stripe+/pay';

export default function StripeCheckout() {
  const fetcher = useStripeCheckout();
  const [theme] = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe checkout (test mode)</CardTitle>
        <CardDescription>Products are defined in:</CardDescription>
        <div className="w-full">
          <Pre>app/lib/stripe/products.ts</Pre>
        </div>
        <CardDescription>
          Note: Showcasing some of the gradients/different styles here.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {PRODUCT_IDS.map((productId, index) => {
          const product = PRODUCTS[productId];
          const quantity = product.mode === 'subscription' ? 1 : 100;

          return (
            <div
              key={product.name}
              className={cn(
                `
                  flex cursor-pointer items-end justify-between rounded-xl border-2 bg-background
                  p-6 transition-all duration-300
                `,
                {
                  'mb-8': index !== PRODUCT_IDS.length - 1,
                  'brand-gradient-secondary': theme === 'light' && index === 0,
                  'brand-gradient-primary': theme === 'dark' && index === 0,
                },
              )}
              onClick={() => fetcher.submit(productId, quantity)}
              role="button"
              tabIndex={0}
              onKeyDown={() => {}}
            >
              <div className="space-y-4">
                <h2 className="mb-4 text-2xl">{product.name}</h2>

                <div className="w-full">
                  <span>Price: </span>
                  <Pre>${product.price}</Pre>
                </div>

                <div>
                  <span>Mode: </span>
                  <Pre>{product.mode}</Pre>
                </div>
              </div>

              <Button variant={theme === 'light' ? 'default' : 'secondary'} size={'lg'}>
                Checkout
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
