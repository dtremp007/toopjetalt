"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as React from "react";
import { Button } from "../ui/button";
import { useTableComposer } from "./composer";

export function Toolbar({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)} {...props}>
      {children}
    </div>
  );
}

interface SearchProps extends React.ComponentProps<"input"> {
  column?: string;
}

export function TableSearch({
  column = "title",
  placeholder = "Search...",
  ...props
}: SearchProps) {
  const { table } = useTableComposer();

  return (
    <Input
      placeholder={placeholder}
      value={(table.getColumn(column)?.getFilterValue() as string) ?? ""}
      onChange={(event) => table.getColumn(column)?.setFilterValue(event.target.value)}
      {...props}
    />
  );
}

export function ResetFilterButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { table } = useTableComposer();
  const isFiltered = table.getState().columnFilters.length > 0;

  if (!isFiltered) return null;

  return (
    <Button
      variant="ghost"
      onClick={() => table.resetColumnFilters()}
      className={cn("h-8 px-2 lg:px-3", className)}
      {...props}
    >
      Reset
      <Cross2Icon className="ml-2 h-4 w-4" />
    </Button>
  );
}
