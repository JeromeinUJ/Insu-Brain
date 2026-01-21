# Insu-Brain 배포 가이드

## 서버 배포 (Coolify Manual Deployment)

### 1. 서버 접속
```bash
ssh root@5.223.68.56
cd /root/Insu-Brain
```

### 2. 최신 코드 가져오기
```bash
git pull origin main
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성 (프로덕션 환경 변수 사용)
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:SSExtOnTM08Bx4mAps1vqK6rTJFCcBAKBTlPAtufjUcS4S8d7xaSQXgsQcPfhNr6@r0ww0k0c0gkk048so4ws8w04:5432/postgres
S3_ENDPOINT=https://minio-n0c4gw0gg8sg04ckoks08wk4.5.223.68.56.sslip.io
S3_ACCESS_KEY=QnA8XJsCQBTBoVgx
S3_SECRET_KEY=aHNQmQpz0MQBYADkJlqIpxo1Iq5spIfN
S3_BUCKET=insurance-pdfs
NEXT_PUBLIC_APP_URL=http://5.223.68.56:3001
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF
```

### 4. Docker 이미지 빌드
```bash
docker build -t insubrain:latest .
```

### 5. 기존 컨테이너 중지 및 제거 (있는 경우)
```bash
docker stop insubrain 2>/dev/null || true
docker rm insubrain 2>/dev/null || true
```

### 6. 컨테이너 실행
```bash
docker run -d \
  --name insubrain \
  --network coolify \
  -p 3001:3000 \
  --env-file .env \
  --restart unless-stopped \
  insubrain:latest
```

### 7. 로그 확인
```bash
docker logs -f insubrain
```

### 8. 접속 확인
브라우저에서 `http://5.223.68.56:3001` 접속

---

## 로컬 개발 환경

### 1. SSH 터널 설정 (PostgreSQL 접근)
```bash
ssh -L 5433:r0ww0k0c0gkk048so4ws8w04:5432 root@5.223.68.56
```

### 2. 환경 변수 확인
`.env.local` 파일이 있는지 확인 (DATABASE_URL은 localhost:5433 사용)

### 3. 개발 서버 실행
```bash
npm install
npm run dev
```

### 4. 접속
브라우저에서 `http://localhost:3000` 접속

---

## 환경 변수 차이점

### 로컬 개발 (.env.local)
- `DATABASE_URL`: `localhost:5433` (SSH 터널 통해 접근)
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`

### 프로덕션 (.env)
- `DATABASE_URL`: `r0ww0k0c0gkk048so4ws8w04:5432` (Docker 내부 네트워크)
- `NEXT_PUBLIC_APP_URL`: `http://5.223.68.56:3001` (또는 실제 도메인)

---

## 자동 배포 (선택사항)

### GitHub Webhook 설정
1. GitHub 저장소 Settings → Webhooks → Add webhook
2. Payload URL: `http://5.223.68.56:3002/webhook`
3. Content type: `application/json`
4. Events: Just the push event
5. Active 체크

### Webhook 서버 실행 (서버에서)
```bash
# webhook-handler.js 생성 후
npm install -g webhook
webhook --hooks hooks.json --verbose
```

---

## 문제 해결

### 데이터베이스 연결 실패
```bash
# PostgreSQL 컨테이너 확인
docker ps | grep postgres

# 네트워크 확인
docker network inspect coolify

# Insu-Brain 컨테이너가 coolify 네트워크에 있는지 확인
docker inspect insubrain | grep NetworkMode
```

### MinIO S3 연결 실패
```bash
# MinIO 컨테이너 확인
docker ps | grep minio

# MinIO 접속 테스트
curl https://minio-n0c4gw0gg8sg04ckoks08wk4.5.223.68.56.sslip.io
```

### 포트 충돌
```bash
# 3001 포트 사용 중인 프로세스 확인
netstat -tulpn | grep 3001

# 다른 포트로 실행 (예: 3002)
docker run -d --name insubrain --network coolify -p 3002:3000 --env-file .env insubrain:latest
```

---

## 데이터베이스 백업

### 백업 생성
```bash
docker exec r0ww0k0c0gkk048so4ws8w04 pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

### 백업 복원
```bash
cat backup_20260121.sql | docker exec -i r0ww0k0c0gkk048so4ws8w04 psql -U postgres postgres
```
