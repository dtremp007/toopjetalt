import { SpreadsheetTable } from "@/components/spreadsheet";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto mt-10">
      <SpreadsheetTable />
    </div>
  );
}
