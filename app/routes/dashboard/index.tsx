import { SpreadsheetTable } from "@/components/spreadsheet";
import { createSpreadsheet, userSpreadsheetsQueryOptions } from "@/lib/queries/spreadsheet";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(userSpreadsheetsQueryOptions());
  },
});

function CreateSpreadsheetForm({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const createMutation = useMutation({
    mutationFn: (name: string) => createSpreadsheet({ data: { name } }),
    onSuccess: () => {
      setIsOpen(false);
      onSuccess();
    },
  });

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Spreadsheet
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Spreadsheet</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            if (name) {
              createMutation.mutate(name);
            }
          }}
        >
          <Input name="name" placeholder="Spreadsheet Name" required />
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { data: spreadsheets, refetch } = useSuspenseQuery(userSpreadsheetsQueryOptions());

  return (
    <div className="container mx-auto mt-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Spreadsheets</h1>
      </div>

      <CreateSpreadsheetForm onSuccess={() => refetch()} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {spreadsheets.map((spreadsheet) => (
          <Link
            to="/dashboard/$spreadsheetId"
            params={{ spreadsheetId: spreadsheet.id }}
            key={spreadsheet.id}
          >
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{spreadsheet.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(spreadsheet.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {spreadsheets.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No spreadsheets yet. Create your first one!
        </div>
      )}
    </div>
  );
}
