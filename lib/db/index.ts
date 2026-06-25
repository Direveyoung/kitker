import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// toy2 셀프호스팅: 별도 DB 서비스 없이 파일 1개. EVE_DB_PATH로 경로 지정 가능.
const DB_PATH =
  process.env.EVE_DB_PATH || path.join(process.cwd(), "data", "eveworks.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// 마이그레이션 툴 없이 부트스트랩 (1인 셀프호스팅 단순화)
sqlite.exec(`
CREATE TABLE IF NOT EXISTS calendars (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'purple',
  order_index REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  calendar_id TEXT,
  parent_id TEXT,
  title TEXT NOT NULL DEFAULT '제목 없음',
  icon TEXT,
  has_schedule INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  ends_at TEXT,
  all_day INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  has_todo INTEGER NOT NULL DEFAULT 0,
  todo_done INTEGER NOT NULL DEFAULT 0,
  due_at TEXT,
  priority TEXT,
  description TEXT,
  blocks TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  order_index REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_pages_user_sched ON pages(user_id, has_schedule);
CREATE INDEX IF NOT EXISTS idx_pages_user_todo ON pages(user_id, has_todo);
`);

export const db = drizzle(sqlite, { schema });
export { schema };
