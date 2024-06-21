import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Table as TableT,
} from '@tanstack/react-table';
import { get, merge } from 'lodash-es';
import { Search } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '~/components/ui/table';

import { Loader } from '../app/Loader';

import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[] | null;
  rowCount?: number;
  loading?: boolean;
  toolbar?: (_table: TableT<TData>) => ReactNode;
  rightContent?: ReactNode;
  onViewOptionChange?: (_options: {
    globalFilter: string | undefined;
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
  }) => void;
  initialState?: {
    globalFilter?: string | undefined;
    pagination?: {
      pageIndex: number;
      pageSize: number;
    };
    sorting?: {
      sortAttribute: string;
      sortOrder: 'asc' | 'desc';
    };
  };
}

export const DEFAULT_PAGE_SIZE = 30;

const DEFAULT_INITIAL_STATE = {
  globalFilter: '',
  pagination: {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  sorting: {
    sortAttribute: 'createdAt',
    sortOrder: 'desc' as const,
  },
};

export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
  loading,
  toolbar,
  rightContent,
  onViewOptionChange,
  initialState: initialStateProps,
}: DataTableProps<TData, TValue>) {
  const hasServerSidePagination = typeof rowCount !== 'undefined';

  const initialState = merge(
    DEFAULT_INITIAL_STATE,
    initialStateProps,
  ) as typeof DEFAULT_INITIAL_STATE;

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string | undefined>('');
  const [rowSelection, setRowSelection] = useState({});

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialState.sorting.sortAttribute, desc: initialState.sorting.sortOrder === 'desc' },
  ]);

  const [pagination, setPagination] = useState(initialState.pagination);

  const table = useReactTable({
    data: data ?? [],
    rowCount,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: hasServerSidePagination,
    manualSorting: hasServerSidePagination,
    manualFiltering: hasServerSidePagination,
    getPaginationRowModel: hasServerSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: hasServerSidePagination ? undefined : getSortedRowModel(),
    getFilteredRowModel: hasServerSidePagination ? undefined : getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
      globalFilter,
    },
  });

  useEffect(() => {
    if (onViewOptionChange) {
      onViewOptionChange({
        pagination,
        globalFilter,
        sorting,
        columnFilters,
      });
    }
  }, [sorting, pagination, columnFilters, globalFilter]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center justify-between pb-3">
        {toolbar ? toolbar(table) : null}

        <div className="relative flex items-center">
          <Search className="absolute left-4 z-10 size-4 text-muted-foreground/50" />
          <Input
            placeholder="Search..."
            defaultValue={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm pl-11"
          />
        </div>

        {rightContent}
      </div>

      <TableWrapper className="relative flex flex-1">
        {loading && <Loader loading={!!loading} relative />}

        <Table>
          <TableHeader sticky>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={get(header.column.columnDef.meta, 'className', '')}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={get(cell.column.columnDef.meta, 'className', '')}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : loading ? null : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableWrapper>

      <div className="mt-3">
        <DataTablePagination table={table} rowCount={rowCount} />
      </div>
    </div>
  );
}
