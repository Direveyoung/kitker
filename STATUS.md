# 📊 eveworks 개발 현황

> **2026-05-12 기준 · Phase 1 거의 완료 (UI 폴리시·PWA만 남음)**
>
> 배포: https://eveworks.vercel.app
> 레포: https://github.com/Direveyoung/eveworks

---

## 🎯 한눈에 보기

| 항목 | 상태 |
|---|---|
| **인증 (Magic Link)** | ✅ 동작 (영아 이사 실제 로그인 검증 완료) |
| **DB / 마이그레이션** | ✅ 3개 마이그레이션 적용 (Neon Postgres) |
| **Inbox** | ✅ 입력 / 시간 그룹화 / Todo·Notes 전환 / 삭제 / 정확 시각 tooltip |
| **Todo** | ✅ 입력 / 체크 / 우선순위 / 마감 시각 / 반복 / carry-over / 자연어 입력 |
| **Notes** | ✅ Lexical 에디터 (마크다운) / auto-save / 카드 리스트 |
| **검색** | ✅ ⌘K 글로벌 검색 (Inbox·Todo·Notes 통합) |
| **알림** | ✅ 마감 시각 도래 시 sonner toast + 브라우저 Notification |
| **배포** | ✅ Vercel 자동 (main push → 1-2분 내 production) |
| **UI 디자인** | ⏳ Todoist 풍 1차 적용, 영아 이사 재검토 중 |
| **PWA** | ❌ 미구현 |

---

## 🛠 기술 스택 (확정)

```
Next.js 16 (App Router, Turbopack)
React 19 + TypeScript 5
Tailwind v4 + shadcn/ui (base-nova, zinc + red accent)
Pretendard Variable + next-themes
Lexical 에디터 (마크다운 transformers)
Auth.js v5 (Magic Link via Resend)
Neon Postgres (서버리스) + Drizzle ORM
Vercel 배포 (GitHub 연동)
```

**스택 피벗 기록**: 원래 docs는 Next 14 + Supabase였으나
- Next 14 → 16 (최신 우선 결정)
- Supabase → Neon + Auth.js + Resend (Free tier 한도 우회)

---

## ✅ 완료된 기능 (모듈별)

### 📥 Inbox `/inbox`
- 상단 입력창 (autoFocus, Enter / 담기 버튼)
- 시간 그룹화: 방금 전 / 한 시간 이내 / 오늘 / 어제 / N일 전
- 항목 호버 시 액션: → Todo 전환, → Notes 전환, ✕ 삭제
- 항목 hover 시 tooltip에 정확 시각 (예: 5월 12일 14:32)
- 모바일에선 액션 항상 표시 (호버 불가)
- 빈 상태: 📥 + "Inbox가 비어있어요" 안내문

### ✅ Todo `/todo`
- 입력창 — **자연어 인식**: "내일 오후 3시 회의", "매주 월요일 보고" 자동 파싱
- 체크박스 토글 (size-18, 둥근)
- 미완료 위, 완료 아래 자동 정렬 (완료 섹션은 접기/펼치기)
- 우선순위 P1-P4 (drop-down):
  - P1 빨강 / P2 주황 / P3 파랑 / P4 기본
  - 체크박스 border 색으로 표시
- 마감 날짜+시각 (datetime-local picker):
  - 오늘 15:00 / 내일 09:30 / N분 지남 등 친근 표시
  - 임박(1시간 이내) 시 행 빨강 배경 강조
- 반복 일정 (drop-down):
  - 매일 / 매주 / 매월
  - 완료 체크 시 다음 인스턴스 자동 생성
- carry-over 자동:
  - Todo 페이지 진입 시 어제 미완료 → `↩N` 배지 증가
  - 같은 날 여러 번 진입해도 1회만 카운트 (idempotent)

### 💭 Notes `/notes`
- 카드 리스트 (제목 또는 첫 줄 / 80자 프리뷰 / 수정시각)
- 새 노트: 빨강 + 새 노트 버튼 → 즉시 빈 에디터 진입
- `/notes/[id]` 에디터:
  - 상단 `← Notes` 뒤로가기 + 저장 상태 표시 ("저장 중…" / "저장됨 14:32")
  - Lexical 에디터 (마크다운 단축키):
    - `# 제목` / `## 부제목` / `### 소제목`
    - `- 리스트` / `1. 순서 리스트`
    - `**굵게**` / `*기울임*` / `~~취소선~~`
    - `> 인용` / ``` 코드 블록 ```
    - 링크, 코드 인라인
  - 1초 debounce auto-save
  - 삭제 시 sonner 토스트 알림

### 🔍 검색 (⌘K)
- 사이드바 검색 버튼 또는 글로벌 `Cmd+K` / `Ctrl+K`
- ILIKE 패턴 + GIN 인덱스 (한글 검색 지원)
- Type별 그룹화: 📥 Inbox / ✅ Todo / 💭 Notes
- 키보드 네비게이션: ↑↓ Enter Esc
- 결과 클릭 시 라우팅 (note는 `/notes/[id]`로, 나머지는 모듈 페이지)
- 200ms debounce

### ⏰ 시간 기능 (전면 구축)
| # | 기능 | 구현 |
|---|---|---|
| 1 | 자정 carry-over | Todo 페이지 진입 시 자동, idempotent |
| 2 | 마감 시각 (date+time) | datetime-local picker |
| 3 | 반복 일정 | daily/weekly/monthly + 완료 시 다음 인스턴스 |
| 4 | 알림 | sonner toast + Notification API (탭 열림 시) |
| 5 | 자연어 입력 | 오늘/내일/모레/글피/다음주 + 요일 + 오전·오후 시간 |
| 6 | Inbox 정확 시각 | hover tooltip |

### 🔐 인증
- Auth.js v5 + DrizzleAdapter + Resend provider
- 첫 user 생성 시 `events.createUser`로 `profiles` row 자동 insert
- `proxy.ts` (Next 16, 구 middleware): 미인증 시 `/login` 리다이렉트, 인증된 사용자가 `/login` 접근 시 `/` 리다이렉트
- 로그아웃: server action signOut

### 🚀 배포 / 운영
- Vercel project `eveworks` (team `024s-projects`)
- GitHub 자동 연동 (main push → production)
- 환경변수 6개 (Vercel + .env.local 동일):
  - `DATABASE_URL`, `AUTH_SECRET`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`
- production URL: `https://eveworks.vercel.app` (고정)

---

## 🗃 데이터 모델 (Phase 1 확정)

**Auth.js 4 테이블** (표준):
- `user` (id, email, emailVerified, name, image)
- `account` (OAuth 미사용이라 사용 X, 스키마만 존재)
- `session` (database strategy)
- `verificationToken` (Magic Link)

**도메인 2 테이블**:
- `profiles` (id ← user.id, email, displayName, timezone, theme)
- `items` (id, user_id, type, title, body, completed, completed_at,
  carry_over_count, due_at, recurrence, priority, last_carry_over_at,
  created_at, updated_at)
  - **type**: inbox / todo / note (단일 테이블 통합)
  - **인덱스**: user_type, body trigram, title trigram, due_at

**RLS**: Postgres RLS 미사용. Application-level 필터 (`where user_id = session.user.id`). 1인 사용 환경이라 안전.

---

## ⏳ 미구현 / 백로그

### Phase 1 잔여
- [ ] **UI 전면 재디자인** ← 영아 이사 진행 요청 중
- [ ] 모바일 스와이프 액션 (Inbox 좌→우 Todo, 우→좌 삭제)
- [ ] 빈 노트 5분 idle 자동 삭제
- [ ] PWA (manifest, 홈화면 추가, 오프라인 fallback)

### Phase 2 (별도 미션, KICK_OFF_2.md 예정)
- [ ] 📅 Google Calendar 연동 (OAuth + 양방향 sync)
- [ ] 📦 Projects (Notion 블록 시스템)
- [ ] 🔖 Reading List (URL 메타데이터)
- [ ] 📓 Journal (날짜별 1:1)
- [ ] 💸 Budget (개인 프로젝트 가계부)
- [ ] 🔒 Credentials Hints (비번 저장 X, 힌트만)
- [ ] 🤖 클로이 챗 (Anthropic Tool Use, 에이전트형)

### 알려진 제약
- 알림: **탭이 열려있을 때만** 작동 (PWA + service worker로 백그라운드 확장 가능)
- carry-over: 영아 이사가 Todo 페이지에 진입해야 트리거 (자정 cron 없음)
- 자연어 파서: 한국어 일부만 (오늘/내일/모레/글피/다음주/요일/오전·오후 시간/매일·매주·매월). 영어 패스
- Notes Lexical: 이미지·테이블·체크리스트 미지원 (Phase 2 강화 가능)

---

## 📂 디렉토리 구조 (현재)

```
eveworks/
├── app/
│   ├── (app)/                  # 인증 필요
│   │   ├── layout.tsx          # 사이드바 + 탭바 + DueWatcher
│   │   ├── page.tsx            # → /inbox 리다이렉트
│   │   ├── inbox/page.tsx
│   │   ├── todo/page.tsx
│   │   └── notes/
│   │       ├── page.tsx        # 카드 리스트
│   │       └── [id]/page.tsx   # 에디터
│   ├── (auth)/login/
│   │   ├── page.tsx
│   │   └── actions.ts          # signIn Magic Link
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx              # Pretendard + ThemeProvider + Toaster
│   └── globals.css             # Tailwind v4 + zinc/red CSS variables
├── auth.ts                     # NextAuth v5 config
├── proxy.ts                    # 인증 미들웨어 (Next 16 컨벤션)
├── components/
│   ├── editor/lexical-editor.tsx
│   ├── items/todo-row.tsx
│   ├── layout/{nav-list, user-menu}.tsx
│   ├── notes/note-editor.tsx
│   ├── notifications/due-watcher.tsx
│   ├── search/{search-dialog, search-trigger}.tsx
│   ├── theme-provider.tsx
│   └── ui/                     # shadcn (button, checkbox, dialog, …)
├── lib/
│   ├── db/{schema, index}.ts   # Drizzle
│   ├── items/{actions, queries, search, grouping, parse-natural}.ts
│   └── utils.ts
├── drizzle/
│   ├── 0000_phase1_init.sql
│   ├── 0001_todo_meta.sql
│   ├── 0002_time_features.sql
│   └── meta/
├── docs/                       # PRD, menu_features, data_model
├── scripts/migrate.ts
└── STATUS.md (이 파일)
```

---

## 📋 KICK_OFF.md Step 진행 상황

| Step | 항목 | 상태 |
|---|---|---|
| 1 | Next.js 셋업 | ✅ |
| 2 | shadcn/ui | ✅ |
| 3 | ~~Supabase~~ → Neon DB | ✅ |
| 4 | DB 마이그레이션 | ✅ |
| 5 | Magic Link 인증 | ✅ |
| 6 | 메인 레이아웃 | ✅ |
| 7 | Inbox | ✅ |
| 8 | Todo (+ carry-over) | ✅ |
| 9 | Lexical 에디터 | ✅ |
| 10 | Notes | ✅ |
| 11 | 글로벌 검색 (⌘K) | ✅ |
| 12 | PWA | ❌ |
| 13 | Vercel 배포 | ✅ (선행) |
| 14 | 영아 이사 QA | 🔄 진행 중 |

---

## 🎨 추가로 한 작업 (KICK_OFF 외)

- **D — Todo 마감일·우선순위** (Todoist 풍 칩)
- **시간 기능 6개 전면 구축** (carry-over · 시각 · 반복 · 알림 · 자연어 · tooltip)
- **UI 1차 폴리시** (Todoist 풍 색상 · 사이드바 · 헤더 · 빈 상태)

---

## 🚦 다음 단계 후보

1. **UI 전면 재디자인** ← 영아 이사 진행 요청
2. **PWA 셋업** (Step 12)
3. **모바일 스와이프 / 빈 노트 idle 삭제 등 Phase 1 잔여**
4. **Phase 2 시작** (Calendar, Projects, 클로이 챗 등)

---

**🌿 영아 이사 검토 후 우선순위 결정 부탁드립니다.**
