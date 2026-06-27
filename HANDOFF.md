# HANDOFF — Kitker 다음 작업 (Cowork 인계)

> 작성 2026-06-27. 현재상태=STATUS.md · 컨텍스트=CLAUDE.md · 배포=DEPLOY.md.
> 자격증명(toy02 SSH 등)은 **ClickUp 문서** 참조 — 코드/문서에 저장 금지.

## 지금 상태 한눈에
- 코드: Phase 1 완료 + Phase 2 일부(클로이 챗, 아웃룩 일정 스냅샷, 웹푸시 알림). 최신 main 빌드/배포됨.
- 배포: **toy02** `~/kitker`, pm2 `kitker`(:3300), DB `~/kitker/data/kitker.db`, Cloudflare Tunnel.
  - 임시 접속: trycloudflare 퀵터널 URL(재시작 시 변경) — `pm2 logs cf-tunnel`에서 확인.
  - 영구 도메인 **calendar.kitker.com 은 미연결**(아래 1번).
- cron: `*/5 * * * *` → `npm run reminders`(리마인더 발송), 로그 `~/kitker-reminders.log`.

### 배포/운영 명령 (toy02)
```bash
ssh -i ~/.ssh/id_ed25519 -p 2203 young@218.145.201.125
cd ~/kitker
git fetch && git reset --hard origin/main && npm ci && npm run build && pm2 restart kitker && pm2 save
# DB 유지됨(.env.local·data/ 는 gitignore). seed 재실행은 중복 주의.
pm2 logs kitker        # 앱 로그
npm run reminders      # 리마인더 수동 실행
```

---

## 작업 목록 (우선순위)

### 1. 🔴 도메인 calendar.kitker.com 연결 (Cloudflare named 터널)
kitker.com은 이미 Cloudflare 존(alex/stella.ns). toy02에 `~/cf-finish.sh` 준비됨(named 터널 `kitker`? 내부 이름은 스크립트 확인 → calendar.kitker.com → localhost:3300 + DNS route + pm2).
- **막힌 지점**: `~/.cloudflared/cert.pem` 없음. 발급 2가지 중 택1 (영아 이사 1회 액션):
  - (a) `cloudflared tunnel login` → 출력 URL을 브라우저(Cloudflare 로그인)로 열어 **kitker.com 선택 → Authorize** → cert.pem 생성. (이전 시도 시 "Failed to fetch resource"로 실패한 적 있음 — 재시도 또는 (b))
  - (b) **Cloudflare API 토큰**(권장): My Profile→API Tokens→Custom Token, 권한 `Account·Cloudflare Tunnel·Edit` + `Zone·DNS·Edit(kitker.com)` + `Zone·Zone·Read`. 토큰으로 API 직접: 터널 생성→ingress(calendar.kitker.com→localhost:3300)→DNS CNAME→`cloudflared tunnel run --token` pm2 등록. cert.pem 불필요.
- 완료 후: 서버 `.env.local`의 `NEXT_PUBLIC_APP_URL=https://calendar.kitker.com` 이미 설정됨 → rebuild 불필요(런타임값 아님이면 재빌드).

### 2. 🟡 클로이 챗 활성화
- `ANTHROPIC_API_KEY`(영아 이사 발급) → toy02 `~/kitker/.env.local`에 추가 → `pm2 restart kitker`.
- 코드 완성됨: `/api/chat`(claude-opus-4-8, tool use), 도구 6종 `lib/chloe/tools.ts`(메모/할일/일정 생성·검색·조회). 키만 넣으면 동작.
- 확장 TODO: 클로이가 캘린더/이메일도 다루게 도구 추가(구글/그래프 연동 후).

### 3. 🟡 구글 캘린더 연동 (네이티브 양방향)
- Google Cloud 프로젝트 + OAuth(client id/secret), scope `calendar`. redirect `https://calendar.kitker.com/api/google/callback`.
- 구현: `lib/google/`(OAuth+토큰저장 테이블) · `app/api/google/{auth,callback}` · 동기화(events ↔ pages, calendarId 분리) · cron 30분.
- 토큰은 DB(또는 .env) 저장, 서버에서만.

### 4. 🟡 이메일 연동 — Gmail + Outlook
- **Outlook(우선, 회사메일)**: Azure App Registration(ClickUp "[코워크] Azure App Registration 설정" 가이드). Microsoft Graph, scope `Calendars.Read`(+`Mail.Read`), `offline_access`. `lib/graph/` OAuth+토큰. → 아웃룩 일정 **자동** 동기화(현재는 스냅샷 임포트, 5번 참고)로 교체.
- **Gmail**: 구글 OAuth에 Gmail scope 추가.
- 메일은 읽기/리마인더 위주부터.

### 5. 🟢 아웃룩 일정 스냅샷 → 자동 동기화로 교체
- 현재: MS365 MCP로 1회성 임포트됨("Outlook (회사)" 캘린더, tags:["outlook"]). 자동 아님.
- 4번 Graph 연동되면 cron으로 대체. 그 전까지 재임포트는 챗에서 수동.
- ⚠️ **확인 필요**: MS365 연결 메일함이 `shw@keybase.co.kr`로 보임 — 영아 이사(young@keybase.co.kr) 본인 계정인지 확인 후 맞는 계정으로 연동.

### 6. 🟢 위젯 (아이폰/맥)
- 네이티브 WidgetKit은 별도 Swift 앱 필요(스코프 밖).
- (A) **Apple 캘린더 ICS 구독** — `https://calendar.kitker.com/api/calendar/feed.ics` 구독 → 기본 캘린더 위젯에 표시(도메인 필요).
- (B) **Scriptable 커스텀 위젯** — `/api/today.json`(오늘 일정/할일 요약) 신규 + Scriptable JS 스크립트 제공.

### 7. 🟢 알림 세부조정
- `lib/push/run-reminders.ts`: lookahead(`KITKER_REMINDER_LOOKAHEAD`, 기본30분), 아침 할일요약, 반복일정 등 추가.
- iOS 푸시는 홈화면 PWA + 권한 필요. 도메인 안정 후 신뢰성↑.

### 8. ⚪ 잡정리
- 로컬 작업폴더명 `~/Project/eveworks` → `kitker` (세션 밖에서 rename; git/서버는 이미 kitker).
- v1/v2 backup 브랜치 정리 여부 결정.

---

## 검증 규칙
매 작업: `npx tsc --noEmit` · `npm run lint` · `npm run build` 통과 후 commit. 외부연동은 자격증명 받기 전까지 골격까지만(키 없으면 graceful 처리).
