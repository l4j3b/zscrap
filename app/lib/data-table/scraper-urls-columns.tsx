import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { ScraperUrlStatus } from 'drizzle/schema';
import { LinkTooltip } from '~/components/app/LinkTooltip';
import { StatusDot } from '~/components/app/StatusDot';
import { DataTableColumnHeader } from '~/components/data-table/DataTableColumnHeader';
import { Checkbox } from '~/components/ui/checkbox';

import { formatDate } from '../utils';

interface ScraperUrl {
  id: string;
  url: string;
  title: string | null;
  status: string;
  to: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<ScraperUrl>();

export const scraperUrlsColumns: ColumnDef<ScraperUrl, string>[] = [
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="URL" className="items-start" />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TITLE" className="items-start" />
    ),
    meta: {
      className: 'max-w-64 truncate',
    },
    cell: (info) => {
      const title = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{title || '...'}</LinkTooltip>;
    },
  }),
  columnHelper.accessor((row) => row.updatedAt, {
    id: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="LAST UPDATED" />,
    meta: {
      className: 'w-48 text-center',
    },
    cell: (info) => {
      const value = info.getValue();
      const { to } = info.row.original;

      return (
        <LinkTooltip to={to} className="text-center">
          {formatDate(value)}
        </LinkTooltip>
      );
    },
  }),
  columnHelper.accessor((row) => row.status, {
    id: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="STATUS" />,
    meta: {
      className: 'w-24 text-center px-0',
    },
    cell: (info) => {
      const status = info.getValue() as ScraperUrlStatus;

      return <StatusDot status={status} />;
    },
  }),
];
