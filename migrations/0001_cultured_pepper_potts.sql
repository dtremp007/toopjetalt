CREATE TABLE "row_tags" (
	"name" text NOT NULL,
	"row_id" text NOT NULL,
	CONSTRAINT "row_tags_name_row_id_pk" PRIMARY KEY("name","row_id")
);
--> statement-breakpoint
CREATE TABLE "spreadsheet_rows" (
	"id" text PRIMARY KEY NOT NULL,
	"spreadsheet_id" text NOT NULL,
	"name" text NOT NULL,
	"expr" text,
	"value" jsonb,
	"input" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spreadsheets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_owner_id_pk" PRIMARY KEY("name","owner_id")
);
--> statement-breakpoint
ALTER TABLE "row_tags" ADD CONSTRAINT "row_tags_row_id_spreadsheet_rows_id_fk" FOREIGN KEY ("row_id") REFERENCES "public"."spreadsheet_rows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spreadsheet_rows" ADD CONSTRAINT "spreadsheet_rows_spreadsheet_id_spreadsheets_id_fk" FOREIGN KEY ("spreadsheet_id") REFERENCES "public"."spreadsheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spreadsheets" ADD CONSTRAINT "spreadsheets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;