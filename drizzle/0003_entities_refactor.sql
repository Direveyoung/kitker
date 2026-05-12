-- ============================================================
-- v2 entities 리팩토링 (Phase 1)
-- v1 items 44건 → entities + tasks 이관 (롤백 가능, items 보존)
-- ============================================================

-- ─── 공통 entity (모든 모듈의 부모) ───────────────────────
CREATE TABLE "entities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "title" text,
  "body" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "idx_entities_user_type"
  ON "entities" ("user_id", "type")
  WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "idx_entities_title_trgm"
  ON "entities" USING gin ("title" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "idx_entities_body_trgm"
  ON "entities" USING gin ("body" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX "idx_entities_updated_at"
  ON "entities" ("updated_at" DESC)
  WHERE "deleted_at" IS NULL;
--> statement-breakpoint

-- ─── tasks 확장 (Todo + Today) ───────────────────────────
CREATE TABLE "tasks" (
  "entity_id" uuid PRIMARY KEY REFERENCES "entities"("id") ON DELETE CASCADE,
  "completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamptz,
  "due_at" timestamptz,
  "priority" smallint DEFAULT 4 NOT NULL,
  "recurrence" text,
  "carry_over_count" integer DEFAULT 0 NOT NULL,
  "last_carry_over_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "idx_tasks_due_at" ON "tasks" ("due_at");
--> statement-breakpoint
CREATE INDEX "idx_tasks_completed" ON "tasks" ("completed");
--> statement-breakpoint

-- ─── events 확장 (Calendar) ──────────────────────────────
CREATE TABLE "events" (
  "entity_id" uuid PRIMARY KEY REFERENCES "entities"("id") ON DELETE CASCADE,
  "starts_at" timestamptz NOT NULL,
  "ends_at" timestamptz NOT NULL,
  "location" text,
  "is_all_day" boolean DEFAULT false NOT NULL,
  "google_event_id" text
);
--> statement-breakpoint
CREATE INDEX "idx_events_starts_at" ON "events" ("starts_at");
--> statement-breakpoint

-- ─── v1 items → v2 entities + tasks 데이터 이관 ──────────
-- items.id (UUID) → entities.id 동일 UUID 유지
-- type 매핑: todo → task, inbox/note 유지
INSERT INTO "entities" ("id", "user_id", "type", "title", "body", "created_at", "updated_at")
SELECT
  "id",
  "user_id",
  CASE WHEN "type" = 'todo' THEN 'task' ELSE "type" END,
  "title",
  "body",
  "created_at",
  "updated_at"
FROM "items";
--> statement-breakpoint

-- v1 todo → v2 tasks 확장 데이터
INSERT INTO "tasks" (
  "entity_id", "completed", "completed_at", "due_at", "priority",
  "recurrence", "carry_over_count", "last_carry_over_at"
)
SELECT
  "id",
  "completed",
  "completed_at",
  "due_at",
  "priority",
  "recurrence",
  "carry_over_count",
  "last_carry_over_at"
FROM "items"
WHERE "type" = 'todo';
