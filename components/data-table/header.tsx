"use client";
import { flexRender } from "@tanstack/react-table";
import { useTableComposer } from "./composer";

export function TableHeader() {
  const { table } = useTableComposer();

  return (
    <div className="sticky top-16 z-[2] bg-background -mx-px -mt-px">
      {table.getHeaderGroups().map((headerGroup) => (
        <div
          key={headerGroup.id}
          className="group bg-accent border border-b hidden @4xl:flex items-start justify-start gap-4 rounded-t-xl px-4 py-2 @4xl:flex-row @4xl:items-center"
        >
          {headerGroup.headers.map((header) => (
            <div key={header.id} className="flex-1 [&:has(.flex-none)]:flex-none">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
