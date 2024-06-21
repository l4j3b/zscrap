import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { formatDate } from '~/lib/utils';

export function DateTooltip({
  date,
  className,
  label,
}: {
  date?: Date | string;
  className?: string;
  label?: string;
}) {
  // if (!date) {
  //   return <Skeleton className={'h-7 w-20'} />;
  // }

  if (!date) {
    return 'Created at';
  }

  return (
    <Tooltip>
      <TooltipTrigger className={className}>{formatDate(date)}</TooltipTrigger>
      <TooltipContent>
        {label && `${label} `}
        {formatDate(date, true)}
      </TooltipContent>
    </Tooltip>
  );
}
