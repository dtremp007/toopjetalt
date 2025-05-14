"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useEffect } from "react";

interface TableComposerContextValue<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
}

const TableComposerContext = React.createContext<TableComposerContextValue<any> | null>(
  null,
);

interface TableComposerProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultSorting?: SortingState;
  defaultColumnVisibility?: VisibilityState;
  children: React.ReactNode;
  meta?: Record<string, any>;
}

export function TableComposer<TData extends { id?: unknown }, TValue>({
  columns,
  data,
  defaultSorting = [],
  defaultColumnVisibility = {},
  children,
  meta,
}: TableComposerProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    ...defaultColumnVisibility,
    select: false,
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [filters, setFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: filters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: () => undefined,
    getRowId: (row, index) => row?.id?.toString() ?? index.toString(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta,
  });

  return (
    <TableComposerContext.Provider value={{ table }}>
      {children}
    </TableComposerContext.Provider>
  );
}

export function useTableComposer<TData>() {
  const context = React.useContext(TableComposerContext);
  if (!context) {
    throw new Error("useTableComposer must be used within a TableComposer");
  }
  return context as TableComposerContextValue<TData>;
}
