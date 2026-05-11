# 🌿 eveworks

> Eve(김영아)의 개인 워크스페이스.
> "내 머릿속을 즉시 던질 수 있는 한 곳."

---

## 🎯 무엇

키베이스 허브(자사 업무 시스템)와 **완전히 분리된** 개인 전용 도구.
Inbox, Todo, Notes, Calendar, Projects, Reading, Journal, Budget, 클로이 챗(AI 에이전트) 통합.

## 👤 사용자

영아 이사 1인 (외부 비공개).

## 🛠 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **DB**: Supabase (Postgres + Auth + Storage)
- **호스팅**: Vercel
- **스타일**: Tailwind + shadcn/ui
- **에디터**: Lexical
- **AI**: Anthropic Claude API (Tool Use)
- **폰트**: Pretendard
- **모바일**: PWA (next-pwa)

## 📂 문서

- `KICK_OFF.md` — 코워크 첫 미션 (반드시 먼저 읽기)
- `CLAUDE.md` — Claude Code / 에이전트 개발 컨텍스트
- `docs/PRD.md` — 제품 요구사항 (전체)
- `docs/menu_features.md` — 메뉴 구조 + 기능 명세
- `docs/data_model.md` — DB 스키마 (Phase 1-3 전체)
- `TODO.md` — 진행 상황
- `CHANGELOG.md` — 변경 이력

## 🚀 빠른 시작

```bash
git clone https://github.com/Direveyoung/eveworks.git
cd eveworks
cp .env.example .env.local
# .env.local 값 채우기
npm install
npm run dev
```

## 📝 개발 워크플로우

1. 새 세션 시작 시 `CLAUDE.md` 읽기
2. `TODO.md`에서 다음 작업 확인
3. 작업 완료 시 `CHANGELOG.md` 업데이트
4. 1폴더 1commit 원칙

---

**소유자**: Direveyoung (pm.younga@gmail.com)
**라이선스**: Private
