import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/database/db";
import {
  spreadsheets,
  spreadsheetRows,
  rowTags,
  type SpreadsheetSelect,
  type SpreadsheetRowSelect,
} from "@/database/schema";
import { SerializedSpreadsheet } from "../spreadsheet";
import { nanoid } from "nanoid";
import { authMiddleware } from "../middleware/auth";
import { eq, sql } from "drizzle-orm";

// Zod schemas for validation
export const createSpreadsheetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
});

export const rowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  expr: z.string(),
  input: z.any().optional(),
  tags: z.array(z.string()).optional(),
  value: z.any().optional(),
  error: z.any().optional(),
});

export type EditSpreadsheet = z.infer<typeof createSpreadsheetSchema>;
export type EditRow = z.infer<typeof rowSchema>;

export const fetchUserSpreadsheets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const spreadsheets = await db.query.spreadsheets.findMany({
      where: (spreadsheets, { eq }) =>
        eq(spreadsheets.ownerId, context.user.id),
    });

    return spreadsheets;
  });

// Server Functions
export const fetchSpreadsheet = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ spreadsheetId: z.string() }))
  .handler(async ({ data, context }): Promise<SerializedSpreadsheet> => {
    const spreadsheet = await db.query.spreadsheets.findFirst({
      where: (spreadsheets, { eq }) => eq(spreadsheets.id, data.spreadsheetId),
      with: {
        rows: {
          with: {
            tags: true,
          },
        },
      },
    });

    if (!spreadsheet) {
      throw new Error("Spreadsheet not found");
    }

    // Verify ownership
    if (spreadsheet.ownerId !== context.user.id) {
      throw new Error("Unauthorized");
    }

    return {
      rows: spreadsheet.rows.map((row) => ({
        id: row.id,
        name: row.name,
        expr: row.expr ?? "",
        value: row.value,
        input: row.input ?? undefined,
        dependencies: [], // TODO: Implement dependency tracking
        tags: row.tags.map((tag) => tag.name),
        error: row.error ?? undefined,
      })),
    };
  });

export const createSpreadsheet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(createSpreadsheetSchema)
  .handler(async ({ data, context }) => {
    const [spreadsheet] = await db
      .insert(spreadsheets)
      .values({
        id: data.id ?? nanoid(),
        name: data.name,
        ownerId: context.user.id,
      })
      .onConflictDoUpdate({
        target: [spreadsheets.id],
        set: {
          name: data.name,
          updatedAt: new Date(),
        },
      })
      .returning();

    return spreadsheet;
  });

export const saveSpreadsheet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      spreadsheetId: z.string(),
      rows: z.array(rowSchema),
    })
  )
  .handler(async ({ data, context }) => {
    console.log(data);

    // Verify ownership
    const spreadsheet = await db.query.spreadsheets.findFirst({
      where: (spreadsheets, { and, eq }) =>
        and(
          eq(spreadsheets.id, data.spreadsheetId),
          eq(spreadsheets.ownerId, context.user.id)
        ),
    });

    if (!spreadsheet) {
      throw new Error("Spreadsheet not found or unauthorized");
    }

    // Delete existing rows and tags
    await db.delete(rowTags).where(eq(rowTags.rowId, data.spreadsheetId));
    await db
      .delete(spreadsheetRows)
      .where(eq(spreadsheetRows.spreadsheetId, data.spreadsheetId));

    // Insert new rows and tags
    await db
      .insert(spreadsheetRows)
      .values(
        data.rows.map((row) => ({
          id: row.id,
          spreadsheetId: data.spreadsheetId,
          name: row.name,
          expr: row.expr,
          input: row.input,
          value: row.value,
          error: row.error,
        })) ?? []
      )
      .onConflictDoUpdate({
        target: [spreadsheetRows.id],
        set: {
          expr: sql`excluded.expr`,
          input: sql`excluded.input`,
          value: sql`excluded.value`,
          error: sql`excluded.error`,
        },
      });

    const tags =
      data.rows
        .flatMap((row) =>
          row.tags?.map((tag) => ({
            name: tag,
            rowId: row.id,
          }))
        )
        .filter((tag) => tag !== undefined) ?? [];

    if (tags.length > 0) {
      await db.insert(rowTags).values(tags);
    }

    return { success: true };
  });

// Query Options
export const userSpreadsheetsQueryOptions = () =>
  queryOptions({
    queryKey: ["spreadsheets"],
    queryFn: () => fetchUserSpreadsheets(),
  });

export const spreadsheetQueryOptions = (spreadsheetId: string) =>
  queryOptions({
    queryKey: ["spreadsheet", spreadsheetId],
    queryFn: () => fetchSpreadsheet({ data: { spreadsheetId } }),
  });
