# 📝 CHANGELOG

## [v3.1.9] — 2026-06-26 · Tasks 캘린더 뷰

### Added
- Tasks 세 번째 뷰 "캘린더" — 월 그리드(monthMatrix 재사용), dueAt 기준 pink 칩,
  이전/다음/오늘 월 이동, 칩 → 메모 연결, 마감없음 개수 안내

---

## [v3.1.8] — 2026-06-26 · 메모 트리 드래그 정렬

### Added
- `movePage` 액션: before/after(형제 재정렬, orderIndex 중간값) + child(하위 이동),
  자기 자손으로 이동 차단
- 트리 HTML5 드래그앤드롭: 드래그 핸들(grip) + 드롭존 표시(위/아래 라인, 하위 ring)

---

## [v3.1.0 Phase 1 완료] — 2026-06-26 🎉

개발 순서 12/12 완료: Shell·테마 · 메모 트리 · 블록 에디터 · 속성 패널 ·
Today · Calendar · Tasks · ⌘K 검색 · ⌘N 자연어 캡처 · 마크다운 임포트 · PWA.

- `STATUS.md` 작성 (전체 현황 + 검증 결과)
- 로컬 검증 통과: 타입/린트/빌드, 전 라우트 200, 검색 <1.5ms(115개), PWA 자산
- 남은 검증: iPhone Safari 실기기 · toy2 배포 (영아 이사 액션)

---

## [v3.1.7] — 2026-06-26 · PWA

### Added
- Service worker `public/sw.js`: 내비게이션 네트워크 우선 → `/offline` 폴백,
  정적 자산 캐시 우선
- `/offline` 폴백 페이지, SW 등록 컴포넌트 `components/pwa/sw-register.tsx` (prod 한정)
- 앱 아이콘 `public/icon.svg` (maskable), 동적 apple-touch-icon `app/apple-icon.tsx` (next/og)

### Changed
- manifest 아이콘: 없던 PNG 참조 → `icon.svg` 단일 (svg+xml, any maskable)
- 루트 layout에 SwRegister 마운트

### Notes
- 의존성 추가 없음 (next-pwa 미사용 — Turbopack 호환 위해 수동 SW)
- 남은 검증: 실제 iPhone Safari 홈화면 추가 (영아 이사 디바이스 테스트)

---

## [v3.1.6] — 2026-06-26 · 마크다운 임포트

### Added
- 마크다운 파서 `lib/import/markdown.ts`: 제목(첫 H1) · 헤딩 · 체크박스 todo ·
  인용 · 코드펜스 · 구분선 · 리스트(불릿 문단) · 인라인기호 제거
- 임포트 다이얼로그 `components/shell/import-dialog.tsx`: .md 다중 파일 업로드 +
  붙여넣기 → 페이지 생성 후 이동
- `lib/import/actions.ts` (importMarkdown)
- ⌘K 커맨드바에 "마크다운 가져오기" 항목

---

## [v3.1.5] — 2026-06-26 · ⌘N 자연어 캡처

### Added
- 빠른 캡처 모달 (`components/shell/capture-bar.tsx`) — ⌘N / 사이드바 버튼
  - 한국어 자연어 파서 `lib/capture/parse.ts`:
    오늘/내일/모레/글피, N요일(이번주/다음주), M월 D일, M/D,
    오전·오후 N시(반/N분), HH:mm 인식
  - 메모/할일/일정 자동 분류 + 칩으로 수동 오버라이드, 실시간 프리뷰
  - 확정 시 createPage/createTodo/createEvent로 분기 저장

### Changed
- ⌘N: 빈 메모 생성 → 자연어 캡처 모달로 변경
- 사이드바 "새 메모" 버튼 → "빠른 캡처" (트리 +버튼은 여전히 빈 메모 생성)

---

## [v3.1.4] — 2026-06-26 · Tasks 뷰 + ⌘K 검색

### Added
- Tasks 전용 뷰 (`components/tasks/tasks-view.tsx`)
  - 목록(마감 그룹: 지난마감/오늘/예정/마감없음/완료) ↔ 보드 토글
  - 빠른 추가, 완료 토글(낙관적), 각 항목 → 메모(/pages/[id]) 연결
- ⌘K 커맨드바 (`components/shell/command-bar.tsx`)
  - 메모 검색: 제목 + 블록 본문 LIKE, 스니펫 표시
  - 빈 쿼리 시 이동 명령(Today/Calendar/Tasks/Pages/새 메모)
  - 키보드 내비(↑↓/Enter/Esc), 사이드바 검색 버튼 이벤트 연결
- `lib/search/actions.ts` (searchPages)

---

## [v3.1.3] — 2026-06-26 · 메모 트리 + 블록 에디터

### Added
- 메모 트리 (사이드바): 무한 중첩 · 펼치기/접기 · 새/하위 메모 · 삭제(자손 소프트삭제) · 아이콘
  - `components/pages/page-tree.tsx` (client) + `page-tree-data.tsx` (server 주입)
- 블록 에디터 `/pages/[id]` (`components/pages/page-editor.tsx`)
  - 블록 6종: paragraph / heading(1~3) / todo / quote / code / divider
  - 슬래시(`/`) 명령 메뉴, caret 분할 Enter, Backspace 병합, 자동 높이
  - 제목·아이콘 인라인 편집, 1초 debounce auto-save ("저장됨" 표시)
  - 속성 토글 칩(할 일/일정) → 글로벌 뷰 노출
- `lib/pages/{types,queries,actions}.ts`: getPageTree/getPage, create/rename/setIcon/updateBlocks/togglePageProperty/delete
- `/pages` 인덱스 = 빈 상태 + "새 메모 만들기"

### Changed
- 사이드바 "새 메모" 버튼 + ⌘N → 페이지 생성 후 바로 이동
- layout이 메모 트리(server)를 사이드바에 주입

---

## [v3.1.2] — 2026-06-26 · Today 홈

### Added
- Today 메인 뷰 (`components/today/today-view.tsx`)
  - 발리/서울 듀얼 라이브 시계 (Intl timeZone, 1초 틱)
  - 오늘 진행률 바 (완료/전체 할일)
  - universal capture — 빠른 할 일 추가 (Enter)
  - 오늘 일정 리스트 (캘린더 데이터 재사용) + 할 일 리스트 (낙관적 토글)
- `lib/today/queries.ts` (getTodos) · `lib/today/actions.ts` (createTodo/toggleTodo)
- 시드에 할 일 5건 추가 (마감 오늘/지남/없음/완료 케이스)

### Changed
- 캘린더 일정 CRUD 시 `/today`도 revalidate

---

## [정리] — 2026-06-26 · dead code 전수 정리

### Removed
- `backup_v1_2026-05-12.json` (archive 브랜치에 보존, 0 참조)
- `proxy.ts` — Next는 `middleware.ts`만 인식 → 실행 안 되는 no-op dead code (Phase 4에서 middleware로 재작성)
- `public/{file,globe,next,vercel,window}.svg` — Next 기본 스캐폴드 SVG, 0 참조
- 의존성 `@neondatabase/serverless` — SQLite 전환 후 미사용
- 진행현황 문서 동기화 (TODO/CHANGELOG ↔ 실제 코드)

---

## [v3.1.1] — 2026-06-25 · Calendar (구글캘린더 패리티)

### Added
- 캘린더 월/주/일 뷰 (`components/calendar/*`)
- 좌측 패널: 미니 월력 + 내 캘린더(개인·회사·할일) 색상 토글
- 일정 CRUD (서버 액션 `lib/calendar/actions.ts`) + 편집/삭제 다이얼로그
- 시간 그리드 현재시각 라인, 오늘 강조
- ICS 구독 피드 `/api/calendar/feed.ics` (아이폰 기본 캘린더/위젯 구독용)
- DB 레이어 `lib/db/*` (스키마 + 부트스트랩 + 시드)

### Changed
- **DB: Neon Postgres → SQLite** (better-sqlite3 + Drizzle). 별도 DB 서비스 불필요, toy2 셀프호스팅.
- 배포 전제: Vercel → toy2 (`next start`)
- `.env.example` / `.gitignore` SQLite 기준으로 정리

---

## [Phase 1 BEFORE_CODE] — 2026-05-25 · 스캐폴드 (commit b778dbe)

### Added
- Next.js 15.5.18 (App Router, Turbopack) + React 19.1 + TS 스캐폴드
- 디자인 시스템: `globals.css` Petals + Velvet Night 토큰 (4색 petal, light/dark, @theme inline)
- 타이포: Pretendard Variable (next/font/local) + Noto Serif KR
- Shell: theme-provider / theme-toggle (3-way) / sidebar (240↔60 collapse, ⌘1~⌘4·⌘K·⌘N) / top-bar
- 라우트: / → /today redirect, /today /calendar /tasks /pages placeholder
- 인증: `lib/auth/dev-session.ts` (EVE_DEV_USER_ID), `proxy.ts` (EVE_AUTH_ENABLED=false 우회)
- PWA: `public/manifest.json`

---

## [v3.1.0] — 2026-05-12

### Reset
- v1/v2 코드 전면 폐기 (영아 이사 결정)
- `archive/v1-v2-backup` 브랜치에 보존
- main 리셋 — 새 출발

### Added
- `KICK_OFF.md` (v3.1 최종 설계)
- `CLAUDE.md` (새 컨텍스트)
- 마크 방법론 7단계 명세

---

## 작성 규칙
각 작업 commit 후 이 파일 업데이트.
```
## [버전 또는 날짜]
### Added / Changed / Fixed / Removed
- 변경 내용
```
