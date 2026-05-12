ALTER TABLE "items" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "priority" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
CREATE INDEX "items_due_date_idx" ON "items" USING btree ("due_date");