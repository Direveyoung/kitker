# CLAUDE.md — eveworks v3.1 컨텍스트

> 새 세션 시작 시 **이 파일부터 읽기**. 다음은 KICK_OFF.md.

---

## 🎯 프로젝트

**eveworks** = 영아 이사(Eve, 김영아) 1인 워크스페이스.
노션 + 클릭업 + 구글캘린더 + 애플메모 통합. 1인 맞춤이라 70% 단순화.

- 레포: https://github.com/Direveyoung/eveworks
- 배포: https://eveworks.vercel.app
- 현재 버전: **v3.1** (v1, v2 폐기 — 2026-05-12)

---

## 👤 사용자

- **이름**: 김영아 (Eve, 이브)
- **클로드 별칭**: 클로이 (Chloé)
- **GitHub**: Direveyoung / pm.younga@gmail.com
- **환경**: 발리 원격근무 + 서울 팀 관리, Mac

---

## 🛠 기술 스택

```
Next.js 15 (App Router, Turbopack)
React 19 + TypeScript 5
Tailwind v4 + shadcn/ui (base-stone)
Pretendard Variable + Noto Serif KR + JetBrains Mono
Lexical 에디터 (블록 + 슬래시)
next-themes (Petals/Velvet/System 3-way)
SQLite (better-sqlite3) + Drizzle ORM   ← Neon 폐기, toy2 셀프호스팅, 별도 DB 서비스 X
toy2 셀프호스팅 (next start)   ← Vercel 폐기
PWA: next-pwa
Auth.js v5 — Phase 4에서 부활. Phase 1~3은 dev user 하드코딩
```

---

## 🎨 디자인 시스템

**Petals (라이트) + Velvet Night (다크)** 하이브리드.

- 라이트: 크림 페이퍼 + 4색 petal (yellow=일정 · pink=할일 · purple=메모 · blue=시집/완료)
- 다크: 미드나잇 + 샴페인 골드 액센트
- 토글: 사용자 수동 (라이트/다크/시스템 3-way), localStorage 저장

상세는 KICK_OFF.md "3단계 — 디자인 시스템" 참조.

---

## 🧱 아키텍처 핵심

- **모든 콘텐츠 = 메모(pages)** — 단일 테이블, parent_id로 무한 중첩
- **속성 토글**: `has_schedule`, `has_todo` 켜면 글로벌 뷰(Today/Calendar/Tasks)에 자동 노출
- **블록 에디터**: 본문은 `blocks JSONB` (paragraph/heading/todo/schedule/table/quote/code/divider/page_link)
- **글로벌 뷰 3개**: Today / Calendar / Tasks가 모든 메모를 가로지름

---

## 📐 마크 방법론 7단계

1. 컨셉 → 2. 아키텍처 → 3. 디자인 → 4. 데이터규칙 → 5. 환경셋업 → 6. 단계별개발 → 7. 검증배포

KICK_OFF.md에 1-7단계 모두 정리됨.

---

## 🚦 BEFORE_CODE / AFTER_CODE

**BEFORE_CODE**
- [ ] 관련 docs 다시 읽기
- [ ] 데이터 모델 확인
- [ ] 영향 받는 파일 목록 정리
- [ ] 마이그레이션 필요 여부 확인

**AFTER_CODE**
- [ ] 타입 에러 0
- [ ] 린트 에러 0
- [ ] 로컬 빌드 통과
- [ ] CHANGELOG.md 업데이트
- [ ] TODO.md 항목 체크
- [ ] 1폴더 1commit

---

## 📌 응답·코드 규칙

- 결론 먼저 + bullet 1줄
- 토큰 최적화, 중간보고 생략
- 코드는 **수정 부분만** 출력
- 설명·주석 최소화
- **확인질문 생략 바로 실행**
- 완료 멘트 생략
- 한국어 톤: 농담·유머 환영, 빠릿하게

---

## 🔐 보안

- `.env.local` 절대 commit X (`.gitignore` 포함)
- Anthropic API Key는 서버 라우트에서만 (Phase 2 Chloé)
- Phase 4까지 dev user 하드코딩 (`EVE_DEV_USER_ID`)
- 자격증명: 비밀번호 저장 X, 힌트만

---

## 📂 디렉토리 (예정)

```
eveworks/
├── app/
│   ├── (workspace)/{today,calendar,tasks,pages/[pageId]}/
│   ├── api/{pages,search,import}/
│   └── layout.tsx
├── components/{shell,editor,tree,properties,ui}/
├── lib/{db,auth,pages,search,utils}/
├── drizzle/0001_pages_init.sql
├── public/{manifest.json,sw.js,icons}
└── docs/
```

---

## 🌏 한글

- 검색: `pg_trgm` (Phase 1) → pgvector 하이브리드 (Phase 2)
- 폰트: Pretendard Variable
- 호칭: '영아 이사' (영어 'Eve'). "영아 씨" 금지

---

## 🎯 현재 단계

**Phase 1 진행 중** — Shell + 메모 트리 + Lexical 블록 에디터.
이전 v1, v2 코드는 `archive/v1-v2-backup` 브랜치에 보존됨.
