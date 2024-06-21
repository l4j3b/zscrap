import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { ScraperUrlStatus } from 'drizzle/schema';
import { LinkTooltip } from '~/components/app/LinkTooltip';
import { StatusDot } from '~/components/app/StatusDot';
import { DataTableColumnHeader } from '~/components/data-table/DataTableColumnHeader';

import { formatDate } from '../utils';

interface RowData {
  to: string;
  id: string;
  updatedAt: string;
  url: string;
  title: string | null;
  status: string;
  scraper: {
    id: string;
    name: string;
  };
}

const columnHelper = createColumnHelper<RowData>();

export const dashboardColumns: ColumnDef<RowData, string>[] = [
  columnHelper.accessor((row) => row.scraper.name, {
    id: 'scraperName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SCRAPER" className="items-start" />
    ),
    meta: {
      className: 'max-w-40 truncate',
    },
    cell: (info) => {
      const value = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{value}</LinkTooltip>;
    },
  }),
  columnHelper.accessor((row) => row.url, {
    id: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="URL" className="items-start" />
    ),
    meta: {
      className: 'max-w-48 truncate',
    },
    cell: (info) => {
      const value = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{value}</LinkTooltip>;
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
      const value = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{value || '...'}</LinkTooltip>;
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
      className: 'w-24 text-center',
    },
    cell: (info) => {
      const status = info.getValue() as ScraperUrlStatus;

      return <StatusDot status={status} />;
    },
  }),
];
