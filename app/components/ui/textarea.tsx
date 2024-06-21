import { forwardRef, TextareaHTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        `
          flex min-h-[80px] w-full rounded-md border bg-input px-3 py-2 ring-offset-background
          disabled:cursor-not-allowed disabled:opacity-50
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2
          placeholder:text-muted-foreground
        `,
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
