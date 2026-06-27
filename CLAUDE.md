# CLAUDE.md — Kitker 컨텍스트

> 새 세션은 **이 파일부터**. 현재상태=STATUS.md · 다음작업=HANDOFF.md · 배포=DEPLOY.md.

---

## 🎯 프로젝트
**Kitker** = 영아 이사(Eve, 김영아) 1인 업무·일정 관리 시스템. **본인 소유·자가호스팅** — 원하는 기능을 직접 넣는 게 핵심.
노션/클릭업/구글캘린더/애플메모에서 영감, 1인 맞춤 70% 단순화.

- 레포: https://github.com/Direveyoung/kitker
- 배포: toy02 셀프호스팅 → **calendar.kitker.com**(도메인 연결 대기) · 임시 trycloudflare URL로 가동중
- 외부연동 범위: **구글캘린더 + 이메일(Gmail/Outlook)** 만 (노션·ClickUp 안 함)

## 👤 사용자
- 김영아 (Eve/이브), 클로드 별칭 **클로이(Chloé)**, GitHub Direveyoung / pm.younga@gmail.com
- 발리 원격 + 서울 팀관리, Mac. 호칭 **'영아 이사'** ("영아 씨" 금지)

## 🛠 스택
```
Next.js 15 (App Router, Turbopack) + React 19 + TS5
Tailwind v4 / Pretendard + Noto Serif KR
Lexical 블록 에디터 (블록 6종 + 마크다운 단축 + 슬래시)
next-themes (Petals/Velvet/System 3-way)
SQLite(better-sqlite3) + Drizzle — 파일 1개, KITKER_DB_PATH
PWA: 수동 service worker(public/sw.js) — next-pwa 아님
웹푸시: web-push(VAPID)
클로이: @anthropic-ai/sdk, claude-opus-4-8 (서버 라우트 /api/chat)
인증: Phase 4까지 dev user 하드코딩(KITKER_DEV_USER_ID, KITKER_AUTH_ENABLED=false)
배포: toy02 + pm2(:3300) + Cloudflare Tunnel
```

## 🧱 아키텍처 핵심
- **모든 콘텐츠 = 메모(`pages`)** — 단일 테이블, `parent_id` 무한 중첩
- **속성 토글** `has_schedule`/`has_todo` 켜면 글로벌 뷰(Today/Calendar/Tasks) 자동 노출
- **본문 = `blocks` JSON** (paragraph/heading/todo/quote/code/divider). Lexical↔blocks 직렬화(`lib/pages/lexical-blocks.ts`)
- **글로벌 뷰 3개** Today/Calendar/Tasks가 모든 메모를 가로지름
- 검색: SQLite LIKE(제목+blocks). 추후 FTS 검토

## 🎨 디자인 — Petals(라이트)+Velvet Night(다크)
크림 페이퍼 + 4색 petal(yellow=일정·pink=할일·purple=메모·blue=시집/완료) / 다크는 미드나잇+골드. 3-way 토글(localStorage). **토큰 소스 = `app/globals.css`**.

## 📂 디렉토리
```
app/(workspace)/{today,calendar,tasks,pages,pages/[id]}/  + layout
app/api/{calendar/feed.ics, chat, push/{subscribe,test}}/
app/{offline,apple-icon,layout,globals.css}
components/{shell,calendar,today,tasks,pages,chloe,push,theme}/
lib/{db,auth,calendar,today,pages,search,capture,import,chloe,push}/
public/{manifest.json,sw.js,icon.svg,fonts}
```

## 🚦 BEFORE/AFTER_CODE
BEFORE: 관련 docs 확인 · 데이터모델 확인 · 영향 파일 정리
AFTER: 타입0 · 린트0 · 빌드통과 · CHANGELOG/TODO 갱신 · 의미단위 commit

## 📌 응답·코드 규칙
- 결론 먼저+bullet · 토큰 최적화 · 코드는 수정부분만 · 확인질문 생략 바로 실행 · 한국어, 빠릿/유머 OK

## 🔐 보안
- `.env.local` commit 금지 · API키/VAPID priv는 서버 .env에만 · 자격증명(토이02 SSH 등)은 ClickUp 문서, 코드/메모에 저장X

## 🎯 현재 단계
**Phase 1 완료.** Phase 2 진행: 클로이 챗 ✅ · 아웃룩 일정 스냅샷 임포트 ✅ · 웹푸시 알림 ✅.
**남음**: 도메인(calendar.kitker.com) · 구글캘린더 연동 · 이메일(Gmail/Outlook) 네이티브 · 클로이 ANTHROPIC_API_KEY. → **HANDOFF.md**
(v1/v2 코드는 `archive/v1-v2-backup` 브랜치 보존)
