# 🌿 eve.works — 데이터 모델 v2.0

> Phase 1-3 전체 스키마. Notion 블록 시스템 + Google Calendar 연동 + 클로이 챗 에이전트 포함.
>
> **2026-05-11 업데이트**: Supabase → **Neon Postgres + Auth.js v5** 전환.
> Auth.js 표준 테이블 4개(`user`, `account`, `session`, `verificationToken`)가 추가되었고,
> `profiles.id`는 `auth.users(id)` → `user(id)` 참조로 변경.
> RLS는 사용자 1명 환경이라 Postgres RLS 대신 **application-level 필터링**(`where user_id = session.user.id`)으로 처리.
> Phase 1 실제 스키마는 [`/lib/db/schema.ts`](../lib/db/schema.ts) (Drizzle ORM)와 [`/drizzle/0000_phase1_init.sql`](../drizzle/0000_phase1_init.sql) 기준.

---

## 📊 전체 테이블 구조 (9개)

| # | 테이블 | 용도 | Phase |
|---|---|---|---|
| 1 | `profiles` | 사용자 (Supabase Auth 연동) | 1 |
| 2 | `items` | Inbox / Todo / Note 통합 | 1 |
| 3 | `projects` | 프로젝트 갤러리 | 2 |
| 4 | `project_blocks` | Notion 스타일 자유 캔버스 블록 | 2 |
| 5 | `reading_items` | 읽을거리 (URL 메타데이터 특수) | 2 |
| 6 | `journal_entries` | 일기 (날짜별 1:1) | 2 |
| 7 | `calendar_events_cache` | Google Calendar 동기화 캐시 | 2 |
| 8 | `budget_entries` | 개인 프로젝트 가계부 | 2 |
| 9 | `credentials_hints` | 자격증명 힌트 (비번 저장 X) | 2 |
| 10 | `chat_sessions` + `chat_messages` | 클로이 챗 히스토리 | 2 |

---

## 🗄 SQL 스키마 (Supabase Postgres)

### Phase 1

```sql
-- 1. 프로필
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  display_name text DEFAULT 'Eve',
  timezone text DEFAULT 'Asia/Seoul',
  theme text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- 2. 아이템 통합 (Inbox / Todo / Note)
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  type text NOT NULL CHECK (type IN ('inbox','todo','note')),
  title text,                          -- Note 전용
  body text NOT NULL,                  -- 모든 type 공통
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,  -- 선택, Phase 2부터
  completed boolean DEFAULT false,     -- Todo 전용
  completed_at timestamptz,
  carry_over_count int DEFAULT 0,
  search_vector tsvector,              -- pgroonga 또는 ts_korean
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX items_user_type_idx ON items(user_id, type, created_at DESC);
CREATE INDEX items_project_idx ON items(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX items_search_idx ON items USING GIN(search_vector);
```

### Phase 2

```sql
-- 3. 프로젝트 갤러리
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  icon text DEFAULT '📦',              -- 이모지
  color text DEFAULT '#10b981',
  status text DEFAULT 'active',        -- active / paused / archived
  cover_text text,                     -- 카드 한 줄 설명
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX projects_user_idx ON projects(user_id, sort_order);

-- 4. Notion 블록 시스템 (프로젝트 상세 페이지)
CREATE TABLE project_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  block_type text NOT NULL CHECK (block_type IN (
    'text',           -- Lexical 메모 블록
    'todo_widget',    -- 이 프로젝트 투두 자동 표시
    'calendar_widget',-- 이 프로젝트 일정 자동 표시
    'link_board',     -- URL 모음
    'credentials',    -- 자격증명 힌트
    'number_kpi',     -- 핵심 지표 (계약완료 6/8 같은)
    'image',          -- 이미지·스크린샷
    'ai_summary'      -- 클로이 자동 요약 (주기 갱신)
  )),
  content jsonb NOT NULL DEFAULT '{}', -- 블록별 스키마
  position int NOT NULL DEFAULT 0,     -- 정렬용
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX project_blocks_project_idx ON project_blocks(project_id, position);

-- 5. 읽을거리
CREATE TABLE reading_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  url text NOT NULL,
  title text,
  description text,
  thumbnail_url text,
  source text,                         -- 도메인명
  is_read boolean DEFAULT false,
  read_at timestamptz,
  notes text,                          -- 개인 메모
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX reading_user_idx ON reading_items(user_id, is_read, created_at DESC);

-- 6. 일기
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  entry_date date NOT NULL,
  body text NOT NULL DEFAULT '',
  mood text,                           -- 선택 이모지
  prompts_used text[],                 -- 사용한 프롬프트
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX journal_user_date_idx ON journal_entries(user_id, entry_date DESC);

-- 7. Google Calendar 캐시
CREATE TABLE calendar_events_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  google_event_id text NOT NULL,
  google_calendar_id text NOT NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  is_all_day boolean DEFAULT false,
  location text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,  -- 프로젝트 태그
  raw_data jsonb,                      -- Google 원본
  synced_at timestamptz DEFAULT now(),
  UNIQUE(user_id, google_event_id)
);

CREATE INDEX calendar_user_time_idx ON calendar_events_cache(user_id, start_at);
CREATE INDEX calendar_project_idx ON calendar_events_cache(project_id) WHERE project_id IS NOT NULL;

-- 8. 가계부
CREATE TABLE budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'KRW',
  category text NOT NULL,              -- 도메인 / 호스팅 / API / SaaS / 기타
  description text,
  billing_cycle text,                  -- one_time / monthly / yearly
  paid_at date NOT NULL,
  receipt_url text,                    -- 영수증 이미지 (Supabase Storage)
  created_at timestamptz DEFAULT now()
);

CREATE INDEX budget_user_date_idx ON budget_entries(user_id, paid_at DESC);
CREATE INDEX budget_project_idx ON budget_entries(project_id) WHERE project_id IS NOT NULL;

-- 9. 자격증명 힌트 (비번 저장 X)
CREATE TABLE credentials_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  url text,
  username text,                       -- 아이디·이메일 (평문 저장 — 비밀이 아님)
  vault_hint text,                     -- "Bitwarden vault 'kbc-dock'" 같은 위치
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX credentials_project_idx ON credentials_hints(project_id);

-- 10. 클로이 챗 세션·메시지
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  title text,                          -- 자동 생성 ("마운자로 일정 정리" 같은)
  context_module text,                 -- 어디서 시작했는지 (inbox/todo/notes/projects/...)
  context_id uuid,                     -- 어떤 항목에서 시작했는지
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','tool')),
  content text NOT NULL,
  tool_calls jsonb,                    -- 도구 호출 기록
  tool_results jsonb,                  -- 도구 실행 결과
  created_at timestamptz DEFAULT now()
);

CREATE INDEX chat_sessions_user_idx ON chat_sessions(user_id, last_message_at DESC);
CREATE INDEX chat_messages_session_idx ON chat_messages(session_id, created_at);
```

---

## 🔐 RLS (Row Level Security) 정책

```sql
-- 모든 테이블 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 본인만 접근
CREATE POLICY "own data" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own data" ON items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data" ON reading_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data" ON calendar_events_cache FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data" ON budget_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data" ON chat_sessions FOR ALL USING (auth.uid() = user_id);

-- 프로젝트 종속 테이블 (project FK로 추적)
CREATE POLICY "own project blocks" ON project_blocks FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "own credentials" ON credentials_hints FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "own chat messages" ON chat_messages FOR ALL
  USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
```

---

## 📦 블록 content JSONB 스키마

각 `block_type`별 `content` 구조:

```typescript
// text
{ "lexical_state": {...} }

// todo_widget
{ "title": "프로젝트 투두", "show_completed": false, "limit": 10 }

// calendar_widget
{ "title": "이번주 일정", "range": "week", "limit": 5 }

// link_board
{ "title": "자료", "links": [{"url": "...", "label": "...", "icon": "🔗"}] }

// credentials (UI는 credentials_hints 테이블 데이터를 표시)
{ "title": "자격증명" }

// number_kpi
{ "label": "계약완료", "current": 6, "target": 8, "unit": "건" }

// image
{ "storage_path": "...", "caption": "..." }

// ai_summary
{ "prompt": "최근 7일 이 프로젝트 변화 요약",
  "last_generated_at": "...",
  "cached_content": "...",
  "refresh_interval_hours": 24 }
```

---

## 🤖 클로이 챗 — Tool Use 정의 (Phase 2)

Anthropic API에 전달할 도구 11개:

| 도구 | 설명 |
|---|---|
| `create_item` | Inbox/Todo/Note 생성 |
| `update_item` | 항목 수정 |
| `complete_todo` | 투두 완료 토글 |
| `search_items` | 풀텍스트 검색 |
| `create_project` | 프로젝트 생성 |
| `add_project_block` | 프로젝트에 블록 추가 |
| `add_reading` | 읽을거리 저장 (URL 메타 자동 fetch) |
| `create_journal_entry` | 일기 작성·편집 |
| `query_calendar` | Google Calendar 조회 |
| `add_budget_entry` | 가계부 항목 추가 |
| `web_search` | 외부 웹 검색 (링크 찾기·정보 조회) |

---

## 🔄 Google Calendar 동기화 전략

- **인증**: OAuth 2.0 (Supabase에서 사용자 토큰 저장)
- **읽기**: 초기 sync = 3개월 전 ~ 6개월 후, 이후 webhook 또는 5분 polling
- **쓰기**: eve.works에서 일정 생성 → Google API 호출 → 캐시 업데이트
- **충돌**: Google이 source of truth, 캐시는 표시·검색용
- **프로젝트 태그**: Google 이벤트의 `extendedProperties.private.eveworks_project_id`에 저장

---

## 🌏 한글 검색 (중요)

Postgres 기본 `tsvector`는 한글 토큰화 안 됨.
**선택지**:
- **pgroonga** — Supabase 지원 확인 필요, 가장 강력
- **간단 LIKE + trigram (`pg_trgm`)** — 무난, 짧은 텍스트면 충분
- **Supabase Edge Function + 한글 형태소 분석기** — 복잡

**1차 권장**: `pg_trgm` 사용. 영아 이사 데이터량(혼자 사용)에서는 충분히 빠름.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX items_body_trgm ON items USING GIN(body gin_trgm_ops);
CREATE INDEX items_title_trgm ON items USING GIN(title gin_trgm_ops);
```

---

## 📋 Phase별 마이그레이션 순서

1. **Phase 1 (Week 1)**: `profiles`, `items` 생성 + RLS + pg_trgm
2. **Phase 2 (Week 3)**: `projects`, `project_blocks`, `reading_items`, `journal_entries`
3. **Phase 2 (Week 4)**: `calendar_events_cache`, Google OAuth 셋업
4. **Phase 2 (Week 5)**: `budget_entries`, `credentials_hints`
5. **Phase 2 (Week 6)**: `chat_sessions`, `chat_messages` + Anthropic API 통합

---

**문서 버전**: v2.0
**작성일**: 2026-05-11
**연결**: PRD v1.0 + 메뉴구조 v2.0
