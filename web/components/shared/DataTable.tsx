"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  tagsTableThTdClass,
  tagsTableWrapClass,
} from "@/lib/styles/tagsPage";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  tableClassName: string;
  wrapClassName?: string;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
};

export default function DataTable<T>({
  data,
  columns,
  tableClassName,
  wrapClassName,
  getRowId,
  emptyMessage,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  if (data.length === 0 && emptyMessage) {
    return <p className="m-0 text-[0.9rem] text-daf-muted">{emptyMessage}</p>;
  }

  return (
    <div className={wrapClassName ?? tagsTableWrapClass}>
      <table className={tableClassName}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={
                    header.column.columnDef.meta?.headerClassName ??
                    tagsTableThTdClass
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={
                    cell.column.columnDef.meta?.cellClassName ??
                    tagsTableThTdClass
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
