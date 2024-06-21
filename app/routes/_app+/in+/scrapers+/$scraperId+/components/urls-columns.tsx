import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { ScraperUrlStatus } from 'drizzle/schema';
import { LinkTooltip } from '~/components/app/LinkTooltip';
import { StatusDot } from '~/components/app/StatusDot';
import { DataTableColumnHeader } from '~/components/data-table/DataTableColumnHeader';
import { Checkbox } from '~/components/ui/checkbox';

export interface ScraperUrl {
  id: string;
  url: string;
  title: string | null;
  status: string;
  to: string;
}

const columnHelper = createColumnHelper<ScraperUrl>();

export const columns: ColumnDef<ScraperUrl, string>[] = [
  {
    id: 'select_checkbox',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  columnHelper.accessor((row) => row.url, {
    id: 'url',
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} title="URL" />,
    meta: {
      className: 'max-w-64 truncate',
    },
    cell: (info) => {
      const url = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{url}</LinkTooltip>;
    },
  }),
  columnHelper.accessor((row) => row.title, {
    id: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="TITLE" />,
    meta: {
      className: 'max-w-64 truncate',
    },
    cell: (info) => {
      const title = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{title}</LinkTooltip>;
    },
  }),
  columnHelper.accessor((row) => row.status, {
    id: 'status',
    header: () => <div className="w-24 text-center px-0">STATUS</div>,
    meta: {
      className: 'w-24 text-center px-0',
    },
    cell: (info) => {
      const status = info.getValue() as ScraperUrlStatus;

      return <StatusDot status={status} />;
    },
  }),
];
