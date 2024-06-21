import * as React from 'react';
import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

import { cn } from '~/lib/utils';

import { Skeleton } from './skeleton';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    loading?: boolean;
  }
>(({ className, type, loading, disabled, ...props }, ref) => {
  return (
    <div className={twMerge('relative')}>
      <div
        className="absolute inset-0 size-full transition-opacity duration-300"
        style={{
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? 'auto' : 'none',
        }}
      >
        <Skeleton className="size-full" />
      </div>

      <input
        ref={ref}
        type={type}
        className={cn(
          `
            flex h-11 w-full rounded-lg border bg-input px-3 py-2 text-foreground
            ring-offset-background transition-opacity duration-300
            disabled:cursor-not-allowed disabled:opacity-60
            file:border-0 file:bg-transparent file:font-medium
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2
            placeholder:text-muted-foreground
          `,
          className,
        )}
        style={{
          // TODO: TBD best
          opacity: loading ? 0 : disabled ? 0.6 : 1,
          // opacity: loading ? 1 : disabled ? 0.5 : 1,
        }}
        disabled={loading || disabled}
        {...props}
      />
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
