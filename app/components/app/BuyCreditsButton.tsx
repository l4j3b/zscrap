import { Plus } from 'lucide-react';

import { CONSUMABLES } from '~/lib/stripe/products';
import { cn } from '~/lib/utils';
import { useStripeCheckout } from '~/routes/_app+/in+/stripe+/pay';

import { Button } from '../ui/button';

import { Pre } from './Pre';

interface BuyCreditsButtonProps {
  className?: string;
  numCredits?: number;
}

export function BuyCreditsButton({ className, numCredits }: BuyCreditsButtonProps) {
  const fetcher = useStripeCheckout();
  const productId = CONSUMABLES.API_CREDITS.id;
  const quantity = 200;
  const loading = numCredits === undefined || numCredits === null;

  return (
    <Button
      loading={loading}
      size="sm"
      variant={typeof numCredits === 'number' && numCredits < 10 ? 'destructive' : 'outline'}
      className={cn(
        `
          bg-muted
          hover:!text-accent-foreground
        `,
        className,
      )}
      innerClassName="pl-[2px]"
      onClick={() => fetcher.submit(productId, quantity, true)}
      style={{
        opacity: loading ? 0 : 1,
      }}
    >
      <Pre className={`min-h-0 bg-background p-[6px] px-2 text-foreground transition-all`} nocopy>
        {(numCredits || 0)
          .toString()
          .padStart(6, '0')
          .split('')
          .map((char, index, arr) => (
            <span
              key={index}
              className={
                char === '0' && index < arr.length - (numCredits || 0).toString().length
                  ? `text-border`
                  : ''
              }
            >
              {char}
            </span>
          ))}{' '}
        credits
      </Pre>
      <Plus className="ml-2 size-5" />
    </Button>
  );
}
