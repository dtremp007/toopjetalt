import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Select from "@/components/dynamic-inputs/select";
import Number from "@/components/dynamic-inputs/number";
import { RowInput } from "@/lib/spreadsheet/row";
import { AutoForm } from "@/components/ui/autoform/AutoForm";
import { DynamicInput } from "./dynamic-inputs/types";
import { ZodProvider } from "@autoform/zod";
import { SelectWithOptions } from "./ui/select-with-options";
import { Label } from "./ui/label";

export const INPUT_COMPONENTS: Record<string, DynamicInput> = {
  select: Select,
  number: Number,
};

interface ConfigureInputProps {
  onSave: (input: RowInput) => void;
  trigger?: React.ReactNode;
  name: string;
}

export function ConfigureInput({ onSave, trigger, name }: ConfigureInputProps) {
  const [inputType, setInputType] = React.useState<"select" | "number">(
    "number"
  );

  const schemaProvider = React.useMemo(
    () => new ZodProvider(INPUT_COMPONENTS[inputType].schema),
    [inputType]
  );

  const handleSave = (data: any) => {
    onSave({
      type: inputType,
      props: data,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline">Configure Input</Button>}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configure Input</SheetTitle>
          <SheetDescription>
            Choose the type of input and configure its properties.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <SelectWithOptions
              options={Object.keys(INPUT_COMPONENTS)}
              value={inputType}
              onChange={(value) => setInputType(value as any)}
            />
          </div>
          <AutoForm
            schema={schemaProvider}
            withSubmit
            onSubmit={handleSave}
            defaultValues={{ label: name }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
