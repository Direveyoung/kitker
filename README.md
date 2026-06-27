# 🌿 Kitker

> 영아 이사(Eve, 김영아)의 **1인 업무·일정 관리 시스템**. 본인 소유·자가호스팅.

## 핵심
- **Today 뷰가 메인** — 오늘의 일정·할일·시집·듀얼시계 한 화면
- **노션식 메모 트리 + Lexical 블록 에디터** — 무한 중첩, 슬래시/마크다운
- **메모 속성 토글** — 한 메모가 메모+일정+할일 동시 (글로벌 뷰 자동 노출)
- **클로이(Chloé)** AI 비서 · **웹푸시 알림** · 아웃룩 일정 연동
- 테마: Petals(라이트) + Velvet Night(다크)

## 스택
Next.js 15 · React 19 · TypeScript · Tailwind v4 · Lexical · SQLite(better-sqlite3)+Drizzle · web-push · @anthropic-ai/sdk · PWA · toy02 셀프호스팅(pm2 + Cloudflare Tunnel)

## 문서
- `CLAUDE.md` — 개발 컨텍스트 (세션 시작 시 먼저)
- `HANDOFF.md` — 다음 작업 (Cowork 인계)
- `STATUS.md` — 현재 상태 · `DEPLOY.md` — 배포 · `KICK_OFF.md` — 설계/방법론
- `CHANGELOG.md` · `TODO.md`

## 로컬 실행
```bash
git clone https://github.com/Direveyoung/kitker.git
cd kitker && cp .env.example .env.local   # 값 채우기
npm install && npm run dev
```

---
**소유자**: Direveyoung (pm.younga@gmail.com) · **라이선스**: Private
