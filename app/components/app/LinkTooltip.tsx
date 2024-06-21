import { Link } from '@remix-run/react';

import { cn } from '~/lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const LinkTooltip = ({
  children,
  className,
  to,
}: {
  children: React.ReactNode;
  className?: string;
  to: string;
}) => {
  return (
    <Link prefetch="intent" className="block h-full w-full truncate" to={to}>
      <Tooltip>
        <TooltipTrigger className={cn('w-full truncate text-left', className)}>
          {children}
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </Link>
  );
};
