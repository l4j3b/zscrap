import { HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(`inline-block animate-pulse rounded-md border bg-background`, className)}
      {...props}
    />
  );
}

export { Skeleton };
