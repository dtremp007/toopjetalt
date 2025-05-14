import { ColumnDef } from "@tanstack/react-table";
import { Row } from "@/lib/spreadsheet/row";
import { CodeEditor } from "@/components/code-editor";
import { Spreadsheet } from "@/lib/spreadsheet";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Counter } from "@/components/ui/counter";
import { ConfigureInput, INPUT_COMPONENTS } from "@/components/configure-input";
import { SelectWithOptions } from "@/components/ui/select-with-options";
import { getInputOnChange } from "@/lib/form/get-input-on-change";

const DEFAULT_TAGS = [
  { value: "tag1", label: "Tag 1" },
  { value: "tag2", label: "Tag 2" },
  { value: "tag3", label: "Tag 3" },
];

export const columns: ColumnDef<Row>[] = [
  {
    id: "name",
    header: () => <div className="flex-none w-20">Name</div>,
    accessorKey: "name",
    cell: ({ row }) => {
      return <div className="flex-none w-20">{row.original.name}</div>;
    },
  },
  {
    header: "Expression",
    accessorKey: "expression",
    cell: ({ row, table }) => {
      if (row.original.getInput()) return null;

      return (
        <CodeEditor
          defaultValue={row.original.getExpression()}
          onFocusLeave={(value) => {
            row.original.updateExpression(value);
          }}
          height="auto"
        />
      );
    },
  },
  {
    header: "Input",
    cell: ({ row, table }) => {
      const input = row.original.getInput();

      const handleOnChange = getInputOnChange((value) => {
        (
          table.options.meta as { spreadsheet: Spreadsheet }
        )?.spreadsheet?.updateInputValue(row.original.id, value);
      });

      if (!input) {
        return (
          <ConfigureInput
            onSave={(input) => {
              row.original.setInput(input);
            }}
            name={row.original.name}
            trigger={
              <Button variant="ghost" className="text-muted-foreground">
                <PlusIcon />
                Add Input
              </Button>
            }
          />
        );
      }

      const Component = INPUT_COMPONENTS[input.type].Component;
      return (
        <Component
          // When a user loads new data and the value has changed, rerender
          key={input.props.defaultValue}
          {...input.props}
          onChange={handleOnChange}
          name={row.original.name}
        />
      );
    },
  },
  {
    header: () => <div className="flex-none w-12">Value</div>,
    accessorKey: "value",
    cell: ({ row }) => {
      const value = row.original.getValue();
      const valueType = row.original.getValueType();

      if (valueType === "function" || valueType === "object") {
        return <div className="flex-none w-12 text-center">...</div>;
      }

      return <div className="flex-none w-12 text-end">{value?.toString()}</div>;
    },
  },
  {
    id: "type",
    header: () => <div className="flex-none w-20">Type</div>,
    accessorFn: (row) => row.getValueType(),
    cell: ({ row }) => {
      const type = row.original.getValueType();
      const variant =
        type === "error"
          ? "destructive"
          : type === "function"
            ? "default"
            : "outline";

      return (
        <div className="flex-none w-20">
          <Badge variant={variant}>{type}</Badge>
        </div>
      );
    },
  },
  {
    header: "Dependencies",
    accessorKey: "dependencies",
    cell: ({ row }) => {
      return <div>{row.original.getDependencies().join(", ")}</div>;
    },
  },
  {
    header: "Message",
    accessorFn: (row) => row.getError()?.message,
    cell: ({ row }) => {
      return <div>{row.original.getError()?.message}</div>;
    },
  },
  {
    id: "tags",
    header: () => <div className="flex-none w-[400px]">Tags</div>,
    accessorFn: (row) => row.getTags(),
    cell: ({ row }) => {
      const tags = row.original.getTags();
      const [value, setValue] = useState<Option[]>(
        tags.map((tag) => ({
          value: tag,
          label: tag,
        }))
      );

      return (
        <div>
          <MultipleSelector
            defaultOptions={DEFAULT_TAGS}
            value={value}
            onChange={(options) => {
              setValue(options);
              row.original.setTags(options.map((option) => option.value));
            }}
            className="w-[400px]"
            placeholder="Select tags..."
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                no results found.
              </p>
            }
          />
        </div>
      );
    },
  },
];
