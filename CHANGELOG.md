# 📝 CHANGELOG

## [Unreleased]

### Added
- 초기 문서 (README, CLAUDE.md, KICK_OFF.md)
- PRD v1.0, 메뉴구조 v2.0, 데이터모델 v2.0 (`docs/`)
- `.env.example`, `.gitignore`, `TODO.md`
- **Step 1**: Next.js 16 (Turbopack) + React 19 + TS 5 + Tailwind v4 스캐폴드
- Pretendard Variable 폰트 (dynamic-subset), next-themes 다크모드 (class strategy)
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/theme-provider.tsx`
- `type-check` npm 스크립트

### Changed
- 기술 스택 명세를 Next.js 14 → 16 / Tailwind 3 → 4로 갱신 (CLAUDE.md)

### Added (Step 2)
- shadcn/ui init: style=`base-nova` (Base UI 기반), baseColor=`zinc`, css-variables
- 컴포넌트: button, input, checkbox, dialog, dropdown-menu, sonner
- `components.json`, `lib/utils.ts`, `tw-animate-css`, `class-variance-authority`, `tailwind-merge`, `lucide-react`
- shadcn 4.x는 `toast`를 `sonner`로 통합 (toast 단독 추가 X)

### Changed (Step 3 — 스택 피벗)
- **Supabase → Neon Postgres + Auth.js v5 + Resend**로 전환 (Supabase free tier user-level 2개 한도 때문)
- `.env.example` 갱신: DATABASE_URL, AUTH_SECRET, AUTH_RESEND_KEY, AUTH_RESEND_FROM
- `docs/data_model.md` 헤더에 피벗 안내

### Added (Step 4 — DB)
- ORM: **Drizzle** (TS-first, Neon HTTP driver, snake_case 자동 변환)
- 의존성: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `tsx`
- `lib/db/schema.ts`: Auth.js 표준 4테이블(`user`, `account`, `session`, `verificationToken`) + `profiles` + `items`
- `lib/db/index.ts`: Drizzle client (`neon-http`, `snake_case` casing)
- `drizzle.config.ts`, `drizzle/0000_phase1_init.sql`
- pg_trgm extension + GIN 인덱스 (`items.body`, `items.title`) — 한글 검색
- `scripts/migrate.ts` (Neon Pool + drizzle-orm migrator)
- npm scripts: `db:generate`, `db:migrate`, `db:studio`

### Added (Step 5 — Auth)
- `auth.ts`: Auth.js v5 + DrizzleAdapter + Resend provider + database session
- `events.createUser`: 새 user 생성 시 `profiles` row 자동 insert
- `app/api/auth/[...nextauth]/route.ts`: GET/POST handlers
- `app/(auth)/login/page.tsx` + `actions.ts`: Magic Link form
- `proxy.ts` (Next 16 신규 컨벤션, 구 `middleware.ts`): 인증 보호 + 콜백 URL 처리

---

## 작성 규칙

각 작업 commit 후 이 파일 업데이트.
형식:
```
## [버전 또는 날짜]
### Added / Changed / Fixed / Removed
- 변경 내용
```
