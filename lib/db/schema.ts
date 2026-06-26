import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

/**
 * 캘린더(컬렉션). 구글 캘린더의 "내 캘린더" 개념.
 * 개인 / 회사 / 할일 등으로 분류. color는 petal 키.
 */
export const calendars = sqliteTable("calendars", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("purple"), // yellow|pink|purple|blue
  orderIndex: real("order_index").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

/**
 * pages — "모든 콘텐츠 = 메모" 단일 테이블 (KICK_OFF 아키텍처).
 * 일정(has_schedule)/할일(has_todo) 속성을 켜면 글로벌 뷰에 노출.
 * 캘린더 우선 단계에서는 일정 컬럼을 최상위로 승격(범위 쿼리 성능).
 */
export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  calendarId: text("calendar_id"),
  parentId: text("parent_id"),
  title: text("title").notNull().default("제목 없음"),
  icon: text("icon"),
  // 일정
  hasSchedule: integer("has_schedule", { mode: "boolean" }).notNull().default(false),
  startsAt: text("starts_at"), // ISO(UTC) 또는 all_day는 'YYYY-MM-DD'
  endsAt: text("ends_at"),
  allDay: integer("all_day", { mode: "boolean" }).notNull().default(false),
  location: text("location"),
  // 할일
  hasTodo: integer("has_todo", { mode: "boolean" }).notNull().default(false),
  todoDone: integer("todo_done", { mode: "boolean" }).notNull().default(false),
  dueAt: text("due_at"),
  priority: text("priority"),
  // 본문/메타
  description: text("description"),
  blocks: text("blocks", { mode: "json" }).$type<unknown[]>().notNull().default([]),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  orderIndex: real("order_index").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

/** 웹푸시 구독 (기기별) */
export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: text("created_at").notNull(),
});

/** 발송한 리마인더 기록 (중복 방지) */
export const remindersSent = sqliteTable("reminders_sent", {
  id: text("id").primaryKey(),
  pageId: text("page_id").notNull(),
  kind: text("kind").notNull(), // 'schedule' | 'todo'
  sentAt: text("sent_at").notNull(),
});

export type Calendar = typeof calendars.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
