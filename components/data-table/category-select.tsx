"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableComposer } from "./composer";

const options = [
  {
    label: "Church Service",
    value: "church-service",
  },
  {
    label: "Auction",
    value: "auction",
  },
  {
    label: "Event",
    value: "event",
  },
];

export function CategorySelect() {
  const { table } = useTableComposer();

  return (
    <div>
      <Select
        onValueChange={(value) => table.getColumn("category")?.setFilterValue(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
