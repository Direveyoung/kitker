# 📝 CHANGELOG

## [v3.1.1] — 2026-06-25 · Calendar (구글캘린더 패리티)

### Added
- 캘린더 월/주/일 뷰 (`components/calendar/*`)
- 좌측 패널: 미니 월력 + 내 캘린더(개인·회사·할일) 색상 토글
- 일정 CRUD (서버 액션 `lib/calendar/actions.ts`) + 편집/삭제 다이얼로그
- 시간 그리드 현재시각 라인, 오늘 강조
- ICS 구독 피드 `/api/calendar/feed.ics` (아이폰 기본 캘린더/위젯 구독용)
- DB 레이어 `lib/db/*` (스키마 + 부트스트랩 + 시드)

### Changed
- **DB: Neon Postgres → SQLite** (better-sqlite3 + Drizzle). 별도 DB 서비스 불필요, toy2 셀프호스팅.
- 배포 전제: Vercel → toy2 (`next start`)
- `.env.example` / `.gitignore` SQLite 기준으로 정리

## [v3.1.0] — 2026-05-12

### Reset
- v1/v2 코드 전면 폐기 (영아 이사 결정)
- `archive/v1-v2-backup` 브랜치에 보존
- main 리셋 — 새 출발

### Added
- `KICK_OFF.md` (v3.1 최종 설계)
- `CLAUDE.md` (새 컨텍스트)
- 마크 방법론 7단계 명세

---

## 작성 규칙
각 작업 commit 후 이 파일 업데이트.
```
## [버전 또는 날짜]
### Added / Changed / Fixed / Removed
- 변경 내용
```
