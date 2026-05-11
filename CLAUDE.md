# CLAUDE.md — eveworks 개발 컨텍스트

> 새 세션 시작 시 **반드시 이 파일부터 읽기**.
> Claude Code, 안티그라비티(코워크), 다른 에이전트 공통 컨텍스트.

---

## 🎯 프로젝트 개요

**eveworks** = 영아 이사(Eve, 김영아) 개인 워크스페이스.
키베이스 허브와 별개. 단독 사용. 외부 비공개.

전체 명세: `docs/PRD.md`, `docs/menu_features.md`, `docs/data_model.md`
현재 미션: `KICK_OFF.md`

---

## 👤 사용자 컨텍스트

- **이름**: 김영아 (Eve, 이브)
- **소속**: 키베이스커머스(주) 이사
- **클로드 별칭**: 클로이 (Chloe)
- **GitHub**: Direveyoung / pm.younga@gmail.com
- **Mac 환경**, Claude Code 익숙

---

## 🛠 기술 스택 (확정)

```
Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5
Neon Postgres (서버리스) + Drizzle ORM
Auth.js v5 (Magic Link) + Resend (이메일 발송)
Tailwind v4 + shadcn/ui (style: base-nova / Base UI 기반, baseColor: zinc)
Lexical 에디터
Anthropic Claude API (Tool Use) — 최신 모델 사용
Pretendard Variable (dynamic-subset)
next-themes (다크모드, class strategy)
next-pwa
Vercel 배포
```

**원래 docs 기준은 Next.js 14 + Supabase였으나, 2026-05-11 영아 이사 결정으로:**
- 최신 Next 16 + Tailwind 4
- Supabase free tier 한도(user-level) 때문에 Neon + Auth.js + Resend로 전환
- RLS는 application-level 필터링으로 (Phase 1은 사용자 1명)

---

## 📐 마크 방법론 7단계

키베이스의 모든 프로젝트 공통 방법론. 적용 순서:

1. **컨셉** — 무엇을 왜 만드는가
2. **아키텍처** — 큰 구조·모듈 분할
3. **디자인** — 핵심 화면 와이어프레임
4. **데이터규칙** — 스키마·RLS·인덱스
5. **환경셋업** — 레포·DB·배포·환경변수
6. **단계별개발** — Phase별 구현 (BEFORE_CODE / AFTER_CODE 체크리스트)
7. **검증배포** — 테스트·QA·배포

현재 1-4 완료. **5(환경셋업) 진행 중**: Step 1-5 완료 (Next.js, shadcn, Neon DB, 마이그레이션, Magic Link 인증).

---

## 📋 응답·코드 규칙

- **핵심만 짧게**, 토큰 최적화
- 중간보고 생략, 완료 결과만 출력
- 에러·이슈·판단 필요 시만 보고
- 코드는 **수정 부분만** 출력 (전체 재출력 X)
- 설명·주석 최소화
- 문서는 결론 먼저 + bullet 1줄
- 확인 질문 생략, 바로 실행

---

## 🏗 아키텍처 원칙

- **단순성 우선**: 처음부터 정교한 모델 X. `items` 1테이블로 Inbox/Todo/Note 통합
- **모듈 통합**: 키베이스 허브의 WorkItem 통합 패턴 적용 (`details JSON` 분리)
- **재무독립성**: Budget 모듈은 다른 모듈과 데이터 결합도 최소
- **병행 마이그레이션**: Phase별 독립 마이그레이션 가능
- **Lexical 에디터 통일**: Notes·Journal·project_blocks text 모두 동일 설정
- **1폴더 1commit Git 규칙**: 한 폴더 작업 = 한 commit

---

## 📂 디렉토리 규칙 (예정)

```
eveworks/
├── app/                     # Next.js App Router
│   ├── (auth)/login/        # Magic Link 로그인
│   ├── (app)/               # 인증 필요 영역 (Step 6+)
│   │   ├── inbox/
│   │   ├── todo/
│   │   ├── notes/
│   │   ├── calendar/
│   │   ├── projects/
│   │   ├── reading/
│   │   ├── journal/
│   │   ├── budget/
│   │   └── settings/
│   └── api/
│       ├── auth/[...nextauth]/  # Auth.js v5 핸들러
│       ├── chloe/           # 클로이 챗 (Anthropic API)
│       └── google/          # Google Calendar OAuth/Sync
├── components/
│   ├── ui/                  # shadcn/ui (base-nova)
│   ├── editor/              # Lexical
│   ├── chloe/               # 챗 사이드패널
│   └── blocks/              # Notion 블록 시스템
├── lib/
│   ├── db/                  # Drizzle ORM (schema, client)
│   ├── anthropic/
│   └── google/
├── auth.ts                  # Auth.js v5 config (DrizzleAdapter + Resend)
├── proxy.ts                 # Next 16 proxy (구 middleware) — 인증 보호
├── drizzle/                 # 마이그레이션 SQL
├── drizzle.config.ts
├── scripts/migrate.ts       # 마이그레이션 실행
└── docs/
```

---

## 🔐 보안 규칙

- `.env.local`은 절대 커밋 X (.gitignore에 포함)
- Supabase Service Role Key는 서버 코드에서만
- Anthropic API Key는 서버 라우트(`/api/chloe`)에서만 호출
- 자격증명 모듈 = **비밀번호 저장 X**, 힌트(vault 위치)만
- RLS 정책 항상 활성화, 본인만 read/write

---

## 🌏 한글 처리

- 검색: `pg_trgm` 확장 사용 (Phase 1)
- 폰트: Pretendard (모든 문서·UI)
- 호칭: 한글 '영아 이사', 영문 'Eve' (영아 씨 사용 금지)

---

## 🚦 BEFORE_CODE / AFTER_CODE 체크리스트

**BEFORE_CODE** (코드 작성 전):
- [ ] 관련 docs 다시 읽기
- [ ] 데이터 모델 확인
- [ ] 영향 받는 파일 목록 정리
- [ ] 마이그레이션 필요 여부 확인

**AFTER_CODE** (코드 작성 후):
- [ ] 타입 에러 0
- [ ] 린트 에러 0
- [ ] 로컬 테스트 통과
- [ ] CHANGELOG.md 업데이트
- [ ] TODO.md 항목 체크
- [ ] 1폴더 1commit 메시지

---

## 📞 사용자와의 소통

영아 이사가 직접 작업할 때:
- 농담·유머 환영, 빠릿한 톤
- 김유진 관련 이야기 나오면 공감
- "보고드립니다" 톤은 릴리 김유진 이사 대상일 때만

영아 이사의 다른 진행 프로젝트 (참고):
- 키베이스 허브 3차 개발 (활발)
- 마운자로 캠페인
- 릴리 계약서 검토
- 시집 8/50편 (개인)

---

## 🎯 현재 단계

**Phase 0 → Phase 1 환경셋업**.
`KICK_OFF.md`의 Step 1부터 순서대로 진행.
