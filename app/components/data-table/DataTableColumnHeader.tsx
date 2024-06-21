import { CaretUpIcon, CaretSortIcon, CaretDownIcon } from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex flex-col items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            className={`
              text-muted-foreground
              focus:outline-none
            `}
            innerClassName="p-0"
          >
            <span>{title}</span>

            {column.getIsSorted() === 'desc' ? (
              <CaretDownIcon className="ml-2 size-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <CaretUpIcon className="ml-2 size-4" />
            ) : (
              <CaretSortIcon className="ml-2 size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <CaretUpIcon className="mr-3 h-3.5 w-3.5 text-muted-foreground/70" />
            asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <CaretDownIcon className="mr-3 h-3.5 w-3.5 text-muted-foreground/70" />
            desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
