# 📊 STATUS — Kitker

> 최종 업데이트: 2026-06-27 · **Phase 1 완료 + Phase 2 진행중** · 다음작업 → HANDOFF.md

## 🚀 Phase 2 (외부연동·운영) — 진행
- ✅ 클로이(Chloé) AI 비서 — `/api/chat` tool use(메모/할일/일정 생성·검색·조회). *키만 넣으면 동작*
- ✅ 웹푸시 알림 — 일정 임박/오늘마감 리마인더(VAPID, cron 5분)
- ✅ 아웃룩 일정 스냅샷 임포트(MS365 MCP → "Outlook (회사)" 캘린더)
- ✅ toy02 배포 (pm2 `kitker`:3300 + Cloudflare Tunnel) · 리브랜딩 eveworks→Kitker
- ⏳ 도메인 calendar.kitker.com · 구글캘린더 · 이메일(Gmail/Outlook) 네이티브 · 클로이 키 → **HANDOFF.md**

---

---

## ✅ Phase 1 — 완료 현황

### 핵심 화면 (글로벌 뷰 3 + 메모)
- **Today** (`/today`) — 발리/서울 듀얼 라이브 시계, 진행률, 시집 한 줄, 오늘 일정/할일, universal capture
- **Calendar** (`/calendar`) — 월/주/일 뷰, 미니월력, 내 캘린더 토글, 일정 CRUD, ICS 구독 피드
- **Tasks** (`/tasks`) — 마감 그룹 목록 ↔ 보드 토글, 빠른추가, 완료토글, 메모 연결
- **Pages** (`/pages`, `/pages/[id]`) — 메모 트리 + 블록 에디터

### 메모 시스템
- **트리**: 무한 중첩, 펼치기/접기, 새/하위 메모, 삭제(자손 소프트삭제), 아이콘
- **블록 에디터**: 6종(paragraph/heading 1~3/todo/quote/code/divider), 슬래시(`/`) 명령, caret 분할 Enter, Backspace 병합, 1초 debounce autosave
- **속성 토글**: `has_todo`/`has_schedule` → 글로벌 뷰 자동 노출 (아키텍처 핵심)

### 공통 기능
- **⌘K 검색** — 제목 + 블록 본문 LIKE, 스니펫, 키보드 내비, 이동/새메모/임포트 명령
- **⌘N 자연어 캡처** — 한국어 날짜/시각/요일 파싱 → 메모/할일/일정 자동 분류 + 오버라이드
- **마크다운 임포트** — .md 다중 업로드 + 붙여넣기 (노션/애플메모 export)
- **테마** — Petals(라이트)/Velvet(다크)/자동 3-way, localStorage
- **PWA** — manifest + SVG/apple 아이콘 + service worker + `/offline` 폴백

---

## 🧱 아키텍처

- **모든 콘텐츠 = 메모(`pages`)** — 단일 테이블, `parent_id` 무한 중첩
- **블록 본문** = `blocks` JSON 컬럼 (에디터 ↔ 임포트 ↔ 검색 공유 계약)
- **DB**: SQLite (better-sqlite3 + Drizzle), 파일 1개 (`data/kitker.db`, `KITKER_DB_PATH`로 변경 가능)
- **인증**: Phase 4까지 dev user 하드코딩 (`KITKER_DEV_USER_ID`, `KITKER_AUTH_ENABLED=false`)

### 디렉토리
```
app/(workspace)/{today,calendar,tasks,pages/[id]}/  글로벌 뷰 + 에디터
app/api/calendar/feed.ics/                          ICS 구독
app/{offline,apple-icon}/                           PWA
components/{shell,calendar,today,tasks,pages,pwa,theme}/
lib/{db,auth,calendar,today,pages,search,capture,import}/
public/{manifest.json,sw.js,icon.svg}
```

---

## 🔬 검증 (2026-06-26, 로컬)

| 항목 | 결과 |
|---|---|
| 타입 / 린트 / 빌드 | ✅ 통과 |
| 전 라우트 (today/calendar/tasks/pages/offline) | ✅ 200, `/`→307→`/today` |
| 검색 100ms 이내 (115개) | ✅ <1.5ms |
| 3-way 테마 토글 | ✅ 구현 검증 |
| PWA 자산 (manifest/sw/icon/apple/offline) | ✅ 200 |
| NL 파서 / 마크다운 파서 | ✅ 단위테스트 통과 |

### 디바이스/배포 검증 (영아 이사 액션)
- [ ] iPhone 13 Safari 동작 + 홈화면 추가
- [ ] toy2 배포 (`DEPLOY.md` 참조)

---

## 🔭 후순위 개선 (Phase 1.x)
- [x] 메모 트리 드래그 정렬/이동
- [x] Tasks 캘린더 뷰 (월 그리드)
- [x] 블록 에디터 Lexical 전환 (마크다운 단축 + 체크리스트 + 인라인 서식)
- [ ] 남은 것: 인라인 서식 영속 저장, 블록 10종(table/page_link), 5분 버전 스냅샷

## 🔜 다음
- Phase 2 잔여: 도메인 · 구글캘린더 · 이메일(Gmail/Outlook) 네이티브 동기화 (상세 HANDOFF.md)
- Phase 4: Auth.js v5 부활
