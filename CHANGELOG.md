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

---

## 작성 규칙

각 작업 commit 후 이 파일 업데이트.
형식:
```
## [버전 또는 날짜]
### Added / Changed / Fixed / Removed
- 변경 내용
```
