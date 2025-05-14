import { createFileRoute } from "@tanstack/react-router"
import { Table } from "@/components/data-table/table"
import { TableComposer, TableContent } from "@/components/data-table"
import { SpreadsheetTable } from "@/components/spreadsheet"

export const Route = createFileRoute("/")({
    component: App
})

function App() {
    return (
        <div className="container mx-auto mt-10">
            <SpreadsheetTable />
        </div>
    )
}
