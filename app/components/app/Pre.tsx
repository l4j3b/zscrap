import { Copy } from 'lucide-react';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const Pre = ({
  children,
  className,
  title,
  loading = false,
  nocopy = false,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  loading?: boolean;
  nocopy?: boolean;
}) => {
  loading = loading && !children;

  return (
    <div
      className={`
        relative flex flex-1 flex-col overflow-hidden rounded-md border bg-accent font-mono text-sm
        text-foreground
      `}
    >
      {title && (
        <div
          className={`
            w-full border-b px-4 py-3 font-sans text-sm font-semibold uppercase
            text-muted-foreground
          `}
        >
          {title}
        </div>
      )}

      <pre
        className={twMerge(
          `
            h-full w-full overflow-auto whitespace-pre-wrap break-all p-4 py-4 opacity-0
            transition-opacity
          `,
          className,
        )}
        style={{
          opacity: loading ? 0 : 1,
          overflowWrap: 'break-word',
          wordBreak: 'break-all',
        }}
      >
        {children || 'no data'}
      </pre>

      {!nocopy && (
        <Tooltip>
          <TooltipTrigger
            asChild
            className="transition-all"
            style={{
              opacity: loading ? 0 : 1,
            }}
          >
            <span className={`absolute -right-1 -top-0 opacity-50`}>
              <Button
                variant="link"
                onClick={() => navigator.clipboard.writeText(children as string)}
              >
                <Copy className="size-4" />
              </Button>
            </span>
          </TooltipTrigger>

          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      )}

      <div
        className="absolute inset-0 size-full transition-opacity"
        style={{
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? 'auto' : 'none',
        }}
      >
        <Skeleton className="size-full" />
      </div>
    </div>
  );
};

Pre.displayName = 'Pre';

export { Pre };
