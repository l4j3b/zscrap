import { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

const TableWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('relative w-full overflow-hidden', className)}>
      <div className="absolute inset-0 h-full overflow-auto" {...props} />
    </div>
  ),
);
TableWrapper.displayName = 'TableWrapper';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className={`relative size-full overflow-auto rounded-md border bg-accent/80`}>
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky = false, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      `[&_tr]:outline [&_tr]:outline-1 [&_tr]:outline-border`,
      { 'sticky left-0 right-0 top-0 z-20': sticky },
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        `
          border-t bg-accent/80 font-medium
          [&>tr]:last:border-b-0
        `,
        className,
      )}
      {...props}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        `
          border-0 transition-colors
          dark:hover:bg-border/20
          data-[state=selected]:bg-b
          hover:bg-border/30
        `,
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        `
          h-12 bg-accent px-4 text-left align-middle text-xs font-semibold uppercase
          [&:has([role=checkbox])]:pr-0
        `,
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        `
          border-b border-border/50 p-4 py-3 align-middle
          [&:has([role=checkbox])]:pr-0
        `,
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-foreground', className)} {...props} />
  ),
);
TableCaption.displayName = 'TableCaption';

export {
  TableWrapper,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
