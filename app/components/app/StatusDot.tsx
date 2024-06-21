import { ScraperUrlStatus } from 'drizzle/schema';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';

const statusColors = {
  [ScraperUrlStatus.Pending]: {
    // bg: 'bg-gray-500',
    // shadow: '',
    bg: 'bg-amber-950',
    shadow: 'shadow-yellow-950/50',
  },
  [ScraperUrlStatus.Processing]: {
    // bg: 'bg-cyan-500',
    // shadow: 'shadow-cyan-300/50',
    bg: 'bg-amber-400',
    shadow: 'shadow-amber-400/50',
  },
  [ScraperUrlStatus.Completed]: {
    bg: 'bg-green-500',
    shadow: 'shadow-green-500/50',
  },
  [ScraperUrlStatus.Failed]: {
    bg: 'bg-red-500',
    shadow: 'shadow-red-500/50',
  },
};

export function StatusDot({
  className,
  status = ScraperUrlStatus.Pending,
}: {
  className?: string;
  status?: ScraperUrlStatus;
}) {
  status = status ?? ScraperUrlStatus.Pending;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            `
              m-auto block size-2.5 rounded-full border transition-all duration-[2s]
              ${statusColors[status].bg}
              shadow-[0_0_8px_0_rgba(0,0,0,0.1)]
              ${statusColors[status].shadow}
            `,
            {
              'animate-pulse': status === ScraperUrlStatus.Processing,
            },
            className,
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        <span className="capitalize">Status: {status}</span>
      </TooltipContent>
    </Tooltip>
  );
}
