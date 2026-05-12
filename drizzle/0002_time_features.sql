DROP INDEX IF EXISTS "items_due_date_idx";--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN IF EXISTS "due_date";--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "recurrence" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "last_carry_over_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "items_due_at_idx" ON "items" USING btree ("due_at");
