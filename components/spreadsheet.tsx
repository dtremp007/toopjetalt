import React from "react";
import { SerializedSpreadsheet, Spreadsheet } from "@/lib/spreadsheet";
import { Row } from "@/lib/spreadsheet/row";
import { CodeEditor } from "./code-editor";
import { Table, TableComposer, TableContent, TableHeader } from "./data-table";
import { columns } from "./spreadsheet-columns";
import { Button } from "./ui/button";

function loadSpreadsheet() {
  const savedData = localStorage.getItem("spreadsheet");
  if (!savedData) return new Spreadsheet();
  return Spreadsheet.deserialize(JSON.parse(savedData));
}

export function SpreadsheetTable() {
  const [spreadsheet, setSpreadsheet] = React.useState<Spreadsheet | null>(null);
  const [rows, setRows] = React.useState<Row[]>([]);

  React.useEffect(() => {
    const spreadsheet = loadSpreadsheet();
    setSpreadsheet(spreadsheet);
    setRows(spreadsheet.getRows());
  }, []);

  React.useEffect(() => {
    if (!spreadsheet) return;

    spreadsheet.onChange((e) => {
      setRows(e.spreadsheet.getRows());
    });
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
    localStorage.setItem("spreadsheet", JSON.stringify(data));
  };

  const handleLoad = () => {
    const spreadsheet = loadSpreadsheet();
    setSpreadsheet(spreadsheet);
    setRows(spreadsheet.getRows());
  };

  return (
    <div>
      <TableComposer
        columns={columns}
        data={rows}
        meta={{ spreadsheet }}
        defaultColumnVisibility={{
          dependencies: false,
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
        <Button variant="outline" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outline" onClick={handleLoad}>
          Load
        </Button>
      </div>
    </div>
  );
}
