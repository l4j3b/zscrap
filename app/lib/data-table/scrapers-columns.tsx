import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { LinkTooltip } from '~/components/app/LinkTooltip';
import { DataTableColumnHeader } from '~/components/data-table/DataTableColumnHeader';

import { formatDate } from '../utils';

interface RowData {
  id: string;
  name: string;
  urlCount: number;
  createdBy: string | null;
  createdAt: string;
  to: string;
}

const columnHelper = createColumnHelper<RowData>();

export const scrapersColumns: ColumnDef<RowData, string>[] = [
  columnHelper.accessor((row) => row.name, {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NAME" className="items-start" />
    ),
    meta: {
      className: 'max-w-64 truncate',
    },
    cell: (info) => {
      const value = info.getValue();
      const { to } = info.row.original;

      return <LinkTooltip to={to}>{value}</LinkTooltip>;
    },
  }),
  columnHelper.accessor((row) => row.urlCount.toString(), {
    id: 'urlcount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="# URLs" />,
    meta: {
      className: 'w-24 text-center',
    },
    cell: (info) => {
      const value = info.getValue();
      const { to } = info.row.original;

      return (
        <LinkTooltip to={to} className="text-center">
          {value}
        </LinkTooltip>
      );
    },
  }),
  columnHelper.accessor((row) => row.createdBy, {
    id: 'createdBy',
    header: ({ column }) => <DataTableColumnHeader column={column} title="CREATED BY" />,
    meta: {
      className: 'w-40 text-center',
    },
    cell: (info) => {
      const value = info.getValue();
      const { to } = info.row.original;

      return (
        <LinkTooltip to={to} className="text-center">
          {value}
        </LinkTooltip>
      );
    },
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="CREATED AT" />,
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
];
