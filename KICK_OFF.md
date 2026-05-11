# 🚀 KICK_OFF — eveworks 첫 미션

> 안티그라비티(코워크) 또는 Claude Code가 처음 이 레포 받았을 때 따라야 할 단계별 지시문.
> **순서대로** 진행. 한 단계 완료마다 commit + push.

---

## 📌 시작 전 필독

1. `README.md` — 프로젝트 개요
2. `CLAUDE.md` — 컨텍스트·규칙
3. `docs/PRD.md` — 전체 제품 요구사항
4. `docs/menu_features.md` — UI 명세
5. `docs/data_model.md` — DB 스키마

---

## 🎯 미션 범위

**Phase 1 (2주)** 구현. 4개 모듈만:
- 📥 Inbox
- ✅ Todo
- 💭 Notes
- 🔍 Search

Phase 2 (Calendar, Projects, Reading, Journal, Budget, 클로이 챗)는 추후 별도 미션.

---

## 📅 Week 1 (셋업 + Inbox + Todo)

### Step 1: Next.js 14 환경 셋업

```bash
npx create-next-app@latest . --typescript --tailwind --app --import-alias "@/*"
# 기존 docs/, README, CLAUDE.md 유지하면서 진행
```

설치 후:
- TypeScript strict mode 활성화 (`tsconfig.json`)
- Pretendard 폰트 적용 (`app/layout.tsx`)
- 다크모드 셋업 (`next-themes`)

### Step 2: shadcn/ui 셋업

```bash
npx shadcn@latest init
# zinc 컬러 / Pretendard
npx shadcn@latest add button input checkbox dialog dropdown-menu toast sonner
```

### Step 3: Supabase 프로젝트 생성

영아 이사에게 요청:
1. Supabase 무료 프로젝트 생성 (`eveworks`)
2. URL + Anon Key + Service Role Key 공유
3. `.env.local`에 입력 (`.env.example` 참고)

### Step 4: DB 스키마 적용

```bash
mkdir -p supabase/migrations
# docs/data_model.md의 Phase 1 SQL을
# supabase/migrations/00001_phase1_init.sql 으로 저장
# Supabase Dashboard SQL Editor에서 실행
```

포함:
- `profiles` 테이블
- `items` 테이블
- `pg_trgm` 확장
- RLS 정책
- 인덱스

### Step 5: Supabase Auth (Magic Link)

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- `lib/supabase/client.ts`, `lib/supabase/server.ts` 생성
- `app/(auth)/login/page.tsx` — Magic Link 입력 폼
- `app/auth/callback/route.ts` — 콜백 핸들러
- `middleware.ts` — 세션 보호

### Step 6: 메인 레이아웃

- `app/(app)/layout.tsx` — 데스크탑 사이드바 + 모바일 탭바
- 4개 메뉴 항목 (Inbox / Todo / Notes / Search-모달)
- 우측 상단 프로필 드롭다운

### Step 7: Inbox 구현

`app/(app)/inbox/page.tsx`:
- 상단 한 줄 입력창 (auto focus)
- Enter → `items.create({type: 'inbox', body})` + 입력창 초기화
- 리스트: 시간 그룹화 (방금·1시간 전·어제·N일 전)
- 항목별 액션: → Todo / → Notes / ✕ 삭제
- 모바일 스와이프: 좌→우 Todo / 우→좌 삭제
- 빈 상태 메시지

### Step 8: Todo 구현

`app/(app)/todo/page.tsx`:
- + 할일 추가 (인라인)
- 체크박스 (미완료 위, 완료 아래로 정렬)
- Carry-over 배지 `[↩N]`
- 자정 자동 carry: Supabase Edge Function + cron
  - 또는 클라이언트 진입 시 체크 (간단 시작용)

**Week 1 끝: 영아 이사 로컬 사용 시작 가능.**

---

## 📅 Week 2 (Notes + Search + 배포)

### Step 9: Lexical 에디터

```bash
npm install lexical @lexical/react @lexical/markdown @lexical/rich-text
```

- `components/editor/LexicalEditor.tsx`
- 마크다운 단축키, 자동 저장 (1s debounce)
- 키베이스 허브 설정과 동일하게

### Step 10: Notes 구현

`app/(app)/notes/page.tsx` (목록) + `app/(app)/notes/[id]/page.tsx` (에디터):
- 카드 리스트, 최근 수정순, 본문 80자 프리뷰
- + 새 노트 → 즉시 에디터
- 제목 비어있으면 첫 줄 자동 추출
- 빈 노트 5분 idle 자동 삭제

### Step 11: 글로벌 검색

- `components/search/SearchDialog.tsx` (Cmd+K 단축키)
- `pg_trgm` 사용한 풀텍스트 검색
- 결과 그룹화: Inbox / Todo / Notes
- 키보드 네비게이션 (↑↓, Enter, Esc)

### Step 12: PWA 셋업

```bash
npm install next-pwa
```

- `public/manifest.json` (이름: eveworks, 아이콘: 🌿 임시)
- 오프라인 fallback (Phase 1은 간단하게)

### Step 13: Vercel 배포

- GitHub 자동 연동 (main push → 자동 배포)
- 환경변수 등록 (Vercel Dashboard)
- 배포 URL 영아 이사에게 공유

### Step 14: 영아 이사 QA

- 영아 이사 Magic Link 로그인 테스트
- 모바일 홈화면 추가 (PWA)
- 발견된 버그 → TODO.md에 추가

**Week 2 끝: Phase 1 MVP 배포 완료.**

---

## ✅ 완료 정의 (DoD)

- [ ] 4개 모듈 모두 동작 (Inbox·Todo·Notes·Search)
- [ ] Magic Link 로그인 가능
- [ ] 모바일 PWA 설치 가능
- [ ] Vercel 자동 배포
- [ ] CHANGELOG.md / TODO.md 최신
- [ ] 영아 이사 1주일 사용 후 피드백 1건 이상 반영

---

## ⚠️ 주의사항

- **2주 안에 못 끝나면 Search 빼고 배포.** Phase 1 늘어지면 멈춤.
- **새 기능 추가 금지.** Phase 1에서는 4개 모듈만.
- **디자인 함정 조심.** Tailwind 기본 + shadcn/ui 그대로. 커스텀 디자인 시스템 만들지 X.
- **모서리 케이스 적당히.** PRD에 명시된 것만. 그 외 발견되면 TODO.md에 적고 패스.

---

## 📞 보고 규칙

영아 이사에게:
- 매일 끝나기 전 1줄 보고 ("오늘: Step N 완료 / 내일: Step N+1")
- 막히면 즉시 보고 (혼자 30분 이상 헤매지 말 것)
- Step 완료 시 commit + push

---

**다음 미션 (Phase 2)** = 이 미션 완료 후 별도 KICK_OFF_2.md로 전달.

Phase 2 미리보기: Google Calendar 연동, Projects (Notion 블록), Reading, Journal, Budget, 클로이 챗 (Anthropic Tool Use).
