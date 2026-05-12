import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Auth.js v5 표준 테이블 ──────────────────────────────────────

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// ─── eveworks 도메인 테이블 ──────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").unique().notNull(),
  displayName: text("display_name").default("Eve"),
  timezone: text("timezone").default("Asia/Seoul"),
  theme: text("theme").default("system"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["inbox", "todo", "note"] }).notNull(),
    title: text("title"),
    body: text("body").notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
    carryOverCount: integer("carry_over_count").default(0).notNull(),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }),
    recurrence: text("recurrence", {
      enum: ["daily", "weekly", "monthly"],
    }),
    priority: integer("priority").default(4).notNull(),
    lastCarryOverAt: timestamp("last_carry_over_at", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("items_user_type_idx").on(t.userId, t.type, t.createdAt),
    index("items_due_at_idx").on(t.dueAt),
  ],
);

// ─── v2: entities + 모듈별 확장 ────────────────────────────────────

export const entities = pgTable(
  "entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "inbox",
        "task",
        "note",
        "event",
        "project",
        "reading",
        "journal",
        "transaction",
      ],
    }).notNull(),
    title: text("title"),
    body: text("body"),
    metadata: jsonb("metadata").default({}).notNull(),
    tags: text("tags").array().default(sql`ARRAY[]::text[]`).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (t) => [
    index("idx_entities_user_type").on(t.userId, t.type),
    index("idx_entities_updated_at").on(t.updatedAt),
  ],
);

export const tasks = pgTable("tasks", {
  entityId: uuid("entity_id")
    .primaryKey()
    .references(() => entities.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at", {
    mode: "date",
    withTimezone: true,
  }),
  dueAt: timestamp("due_at", { mode: "date", withTimezone: true }),
  priority: smallint("priority").default(4).notNull(),
  recurrence: text("recurrence", {
    enum: ["daily", "weekly", "monthly"],
  }),
  carryOverCount: integer("carry_over_count").default(0).notNull(),
  lastCarryOverAt: timestamp("last_carry_over_at", {
    mode: "date",
    withTimezone: true,
  }),
});

export const events = pgTable("events", {
  entityId: uuid("entity_id")
    .primaryKey()
    .references(() => entities.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  endsAt: timestamp("ends_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  location: text("location"),
  isAllDay: boolean("is_all_day").default(false).notNull(),
  googleEventId: text("google_event_id"),
});

// ─── 타입 export ──────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EntityType = Entity["type"];

// v1 호환 (Phase 1 마이그레이션 후 사용 안 함)
export type Item = typeof items.$inferSelect;
