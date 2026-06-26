# 🚀 DEPLOY — toy2 셀프호스팅

> eveworks v3.1 · SQLite 단일 파일 · `next start` 셀프호스팅
> Vercel 아님 — toy2(자체 서버)에서 구동.

---

## 0. 사전 준비 (toy2)

- **Node 20+** (better-sqlite3는 Node 25까지 확인됨)
- **빌드 도구** — better-sqlite3가 네이티브 모듈이라 컴파일 필요
  ```bash
  # Debian/Ubuntu
  sudo apt-get install -y build-essential python3
  ```
- (선택) **pm2** 또는 systemd — 프로세스 상시 구동
- (선택) **nginx/Caddy** — 리버스 프록시 + HTTPS

---

## 1. 클론 & 의존성

```bash
git clone https://github.com/Direveyoung/eveworks.git
cd eveworks
npm ci          # 네이티브 모듈(better-sqlite3) 자동 빌드
```

## 2. 환경변수

```bash
cp .env.example .env.local
```

`.env.local` 핵심 값:
```bash
EVE_DEV_USER_ID=00000000-0000-0000-0000-000000000001
EVE_AUTH_ENABLED=false
NEXT_PUBLIC_APP_URL=https://calendar.kitker.com

# DB를 레포 밖 영속 경로에 두기 (업데이트 시 데이터 보존)
EVE_DB_PATH=/var/lib/eveworks/eveworks.db
```

> ⚠️ `EVE_DB_PATH`를 레포 안 `./data`로 두면 `git clean`/재배포 시 날아갈 수 있음.
> **레포 밖 절대경로** 권장. 디렉토리는 앱이 자동 생성(mkdir).

## 3. 빌드 & 시드

```bash
npm run build
npm run seed          # 최초 1회 — 캘린더 3 + 샘플 일정/할일
                      # (EVE_DB_PATH 동일 환경에서 실행해야 같은 DB에 들어감)
```

## 4. 구동

```bash
npm run start         # 포트 3000 (PORT=4000 npm run start 로 변경 가능)
```

### pm2 상시 구동 예시
```bash
pm2 start "npm run start" --name eveworks
pm2 save && pm2 startup
```

### systemd 예시 (`/etc/systemd/system/eveworks.service`)
```ini
[Service]
WorkingDirectory=/home/eve/eveworks
Environment=EVE_DB_PATH=/var/lib/eveworks/eveworks.db
ExecStart=/usr/bin/npm run start
Restart=always
[Install]
WantedBy=multi-user.target
```

---

## 5. 리버스 프록시 (Caddy 예시)

```
calendar.kitker.com {
    reverse_proxy localhost:3000
}
```
→ HTTPS 자동. PWA(서비스워커)는 **HTTPS 또는 localhost**에서만 동작.

---

## 6. 업데이트

```bash
cd eveworks
git pull
npm ci
npm run build
pm2 restart eveworks   # 또는 systemctl restart eveworks
```
DB는 `EVE_DB_PATH`(레포 밖)에 있으므로 보존됨.
스키마는 `lib/db/index.ts`의 `CREATE TABLE IF NOT EXISTS` 부트스트랩으로 자동 반영.

## 7. 백업

```bash
# 단순 파일 복사 (WAL 포함 권장)
sqlite3 /var/lib/eveworks/eveworks.db ".backup '/backup/eveworks-$(date +%F).db'"
```

---

## 체크리스트
- [ ] build 도구 설치 → `npm ci` 성공 (better-sqlite3 컴파일)
- [ ] `EVE_DB_PATH` 레포 밖 절대경로 설정
- [ ] `npm run build && npm run seed` (최초)
- [ ] pm2/systemd 등록
- [ ] HTTPS 프록시 (PWA 위해 필수)
- [ ] iPhone Safari → 공유 → 홈 화면에 추가
