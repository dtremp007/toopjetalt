import { SpreadsheetTable } from '@/components/spreadsheet';
import { spreadsheetQueryOptions } from '@/lib/queries/spreadsheet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/$spreadsheetId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { spreadsheetId } = params;
    await context.queryClient.prefetchQuery(spreadsheetQueryOptions(spreadsheetId));
  },

})

function RouteComponent() {
  const { spreadsheetId } = Route.useParams();
  const { data } = useSuspenseQuery(spreadsheetQueryOptions(spreadsheetId));
  return (
    <div className="container mx-auto mt-10">
      <SpreadsheetTable spreadsheetId={spreadsheetId} data={data} />
    </div>
  );
}
