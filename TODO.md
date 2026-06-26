# 📋 TODO

## v3.1 · Phase 1 — 핵심 화면 + 메모 시스템

### BEFORE_CODE
- [x] Step 0: 기존 코드 삭제 + archive 백업
- [x] KICK_OFF.md / CLAUDE.md / CHANGELOG.md / TODO.md 초기 작성
- [x] DB: ~~Neon~~ → **SQLite** (better-sqlite3 + Drizzle, toy2 셀프호스팅) — 별도 DB 서비스 불필요
- [x] 배포 전제: ~~Vercel~~ → toy2 (`next start`)
- [x] Next.js 15 스캐폴드 (15.5.18, App Router, Turbopack)
- [x] Tailwind v4 + 의존성 (cva/clsx/tailwind-merge — shadcn 컴포넌트는 필요 시 추가)
- [x] Pretendard Variable + Noto Serif KR (next/font/local)
- [x] globals.css에 Petals + Velvet Night 토큰 적용 (4색 petal, light/dark)
- [x] next-themes 설치 + ThemeProvider 셋업
- [~] PWA 셋업 (manifest ✓ / sw 미구현)
- [x] Drizzle + SQLite 연결 + 스키마/시드 (`lib/db/*`)

### 개발 순서
- [x] Shell + 테마 토글 (라이트/다크/시스템 3-way, top-bar 우상단) — 사이드바 240↔60 collapse, ⌘1~⌘4 / ⌘K / ⌘N 단축키
- [ ] 메모 트리 (중첩, 펼치기/접기, 드래그 정렬, 새/하위 메모, 삭제, 이름·아이콘)
- [ ] 메모 에디터 (Lexical 블록 10종 + 슬래시 명령, 1초 debounce auto-save, 5분 debounce 버전 스냅샷)
- [ ] 메모 속성 패널 (일정/할일 토글)
- [ ] Today (날짜 + 발리/서울 듀얼 시계 + 진행률 + 시집 한 줄 + 일정/할일/universal capture)
- [x] Calendar (월/주/일 뷰 + 미니월력 + 내 캘린더 토글 + 일정 CRUD + ICS 피드) ✅ 2026-06-25
- [ ] 할 일 (멀티뷰 리스트/보드/캘린더, petal-pink)
- [ ] 검색 ⌘K (pg_trgm)
- [ ] 캡처 ⌘N (자연어 인식)
- [ ] 마크다운 임포트 (노션/애플메모 export)
- [ ] PWA 완성 (오프라인 fallback)

### AFTER_CODE
- [ ] iPhone 13 Safari 정상
- [ ] 라이트/다크/시스템 3-way 토글 정상
- [ ] 메모 100개 시드 후 검색 100ms 이내
- [ ] PWA 홈화면 추가
- [ ] Vercel 배포 완료
- [ ] STATUS.md 업데이트
- [ ] CHANGELOG.md "v3.1.0 Phase 1 완료"

---

## Calendar 다음 (우선)
- [ ] 드래그로 일정 이동/리사이즈 + 드래그 생성 (구글캘린더식)
- [ ] 반복 일정 (recurrence: 매주/매월) + ICS RRULE 출력
- [ ] Today 홈화면 실제 구현 (오늘 일정/할일 한 화면)

## Phase 2 — 외부 연동 + 자동화
- [ ] ClickUp 양방향 동기화 (cron 30분)
- [ ] 구글 캘린더 양방향 OAuth
- [ ] 클로이 챗 (Anthropic Tool Use, 사이드바 상주)
- [ ] 시멘틱 검색 (pgvector 하이브리드)
- [ ] 노션 DB view (filter/sort/group)
- [ ] 메일 통합 검토

## Phase 3 — 라이프 + 시집
- [ ] 시집 special view (Noto Serif KR, A/B/C 3컬럼)
- [ ] Journal (날짜별 1:1 + 자동 요약)
- [ ] Budget (transaction 메모)
- [ ] Reading (URL paste + OG)

## Phase 4 — 인증 + 도메인
- [ ] Auth.js v5 부활 (Resend Magic Link)
- [ ] EVE_AUTH_ENABLED=true 전환
- [ ] 도메인 연결 (Vercel + DNS)
