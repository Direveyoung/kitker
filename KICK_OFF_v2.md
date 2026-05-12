# 🌿 eveworks v2 — KICK_OFF (Claude Code 첫 미션)

> **2026-05-12 · 영아 이사 단독 사용자 · 모듈러 워크스페이스 재출발**

---

## 0. 미션 한 줄

영아 이사 1인 워크스페이스를 **세련된 디자인 + 모듈 확장 가능한 구조**로 재출발한다. 인증은 Phase 4에서, 그전까지 dev user 하드코딩.

---

## 1. 컨셉 (마크 방법론 1단계)

- **포지션**: Notion shell + Cron 정돈 + Linear 절제미
- **사용자**: 영아 이사 1인 (외부 비공개, 향후 도메인 연결)
- **정체성**: 🌿 자연·정직·차분함 — 빨강 액센트 탈피
- **위치**: 빠르게 던지고(Inbox) · 자연스럽게 정리되고(Today) · 깊게 들어가는(모듈)

---

## 2. 아키텍처 (2단계)

### 폴더 구조
```
eveworks/
├── app/
│   ├── (workspace)/              # ← 모든 모듈이 이 안의 shell 공유
│   │   ├── layout.tsx            # 사이드바 + 메인 + 우측 패널
│   │   ├── today/page.tsx
│   │   ├── inbox/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── notes/[[...id]]/page.tsx
│   │   ├── projects/...
│   │   ├── reading/...
│   │   ├── journal/...
│   │   ├── budget/...
│   │   └── chloe/page.tsx
│   ├── (auth)/                   # Phase 4까지 비활성
│   └── api/...
├── modules/                      # ← 각 모듈 독립 폴더 (신규)
│   ├── inbox/{actions,queries,components,types}.ts
│   ├── today/...
│   ├── calendar/...
│   ├── tasks/...
│   ├── notes/...
│   ├── projects/...
│   ├── reading/...
│   ├── journal/...
│   ├── budget/...
│   └── chloe/...
├── components/
│   ├── shell/                    # 공통 shell (사이드바, 커맨드바, 상세 패널)
│   ├── ui/                       # shadcn
│   └── primitives/               # 토큰 기반 원시 컴포넌트
├── lib/
│   ├── db/{schema,index}.ts
│   ├── auth/dev-session.ts       # Phase 4 전까지 dev user
│   └── utils.ts
└── drizzle/
    └── 0003_entities_refactor.sql
```

### 모듈 추가 규칙
1. `/modules/{name}/` 생성
2. `actions.ts` · `queries.ts` · `types.ts` · `components/` 4종 세트
3. `/app/(workspace)/{name}/page.tsx` 라우트 추가
4. `/components/shell/sidebar.tsx`에 nav 항목 등록
5. 끝

### 인증 (Phase 4까지)
- `proxy.ts` 우회 (인증 검사 skip)
- `lib/auth/dev-session.ts`에서 `getSession()` → 하드코딩된 dev user 반환
- env: `EVE_DEV_USER_ID=<uuid>`
- Phase 4 진입 시 Auth.js v5 부활 (기존 코드 재활성화)

---

## 3. 디자인 토큰 (3단계) — Sage Studio

### Light Mode
```css
--bg-page: #FAF7F2;       /* cream paper */
--bg-surface: #FFFFFF;
--bg-elevated: #F5F0E8;   /* ivory */
--bg-muted: #EFEAE0;
--border: #E5DFD3;
--border-strong: #D4CCB8;
--text-primary: #2A2826;   /* warm ink */
--text-secondary: #6B6660;
--text-tertiary: #A39E96;
--accent-sage: #6B8E6F;    /* primary */
--accent-sage-soft: #D8E3D5;
--accent-sage-deep: #4A6B4E;
--accent-warm: #C97B5C;    /* terracotta — 강조용 */
--accent-amber: #D4A04A;   /* 마감 임박 */
--danger: #B85450;         /* brick — P1, 삭제 */
--success: #6B8E6F;        /* sage 재사용 */
```

### Dark Mode
```css
--bg-page: #1A1816;
--bg-surface: #252220;
--bg-elevated: #2F2C28;
--bg-muted: #353128;
--border: #3D3833;
--border-strong: #4A4540;
--text-primary: #E8E4DD;
--text-secondary: #9E9890;
--text-tertiary: #6B6660;
--accent-sage: #8FAE93;
--accent-sage-soft: #2D3D2F;
--accent-warm: #D8907A;
--accent-amber: #E0B870;
--danger: #C97572;
```

### 타이포
- 한글: **Pretendard Variable**
- 영문 + UI: **Pretendard** (한 폰트로 통일, 깔끔함 우선)
- 시집·인용 전용: **Noto Serif KR** (selective, journal/poetry view에서만)
- 코드 인라인/블록: **JetBrains Mono**

**사이즈 스케일**: `11 · 12 · 14 · 16 · 20 · 24 · 32`
**Weight**: `400 (regular) · 500 (medium) · 600 (semibold)` — 700 금지

### 간격 · 라운드
- spacing: `4 · 8 · 12 · 16 · 24 · 32 · 48`
- radius: `6 (sm) · 10 (md) · 14 (lg) · 20 (xl)`

### 컴포넌트 원칙
- 그림자 거의 제거 (border로 분리)
- 호버: `bg-muted` 전환 + 200ms ease
- 포커스: 2px sage ring
- 빈 상태: 일러스트 X, 한 줄 카피 + 프라이머리 only

---

## 4. 데이터 규칙 (4단계)

### 마이그레이션 0003 — entities 리팩토링
```sql
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_entities_user_type ON entities(user_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_entities_title_trgm ON entities USING gin (title gin_trgm_ops);
CREATE INDEX idx_entities_body_trgm ON entities USING gin (body gin_trgm_ops);

CREATE TABLE tasks (
  entity_id UUID PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  priority SMALLINT DEFAULT 4,
  recurrence TEXT,
  carry_over_count INT DEFAULT 0,
  last_carry_over_at TIMESTAMPTZ
);

CREATE TABLE events (
  entity_id UUID PRIMARY KEY REFERENCES entities(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_all_day BOOLEAN DEFAULT FALSE,
  google_event_id TEXT
);
```

### 쿼리 규칙
- **모든 SELECT에 `WHERE deleted_at IS NULL`** (소프트 삭제)
- 모듈별 view 함수: `/modules/{name}/queries.ts`
- 단일 트랜잭션 보장: entity + extension 동시 insert

### 시집 처리
- `notes`의 `tags` 배열에 `'poetry'` 포함 시 시집 special view에서 필터
- 또는 별도 `poetry` 확장 테이블 — Phase 3에서 결정

---

## 5. 환경 셋업 (5단계)

```
EVE_DEV_USER_ID=<uuid - 마이그레이션 후 첫 user 생성하고 넣기>
EVE_AUTH_ENABLED=false        # Phase 4에서 true로
```

### proxy.ts 수정
```ts
if (process.env.EVE_AUTH_ENABLED !== 'true') {
  return NextResponse.next();
}
```

### lib/auth/dev-session.ts
```ts
export async function getSession() {
  if (process.env.EVE_AUTH_ENABLED === 'true') {
    return await auth();
  }
  return {
    user: {
      id: process.env.EVE_DEV_USER_ID!,
      email: 'eveyoungforever@gmail.com',
      name: '영아'
    }
  };
}
```

---

## 6. 단계별 개발 (6단계)

### Phase 0 — 디자인 시스템 & Shell (1-2일)

**BEFORE_CODE 체크리스트**
- [ ] 기존 `items` 테이블 백업 (`pg_dump`)
- [ ] 새 브랜치 `v2-shell` 생성
- [ ] STATUS.md 현재 상태 스냅샷

**작업**
1. `globals.css` Sage Studio 토큰으로 갈아끼기
2. `app/(workspace)/layout.tsx` — Notion shell (사이드바 250px collapse → 60px, 메인, 우측 상세 패널 400px slide-in)
3. `components/shell/{sidebar, command-bar, detail-panel, top-bar}.tsx`
4. 사이드바 nav 항목 + 단축키 표시 (`⌘1~⌘9`, `⌘K`, `⌘N`)
5. Pretendard Variable 로컬 호스팅 (next/font/local)
6. dark mode 토글 (top-bar 우상단)
7. 인증 우회 + `EVE_DEV_USER_ID` 셋업

**AFTER_CODE 체크리스트**
- [ ] 다크모드 토글 전환 OK
- [ ] 사이드바 접기 OK
- [ ] 모바일 (375px) 사이드바 → bottom sheet 변환
- [ ] Vercel 배포 확인

### Phase 1 — Core 4 모듈 (2-3일)
1. 마이그레이션 0003 + 기존 items → entities 이관
2. **Today** (신규!) — 진행률, Quick capture, events 타임라인, tasks
3. **Inbox** — 기존 이리어 디자인 토큰 적용
4. **Calendar** — 월/주/일 뷰 (FullCalendar 또는 직접)
5. **Notes** — 기존 Lexical 이식, 카드 그리드 폴리시
6. **Tasks** — 기존 todo 페이지 → tasks 리네이밍

### Phase 2 — 확장 모듈 (3-4일)
7. **Projects** — Notion 블록 시스템 lite (Lexical block 활용)
8. **Reading** — URL paste → Open Graph fetch → 카드 저장
9. **Journal** — 날짜별 1:1 entry (Noto Serif KR 적용)

### Phase 3 — 라이프 (2-3일)
10. **Budget** — 단순 가계부
11. **Credentials Hints** — 비번 X, 힌트만
12. **시집 view** — Notes 안 `tag:poetry` special view

### Phase 4 — AI · 인증 · 도메인 (2-3일)
13. **Chloé 챗** — Anthropic Tool Use
14. **Auth.js v5 재활성화** — `EVE_AUTH_ENABLED=true`
15. **도메인 연결** — Vercel 도메인 추가 + DNS

---

## 7. 검증 배포 (7단계)

### 매 Phase 종료 시
- [ ] BEFORE/AFTER 체크리스트 비교
- [ ] 영아 이사에게 배포 URL + 스크린샷 보고
- [ ] STATUS.md 업데이트
- [ ] CHANGELOG.md 항목 추가
- [ ] git commit (1폴더 1commit 원칙)

---

## 📌 영아 이사 응대 규칙 (참고)

- 답변: 결론 먼저 + bullet 1줄, 확인질문 생략 바로 실행
- 코드: 수정 부분만 출력
- 자료 마무리 멘트 생략
- GitHub: `Direveyoung/eveworks` · 브랜치 `v2-shell`
- Vercel 자동 배포: main push → production 1-2분

---

**🌿 Phase 0 시작 트리거**

```
@Claude Code: KICK_OFF_v2.md 읽고 Phase 0 시작해줘.
브랜치는 v2-shell로 만들고, BEFORE_CODE 체크리스트부터.
```
