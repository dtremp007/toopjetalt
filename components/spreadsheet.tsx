import React from "react";
import { SerializedSpreadsheet, Spreadsheet } from "@/lib/spreadsheet";
import { Row } from "@/lib/spreadsheet/row";
import { CodeEditor } from "./code-editor";
import { Table, TableComposer, TableContent, TableHeader } from "./data-table";
import { columns } from "./spreadsheet-columns";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSpreadsheet } from "@/lib/queries/spreadsheet";

export function SpreadsheetTable({
  data,
  spreadsheetId,
}: {
  data: SerializedSpreadsheet;
  spreadsheetId: string;
}) {
  const [spreadsheet, setSpreadsheet] = React.useState<Spreadsheet>(
    data ? Spreadsheet.deserialize(data) : new Spreadsheet()
  );
  const [rows, setRows] = React.useState<Row[]>(spreadsheet.getRows());
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data: SerializedSpreadsheet) =>
      saveSpreadsheet({
        data: {
          spreadsheetId,
          rows: data.rows,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["spreadsheet", spreadsheetId],
      });
    },
  });

  React.useEffect(() => {
    const handleEvaluate = () => {
      setRows(spreadsheet?.getRows() ?? []);
    };

    spreadsheet?.addEventListener("evaluate", handleEvaluate);
    return () => {
      spreadsheet?.removeEventListener("evaluate", handleEvaluate);
    };
  }, [spreadsheet]);

  const addRow = () => {
    const name = `value${rows.length + 1}`;

    spreadsheet?.addRow({
      name,
      expr: "1 + 1",
    });
    setRows(spreadsheet?.getRows() ?? []);
  };

  const handleSave = () => {
    const data = spreadsheet?.serialize();
    if (data) {
      saveMutation.mutate(data);
    }
  };

  return (
    <div>
      <TableComposer
        columns={columns}
        data={rows}
        meta={{ spreadsheet }}
        defaultColumnVisibility={{
          dependencies: true,
        }}
      >
        <Table>
          <TableHeader />
          <TableContent />
        </Table>
      </TableComposer>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={addRow}>
          Add Row
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
