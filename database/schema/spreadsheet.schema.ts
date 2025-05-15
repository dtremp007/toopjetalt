import {
  pgTable,
  text,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "@/auth-schema";
import { relations } from "drizzle-orm";
import { RowInput, Value } from "@/lib/spreadsheet/row";

export const spreadsheets = pgTable("spreadsheets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const spreadsheetRelations = relations(spreadsheets, ({ many }) => ({
  rows: many(spreadsheetRows),
  tags: many(rowTags),
}));

export const spreadsheetRows = pgTable("spreadsheet_rows", {
  id: text("id").primaryKey(),
  spreadsheetId: text("spreadsheet_id")
    .notNull()
    .references(() => spreadsheets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  expr: text("expr"),
  value: jsonb("value").$type<Value>(),
  input: jsonb("input").$type<RowInput>(),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const spreadsheetRowRelations = relations(
  spreadsheetRows,
  ({ one, many }) => ({
    spreadsheet: one(spreadsheets, {
      fields: [spreadsheetRows.spreadsheetId],
      references: [spreadsheets.id],
    }),
    tags: many(rowTags),
  })
);

export const tags = pgTable(
  "tags",
  {
    name: text("name").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.name, table.ownerId] })]
);

export const rowTags = pgTable(
  "row_tags",
  {
    name: text("name").notNull(),
    rowId: text("row_id")
      .notNull()
      .references(() => spreadsheetRows.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.name, table.rowId] })]
);

export const rowTagRelations = relations(
  rowTags,
  ({ one }) => ({
    row: one(spreadsheetRows, {
      fields: [rowTags.rowId],
      references: [spreadsheetRows.id],
    }),
  })
);

// Export the inferred types
export type SpreadsheetSelect = typeof spreadsheets.$inferSelect;
export type SpreadsheetRowSelect = typeof spreadsheetRows.$inferSelect;
