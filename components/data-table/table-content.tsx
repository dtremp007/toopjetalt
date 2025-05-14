"use client";
import { flexRender } from "@tanstack/react-table";
import { useTableComposer } from "./composer";

export function TableContent() {
  const { table } = useTableComposer();

  return (
    // <div className="bg-card text-card-foreground rounded-xl @4xl:rounded-t-none @4xl:border-t-0 border shadow-sm">
    <div>
      <div className="flex flex-col">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="group relative flex flex-col items-start justify-start gap-4 p-4 not-first:border-t @4xl:flex-row @4xl:items-center"
              // className="group grid grid-cols-1 gap-4 p-4 not-first:border-t @4xl:grid-cols-[repeat(auto-fit,minmax(100px,1fr))]"
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="flex-1 [&:has(.flex-none)]:flex-none w-full @4xl:w-auto">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div>
            <div className="h-24 text-center mt-4">Nothing yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}
