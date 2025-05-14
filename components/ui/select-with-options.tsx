import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

type SelectWithOptionsProps = React.ComponentProps<typeof Select> & {
  options?: string[];
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
};

export function SelectWithOptions(props: SelectWithOptionsProps) {
  const { options = [], onChange, className, placeholder, ...rest } = props;

  return (
    <Select {...rest} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
