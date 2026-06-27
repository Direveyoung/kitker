# 🌿 Kitker — 설계 & 방법론

> 컨셉·아키텍처·디자인의 **에버그린 설계문서**. 스택/배포/진행은 CLAUDE.md·STATUS.md·HANDOFF.md가 최신.

## 미션
영아 이사 1인 전용 **업무·일정 관리 시스템**. 본인 소유·자가호스팅이라 원하는 기능을 직접 넣는다. 노션/클릭업/구글캘린더/애플메모에서 영감, 1인 맞춤 70% 단순화.

## 1. 컨셉 — 차별화 3
1. **Today 뷰가 메인** — 오늘의 일정·할일·시집 한 줄·컨텍스트가 한 화면
2. **노션식 메모 트리 + 블록 에디터** — 무한 중첩, 슬래시/마크다운
3. **메모 속성으로 일정/할일 토글** — 한 메모가 메모+일정+할일 동시

### 4 원칙
1. 모든 콘텐츠는 메모(`pages`)
2. 메모는 일정·할일 속성을 켤 수 있다 → 글로벌 뷰 자동 노출
3. 본문은 블록 에디터(Lexical) + 슬래시 명령
4. 글로벌 뷰 3개(Today/Calendar/Tasks)가 모든 메모를 가로지른다

### 안 만드는 것 (절약)
팀 협업·권한·결제·다국어·백오피스·마케팅·손글씨·100+ 임베드

## 2. 아키텍처
- **단일 테이블 `pages`** + `parent_id` 무한 중첩. `has_schedule`/`has_todo`로 글로벌 뷰 노출.
- 본문 `blocks` JSON (paragraph/heading/todo/quote/code/divider). Lexical↔blocks 직렬화.
- 일정 컬럼(starts_at/ends_at/all_day/location)·할일 컬럼(todo_done/due_at/priority) 최상위 승격(쿼리 성능).
- 검색: SQLite LIKE(제목+blocks).

## 3. 디자인 — Petals + Velvet Night
- **라이트(Petals)**: 크림 페이퍼 + 4색 petal — yellow=일정 · pink=할일 · purple=메모 · blue=시집/완료
- **다크(Velvet Night)**: 미드나잇 + 샴페인 골드 액센트
- 3-way 토글(라이트/다크/시스템), localStorage. **토큰 소스 = `app/globals.css`**.
- 타이포: Pretendard Variable(본문) + Noto Serif KR(시집·인용).

## 4. 마크 방법론 7단계
1. 컨셉 → 2. 아키텍처 → 3. 디자인 → 4. 데이터규칙 → 5. 환경셋업 → 6. 단계별개발 → 7. 검증·배포

각 단계는 BEFORE_CODE(문서·모델·영향파일 확인) → 구현 → AFTER_CODE(타입0·린트0·빌드·CHANGELOG/TODO·commit)로 닫는다. (CLAUDE.md 참조)
