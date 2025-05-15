import { ColumnDef } from "@tanstack/react-table";
import { Row, Value } from "@/lib/spreadsheet/row";
import { CodeEditor } from "@/components/code-editor";
import { Badge } from "@/components/ui/badge";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { ConfigureInput, INPUT_COMPONENTS } from "@/components/configure-input";
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
      return (
        <div className="flex-none w-20">
          <input
            type="text"
            className="w-full px-2 py-1"
            defaultValue={row.original.name}
            onBlur={(e) => {
              row.original.rename(e.target.value);
            }}
          />
        </div>
      );
    },
  },
  {
    header: "Expression",
    accessorKey: "expression",
    cell: ({ row, table }) => {
      const [value, setValue] = useState(row.original.getExpression());

      useEffect(() => {
        const handleChangedExpression = () => {
          setValue(row.original.getExpression());
        };
        row.original.addEventListener(
          "changedExpression",
          handleChangedExpression
        );
        return () => {
          row.original.removeEventListener(
            "changedExpression",
            handleChangedExpression
          );
        };
      }, [row.original]);

      if (row.original.getInput()) return null;

      return (
        <CodeEditor
          key={row.original.name}
          value={value}
          onChange={(value) => {
            setValue(value);
            row.original.updateExpression(value);
          }}
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
        row.original.setValue(value as Value);
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

      if (["function", "object", "date"].includes(valueType)) {
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
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              row.original.remove();
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      );
    },
  },
];
