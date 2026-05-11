# 🌿 eve.works — PRD v1.0 (Phase 1 MVP)

> **목표**: 영아 이사 전용 개인 워크스페이스. 2주 안에 4개 모듈 배포.
> **사용자**: 김영아 (단독, 외부 비공개)
> **납기**: 2주 (Phase 1 한정, 늘어지면 멈추고 그대로 사용)
> **개발**: 코워크(안티그라비티) / 기획: 영아 이사 / AI 어시스트: 클로이

---

## 1. 핵심 컨셉

> "내 머릿속을 즉시 던질 수 있는 한 곳."

- 노션처럼 복잡하지 X
- 메모장처럼 흩어지지 X
- **속도 = 정의**. 모바일에서 떠올린 1초 안에 저장돼야 함.

---

## 2. Phase 1 모듈 (4개)

### 📥 Inbox
- 한 줄 입력 → Enter → 저장 (확인 모달 X)
- 모바일 진입 시 기본 화면 = Inbox 입력창에 커서
- 입력 항목은 시간순 정렬, 미분류 상태
- "Inbox Zero" 액션: 각 항목을 Today / Notes / 삭제로 분류

### 📅 Today
- 오늘 할일 체크박스 리스트
- 체크 = 완료 / 자정 = 새 날 (어제 미완료는 자동 carry-over)
- 항목 추가는 Inbox에서 분류 or 직접 입력
- **드래그·우선순위·태그 없음**. 그냥 리스트.

### 💭 Notes
- 자유 메모 (Lexical 에디터, 키베이스 허브와 동일 설정)
- 제목 + 본문 (마크다운 지원)
- 폴더·태그 없음. 검색으로 찾음.
- 자동 저장 (debounce 1s)

### 🔍 Search
- `Cmd+K` (모바일은 상단 검색 아이콘)
- Inbox + Today + Notes 통합 전문 검색
- Postgres `tsvector` 인덱스 사용
- 결과 클릭 → 해당 모듈 항목으로 이동

---

## 3. 데이터 모델 — 단일 테이블

```sql
-- items 테이블 1개로 통합. 처음부터 정교한 모델 X.
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('inbox','today','note')),
  title text,                        -- Notes 전용 (Inbox/Today는 null)
  body text NOT NULL,                -- 핵심 텍스트 (Inbox 한 줄 / Today 한 줄 / Note 본문)
  completed boolean DEFAULT false,   -- Today 전용
  completed_at timestamptz,
  carry_over_count int DEFAULT 0,    -- Today 미완료 carry 횟수
  search_vector tsvector,            -- 검색 인덱스
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX items_user_type_idx ON items(user_id, type, created_at DESC);
CREATE INDEX items_search_idx ON items USING GIN(search_vector);

-- 트리거: search_vector 자동 업데이트
CREATE TRIGGER items_tsvector_update
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, body);

-- RLS: 본인만 read/write
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own items only" ON items
  FOR ALL USING (auth.uid() = user_id);
```

---

## 4. UI 구조 (와이어프레임)

### 데스크탑
```
┌─────────────┬─────────────────────────────────────┐
│ 🌿 eve      │  [Cmd+K 검색]              [👤]    │
│             ├─────────────────────────────────────┤
│ 📥 Inbox  3 │                                     │
│ 📅 Today  5 │   (선택된 모듈의 메인 뷰)            │
│ 💭 Notes 12 │                                     │
│             │                                     │
│ ─────────   │                                     │
│ ⚙️ 설정     │                                     │
└─────────────┴─────────────────────────────────────┘
```

### 모바일 (PWA)
```
┌─────────────────────────┐
│  🌿 eve         🔍  👤  │
├─────────────────────────┤
│                         │
│  [한 줄 입력창 (focus)] │
│                         │
│  ─ Inbox (오늘 3개) ─   │
│  • 시집 8번째 마무리    │
│  • 마운자로 보고서...   │
│  ...                    │
├─────────────────────────┤
│ 📥 📅 💭   (탭바)       │
└─────────────────────────┘
```

**디자인 룰 — 1시간만**:
- Tailwind 기본 + shadcn/ui 그대로
- 폰트: Pretendard
- 컬러: zinc-50/900 (라이트/다크), accent emerald-500
- 커스텀 디자인 시스템 만들지 X

---

## 5. 사용자 시나리오 (7개)

1. **출근길 지하철** — 폰 열기 → Inbox 입력창 자동 focus → "릴리 김유진 이사 회신 챙기기" → Enter → 닫음. **3초**.
2. **회의 중** — 데스크탑 `Cmd+K` → "마운자로" → 관련 노트 즉시 이동.
3. **아침 루틴** — Today 열기 → 어제 미완료 자동 carry된 거 확인 → 새 항목 추가.
4. **시집 작업** — Notes에서 "발자국" 검색 → 기존 8편 확인 → 새 시 작성.
5. **밤 정리** — Inbox 쌓인 거 5개 → 분류 (Today 2, Notes 1, 삭제 2).
6. **발리 원격** — 와이파이 끊겨도 PWA로 작성 가능 → 연결 시 sync.
7. **클로이에게 던지기 (Phase 2)** — "이번 주 Inbox 정리해줘" → AI가 분류 제안.

---

## 6. 기술 스택 (확정)

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | 키베이스 허브와 동일 |
| DB | Supabase Postgres | 무료 티어 |
| 호스팅 | Vercel | 무료 + Git 자동 배포 |
| 도메인 | Vercel 기본 (`*.vercel.app`) | 추후 커스텀 도메인 연결 |
| 인증 | Supabase Auth (Magic Link) | 본인 1계정 |
| 에디터 | Lexical | 키베이스 허브와 통일 |
| 스타일 | Tailwind + shadcn/ui | |
| 폰트 | Pretendard | |
| PWA | next-pwa | 모바일 홈화면 추가 |

---

## 7. 일정 (2주)

| 주차 | 작업 | 산출물 |
|---|---|---|
| **Week 1** | 환경 셋업 + Supabase 스키마 + 인증 + 레이아웃 + Inbox/Today | 로컬에서 입력·체크 동작 |
| **Week 2** | Notes (Lexical) + Search + PWA + Vercel 배포 + QA | 모바일 PWA로 영아 이사 사용 시작 |

**2주 초과 시 멈춤**. Search 빼고 배포해도 됨.

---

## 8. 디자인·UX 가이드라인 (코워크 전달용)

✅ **해야 할 것**
- 진입 후 1초 안에 입력 가능
- 키보드 단축키 (`Cmd+K` 검색, `Cmd+Enter` 저장, `n` Note 새로작성)
- 모바일 PWA manifest + 아이콘 (이모지 🌿 임시)
- 다크모드 (시스템 따라감)

❌ **하지 말 것**
- 폴더·태그·라벨 시스템 (Phase 2에서 결정)
- 화려한 애니메이션 (Tailwind 기본 transition만)
- 온보딩 화면·튜토리얼 (혼자 씀)
- 공유·코멘트·협업 기능
- 통계·대시보드 (Phase 3)

---

## 9. 코워크 전달 체크리스트

- [ ] GitHub 레포 생성 (Direveyoung/eveworks, private)
- [ ] Supabase 프로젝트 생성 + 스키마 적용
- [ ] Vercel 프로젝트 연결
- [ ] 환경변수 공유 (Supabase URL/Key, NEXT_PUBLIC_*)
- [ ] 배포 URL 확보 (`eveworks-xxx.vercel.app`)
- [ ] 영아 이사 Magic Link 로그인 테스트

---

## 10. Phase 2 예고 (참고용, 이번 범위 X)

- Reading List, Ideas, 🤖 클로이 AI (Anthropic API)
- Phase 1 한 달 사용 후 결정

---

**문서 버전**: v1.0
**작성일**: 2026-05-11
**작성**: 클로이 (Claude)
**검토**: 영아 이사
**전달처**: 코워크(안티그라비티)
