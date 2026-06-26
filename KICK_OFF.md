# 🌿 kitker v3.1 — KICK_OFF (최종 설계)

> **2026-05-12 · 영아 이사 1인 맞춤형 워크스페이스 · 마크 방법론 적용**
> **테마: Petals (라이트) + Velvet Night (다크) 하이브리드 · 수동 전환 가능**
>
> 레포: https://github.com/Direveyoung/kitker
> 배포: https://calendar.kitker.com (toy2 셀프호스팅)

---

## ⚠️ Step 0 — 가장 먼저: 기존 개발 내용 전부 삭제

**기존 v1/v2 코드와 UI는 모두 폐기한다. 영아 이사 결정.**

### 삭제 절차
```bash
# 1. 기존 main 백업
git checkout main
git branch archive/v1-v2-backup
git push origin archive/v1-v2-backup

# 2. main 리셋
git checkout main
git rm -rf .
git commit -m "chore: reset for v3 — discard v1/v2"

# 3. DB 초기화 (Neon 콘솔에서 기존 DB 삭제 후 재생성)

# 4. Vercel 환경변수 점검 후 v3 기준 재설정
```

**완전 새로 시작**. 기존 코드 한 줄도 재활용 X.

---

## 🎯 미션 한 줄

**나만의 노션 + 클릭업 + 구글캘린더 + 애플메모 통합 워크스페이스.** 영아 이사 1인 전용. 업무 중심 출발. 노션 구조 차용, 1인 맞춤이라 70% 단순화.

---

## 1단계 — 컨셉 & 요구사항

### 사용자
- 영아 이사 1인
- 발리 원격근무 + 서울 팀 관리
- 클라이언트 다중 (사용자가 직접 폴더 생성)

### 핵심 차별화 3가지
1. **Today 뷰가 메인** — 모든 메모의 오늘자 일정·할일·시집 한 줄·키베이스 컨텍스트가 한 화면
2. **노션식 메모 트리 + 블록 에디터** — 자유롭게 폴더 만들고 무한 중첩
3. **메모 속성으로 일정/할일 토글** — 한 메모가 메모+일정+할일 동시에 가능

### 4가지 원칙
1. 모든 콘텐츠는 메모
2. 메모는 일정·할일 속성을 켤 수 있다 → 글로벌 뷰 자동 노출
3. 메모 본문은 블록 에디터 + 슬래시 명령
4. 글로벌 뷰 3개(Today/Calendar/할 일)가 모든 메모를 가로지른다

### 안 만드는 것 (절약 70%)
팀 협업, 권한, 결제, 다국어, 백오피스, 마케팅, 손글씨, 100+ 임베드

---

## 2단계 — 아키텍처 & 시스템 설계

### 기술 스택
```
Next.js 15 (App Router, Turbopack)   ← Next 16 RC 폐기, 안정 LTS
React 19 + TypeScript 5
Tailwind v4 + shadcn/ui (base-stone)
Pretendard Variable (next/font/local)
Noto Serif KR (시집 view용)
Lexical 에디터 (블록 + 슬래시)
next-themes (테마 토글 + localStorage)
Neon Postgres + Drizzle ORM
Vercel 배포
PWA: next-pwa + service worker
```

Auth.js는 Phase 4에서 추가. Phase 1~3은 dev user 하드코딩.

### 폴더 구조
```
kitker/
├── app/
│   ├── (workspace)/
│   │   ├── layout.tsx              # 사이드바 + 메인 + 우측 패널
│   │   ├── today/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── tasks/page.tsx
│   │   └── pages/[pageId]/page.tsx
│   ├── api/{pages,search,import}/route.ts
│   └── layout.tsx                  # ThemeProvider 래핑
├── components/
│   ├── shell/
│   │   ├── sidebar.tsx
│   │   ├── command-bar.tsx
│   │   ├── top-bar.tsx
│   │   └── theme-toggle.tsx        # 라이트/다크/시스템 3-way
│   ├── editor/
│   │   ├── editor.tsx
│   │   ├── blocks/{heading,todo,schedule,table,quote,code,divider}.tsx
│   │   └── slash-menu.tsx
│   ├── tree/                       # 메모 트리
│   ├── properties/                 # 메모 상단 속성 패널
│   └── ui/                         # shadcn
├── lib/
│   ├── db/{schema,index}.ts
│   ├── auth/dev-session.ts
│   ├── pages/{actions,queries,tree,import-md,version}.ts
│   ├── search/trgm.ts
│   └── utils.ts
├── drizzle/0001_pages_init.sql
├── public/{manifest.json,sw.js,icon-192.png,icon-512.png}
├── docs/{design-system,data-model,conventions}.md
├── CLAUDE.md
├── CHANGELOG.md
├── TODO.md
├── KICK_OFF.md (이 문서)
└── README.md
```

---

## 3단계 — 디자인 시스템 (Petals + Velvet Night 하이브리드)

### 컨셉
- **낮 = Petals** — 파스텔 멀티 (연노랑/연핑크/연보라/연하늘), 발리 아침의 부드러움
- **밤 = Velvet Night** — 네이비 + 샴페인 골드, 발리 밤의 세련됨
- **전환**: 시스템 자동 (기본) · 영아 이사가 수동 오버라이드 가능
- 상태는 localStorage에 저장

### globals.css 토큰

```css
/* ─────────────────────────────────────────────── */
/*  Light · Petals                                */
/* ─────────────────────────────────────────────── */
:root, html.light {
  /* 베이스 */
  --bg-page: #FAF7F2;          /* 크림 페이퍼 */
  --bg-surface: #FFFFFF;
  --bg-elevated: #F9F6EF;
  --bg-muted: #F0EDE5;
  --border: #E5DFD3;
  --border-strong: #D4CCB8;
  --text-primary: #2A2826;     /* warm ink */
  --text-secondary: #6B6660;
  --text-tertiary: #A39E96;

  /* Petals 멀티 (영역별 정체성) */
  --petal-yellow-bg: #FBF4D9;  /* 일정 (Calendar) */
  --petal-yellow-text: #6B5A1A;
  --petal-yellow-accent: #C9A227;

  --petal-pink-bg: #FCE4EC;    /* 할 일 (Tasks) */
  --petal-pink-text: #7A2D4D;
  --petal-pink-accent: #C25577;

  --petal-purple-bg: #E8E0F4;  /* 메모 (Pages) */
  --petal-purple-text: #3D2E66;
  --petal-purple-accent: #7B66B5;

  --petal-blue-bg: #DCEDF7;    /* 시집·완료 */
  --petal-blue-text: #1F5C85;
  --petal-blue-accent: #5C8DB5;

  /* 액션 컬러 */
  --accent: #7B66B5;           /* 라벤더 (primary) */
  --accent-soft: #E8E0F4;
  --accent-deep: #5E4A8C;
  --warm: #C97B5C;             /* terracotta */
  --amber: #D4A04A;            /* 마감 임박 */
  --danger: #C25577;           /* P1 */
  --success: #7BA68E;
}

/* ─────────────────────────────────────────────── */
/*  Dark · Velvet Night                           */
/* ─────────────────────────────────────────────── */
html.dark {
  /* 베이스 */
  --bg-page: #0F1419;          /* 미드나잇 */
  --bg-surface: #1A1F2A;
  --bg-elevated: #242938;
  --bg-muted: #2A2F3A;
  --border: #2A2F3A;
  --border-strong: #3D4453;
  --text-primary: #E8E4DD;     /* warm cream */
  --text-secondary: #9CA3AF;
  --text-tertiary: #7A8499;

  /* Petals 다크 버전 (채도 낮춤) */
  --petal-yellow-bg: #2E2A1C;
  --petal-yellow-text: #E8D894;
  --petal-yellow-accent: #D4B896;

  --petal-pink-bg: #2E1F26;
  --petal-pink-text: #E8B3CC;
  --petal-pink-accent: #C58FAB;

  --petal-purple-bg: #25204D;  /* 다크 인디고 */
  --petal-purple-text: #C9C0E8;
  --petal-purple-accent: #9F8FD4;

  --petal-blue-bg: #1A2A3D;
  --petal-blue-text: #B3D4E8;
  --petal-blue-accent: #8FAEC9;

  /* 액션 컬러 */
  --accent: #D4B896;           /* 샴페인 골드 (primary) */
  --accent-soft: #2A2519;
  --accent-deep: #B89977;
  --warm: #C97B5C;
  --amber: #D4A04A;
  --danger: #E5837F;
  --success: #8FAEC9;
}
```

### 타이포
- 본문: **Pretendard Variable**
- 시집/인용: **Noto Serif KR** (Today 시집 한 줄 + 시집 view에서만)
- 코드: **JetBrains Mono**
- 사이즈: `11 · 12 · 14 · 16 · 20 · 24 · 32`
- Weight: `400 / 500 / 600` (700 금지)

### 간격 · 라운드
- spacing: `4 · 8 · 12 · 16 · 24 · 32 · 48`
- radius: `6(sm) · 10(md) · 14(lg) · 20(xl)`

### 컴포넌트 원칙
- 그림자 거의 안 씀 (border로 분리)
- 호버: bg-muted 전환 + 200ms ease
- 포커스: 2px accent ring
- 빈 상태: 일러스트 X, 한 줄 카피 + 행동 유도

### 컬러 사용 가이드
- **일정 관련 요소** → petal-yellow
- **할 일 관련 요소** → petal-pink (P1/P2는 강조 액센트)
- **메모/페이지 UI** → petal-purple
- **시집·완료·정보** → petal-blue
- 영역별로 컬러 일관성 유지. 무지개 만들지 말 것.

### 테마 토글 구현

#### app/layout.tsx
```tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="kitker-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### components/shell/theme-toggle.tsx
```tsx
'use client';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const modes = [
    { value: 'light', icon: Sun, label: 'Petals' },
    { value: 'dark', icon: Moon, label: 'Velvet' },
    { value: 'system', icon: Monitor, label: '자동' },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5 bg-[var(--bg-surface)]">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          className={`
            flex items-center justify-center w-7 h-7 rounded-[6px]
            transition-colors duration-200
            ${theme === value
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)]'}
          `}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
```

토글은 **top-bar 우상단**에 배치. 영아 이사가 1탭으로 라이트/다크/자동 순환 가능.

---

## 4단계 — 데이터 규칙 & 엣지 케이스

### 마이그레이션 0001
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '제목 없음',
  icon TEXT,
  cover TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_schedule BOOLEAN NOT NULL DEFAULT FALSE,
  schedule JSONB,                          -- {starts_at, ends_at, all_day, location, recurrence}
  has_todo BOOLEAN NOT NULL DEFAULT FALSE,
  todo JSONB,                              -- {completed, completed_at, due_at, priority, carry_over_count}
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  order_index DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_pages_user_parent ON pages(user_id, parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_schedule ON pages(user_id, has_schedule) WHERE deleted_at IS NULL AND has_schedule = TRUE;
CREATE INDEX idx_pages_todo ON pages(user_id, has_todo) WHERE deleted_at IS NULL AND has_todo = TRUE;
CREATE INDEX idx_pages_title_trgm ON pages USING gin (title gin_trgm_ops);
CREATE INDEX idx_pages_blocks_gin ON pages USING gin (blocks);
CREATE INDEX idx_pages_tags ON pages USING gin (tags);

-- 버전 스냅샷 (실수 대비 안전망, 30일 보관)
CREATE TABLE page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  blocks JSONB NOT NULL,
  schedule JSONB,
  todo JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_page_versions_page ON page_versions(page_id, created_at DESC);
```

### 트리 정렬: Fractional Indexing
- `order_index`는 0.0~1.0 실수
- 새 항목 삽입: 앞뒤 평균값
- 충돌 시 형제 전체 재정렬

### 블록 JSONB
```typescript
type Block =
  | { type: 'paragraph'; text: RichText }
  | { type: 'heading'; level: 1|2|3; text: RichText }
  | { type: 'todo'; items: { text: RichText; checked: boolean }[] }
  | { type: 'schedule'; starts_at: string; ends_at?: string; all_day?: boolean }
  | { type: 'table'; rows: RichText[][] }
  | { type: 'quote'; text: RichText }
  | { type: 'code'; language: string; code: string }
  | { type: 'divider' }
  | { type: 'page_link'; page_id: string }
  | { type: 'database'; filter: any; sort: any }  // Phase 2
```

### 엣지 케이스
- **순환 참조 방지**: parent_id 설정 시 자기 자신 또는 자손이면 거부
- **고아 페이지 방지**: parent 삭제 시 CASCADE soft delete
- **빈 메모 자동 삭제**: 5분 idle + 빈 상태면 자동 삭제
- **carry-over**: Today 진입 시 idempotent
- **버전 스냅샷**: blocks 변경 5분 debounce

---

## 5단계 — 개발환경 셋업

### .env.local
```
DATABASE_URL=<Neon connection string>
KITKER_DEV_USER_ID=00000000-0000-0000-0000-000000000001
KITKER_AUTH_ENABLED=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### lib/auth/dev-session.ts
```typescript
export async function getSession() {
  if (process.env.KITKER_AUTH_ENABLED === 'true') return await auth();
  return {
    user: {
      id: process.env.KITKER_DEV_USER_ID!,
      email: 'eveyoungforever@gmail.com',
      name: '영아'
    }
  };
}
```

### PWA 셋업 (Phase 1 필수)
- `public/manifest.json` — theme_color는 라이트/다크 둘 다 정의
- `public/sw.js` (Workbox)
- 아이콘 192/512 + Apple touch icon

---

## 6단계 — Phase별 개발

### Phase 1 — 핵심 화면 + 메모 시스템 (4~6일)

**BEFORE_CODE 체크리스트**
- [ ] Step 0 (기존 코드 삭제) 완료
- [ ] 새 main 브랜치
- [ ] CLAUDE.md, CHANGELOG.md, TODO.md 초기 작성
- [ ] globals.css에 Petals + Velvet Night 토큰 적용
- [ ] next-themes 설치 + ThemeProvider 셋업
- [ ] PWA 셋업

**개발 순서**
1. **Shell + 테마 토글** — 사이드바, top-bar(테마 토글 우상단), 메인, 우측 패널
2. **메모 트리** — 중첩 표시, 펼치기/접기, 드래그 정렬, 새 메모/하위 메모, 삭제, 이름·아이콘 변경
3. **메모 에디터 (Lexical)** — 슬래시 명령 메뉴, 블록 10종, 1초 debounce 자동 저장, 5분 debounce 버전 스냅샷
4. **메모 속성 패널** — 일정/할일 토글 UI (속성 ON → 글로벌 뷰 자동 노출)
5. **Today** — 날짜 + 발리/서울 듀얼 시계 + 진행률 + 시집 한 줄(랜덤) + 오늘 일정(petal-yellow) + 오늘 할 일(petal-pink) + universal capture(⌘N)
6. **Calendar** — 월/주/일 뷰, has_schedule 메모 전체, petal-yellow 베이스
7. **할 일** — has_todo 메모 전체, 멀티뷰(리스트/보드/캘린더), petal-pink 베이스
8. **검색 (⌘K)** — pg_trgm, 한글 지원
9. **캡처 (⌘N)** — 자연어 인식 ("내일 14시 회의" → schedule 자동 ON)
10. **마크다운 임포트** — 기존 노션/애플메모 export
11. **PWA 완성** — 오프라인 fallback, 홈화면 추가

**AFTER_CODE 체크리스트**
- [ ] iPhone 13 Safari 정상
- [ ] 라이트/다크/시스템 3-way 토글 정상
- [ ] localStorage에 테마 저장 (새로고침 후 유지)
- [ ] 메모 100개 시드 후 검색 100ms 이내
- [ ] PWA 홈화면 추가 가능
- [ ] Vercel 배포 완료
- [ ] STATUS.md 업데이트
- [ ] CHANGELOG.md "v3.1.0 Phase 1 완료"

### Phase 2 — 외부 연동 + 자동화 (3~5일)
12. ClickUp 동기화 (양방향, cron 30분)
13. 구글 캘린더 동기화 (양방향 OAuth)
14. 클로이 챗 (Anthropic Tool Use, 사이드바 상주)
15. 시멘틱 검색 (pgvector + 하이브리드)
16. 노션 DB view (filter/sort/group)
17. 메일 통합 검토

### Phase 3 — 라이프 + 시집 (2~4일)
18. 시집 special view (Noto Serif KR, A/B/C안 3컬럼)
19. Journal (날짜별 1:1 + 자동 요약)
20. Budget (transaction 형식 메모)
21. Reading (URL paste + OG)

### Phase 4 — 인증 + 도메인 (1~2일)
22. Auth.js v5 부활 (Resend Magic Link)
23. KITKER_AUTH_ENABLED=true 전환
24. 도메인 연결 (Vercel + DNS)

---

## 7단계 — 검증 & 배포

### 매 Phase 종료 시
- [ ] BEFORE/AFTER 체크리스트 대조
- [ ] 영아 이사에게 배포 URL + 라이트/다크 스크린샷 2장 보고
- [ ] STATUS.md 업데이트
- [ ] CHANGELOG.md 항목 추가
- [ ] git commit (1폴더 1commit)

### 트리거 문장
```
# 새 세션
KICK_OFF.md 읽고 Step 0(기존 코드 삭제)부터.
삭제 후 Phase 1 BEFORE_CODE 진행.

# 다음 Phase
Phase 1 완료. Phase 2 시작해줘.

# 점검
현재 진행 상황 STATUS.md에 정리해줘.
```

---

## 📌 영아 이사 운영 규칙

### 답변 스타일
- 결론 먼저 + bullet 1줄
- 토큰 최적화, 중간보고 생략
- 코드는 수정 부분만
- 설명·주석 최소화
- 확인질문 생략 바로 실행
- 완료 멘트 생략

### 문서
- CLAUDE.md 500줄 이하
- CHANGELOG.md 매 Phase 종료
- TODO.md 다음 작업
- 새 세션은 CLAUDE.md부터

### Git
- GitHub: Direveyoung/kitker
- 1폴더 1commit
- main push → Vercel 자동 배포 1~2분

---

**🌿 영아 이사가 만드는 건 "노션보다 좋은 도구"가 아니라 "영아 이사의 흐름에 정확히 맞는 도구". 단단히 만든다.**
