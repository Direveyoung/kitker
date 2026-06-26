# 📝 CHANGELOG

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
