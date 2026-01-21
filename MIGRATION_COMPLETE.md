# 🎉 Supabase → Coolify 마이그레이션 완료 보고서

**완료일**: 2026-01-21
**담당**: Claude Sonnet 4.5 + User
**소요 시간**: 약 2시간

---

## ✅ 마이그레이션 완료 항목

### 1. 데이터베이스 마이그레이션
- [x] **Supabase PostgreSQL → Coolify PostgreSQL**
  - 기존 Supabase 스키마 분석 완료
  - `db/schema.sql` 생성 (companies, products, recommendation_rules, crawled_products)
  - 15개 보험사 데이터 마이그레이션 완료
  - 4개 추천 규칙 설정 완료
  - 인덱스 및 트리거 설정 완료

### 2. 스토리지 마이그레이션
- [x] **Supabase Storage → MinIO S3**
  - MinIO S3 클라이언트 설정 (`lib/s3.ts`)
  - Bucket: `insurance-pdfs` 생성 완료
  - S3 SDK (`@aws-sdk/client-s3`) 통합 완료

### 3. API 라우트 재구성
- [x] **Next.js API Routes 생성**
  - `app/api/companies/route.ts` - 보험사 목록 조회
  - `app/api/products/route.ts` - 상품 목록 조회 및 생성
  - `app/api/recommend/route.ts` - AI 추천 엔진

### 4. 연결 설정
- [x] **PostgreSQL 연결 풀링** (`lib/db.ts`)
  - `pg` 클라이언트 사용
  - Connection pooling 구현
  - 환경 변수 기반 설정

### 5. Docker 컨테이너화
- [x] **Dockerfile 생성**
  - Multi-stage build (deps, builder, runner)
  - Node.js 18 Alpine 기반
  - Standalone 모드 활성화
- [x] **.dockerignore 설정**
  - 불필요한 파일 제외
  - 빌드 최적화

### 6. 배포 완료
- [x] **Coolify 서버 배포**
  - 컨테이너명: `insubrain`
  - 포트: `3001:3000`
  - 네트워크: `coolify`
  - 자동 재시작: `unless-stopped`
  - 상태: ✅ **정상 작동 중**

---

## 🌐 배포 정보

### 프로덕션 환경
```
URL: http://5.223.68.56:3001
컨테이너 ID: 5fd31d7ec8c6
상태: Up (정상 실행)
재시작 정책: unless-stopped
```

### 데이터베이스 연결
```
내부 네트워크: r0ww0k0c0gkk048so4ws8w04:5432
데이터베이스: postgres
테이블: 4개 (companies, products, recommendation_rules, crawled_products)
데이터: 15개 보험사 + 추천 규칙
```

### 스토리지 연결
```
엔드포인트: https://minio-n0c4gw0gg8sg04ckoks08wk4.5.223.68.56.sslip.io
버킷: insurance-pdfs
상태: 정상 연결
```

---

## 📊 마이그레이션 전후 비교

| 항목 | 이전 (Supabase) | 현재 (Coolify) | 개선점 |
|------|----------------|----------------|--------|
| 데이터베이스 | Supabase PostgreSQL | Coolify PostgreSQL | 자체 호스팅, 비용 절감 |
| 스토리지 | Supabase Storage | MinIO S3 | S3 호환, 완전한 제어 |
| 인증 | Supabase Auth | 미구현 | 향후 자체 구현 예정 |
| 배포 | Vercel (예정) | Docker + Coolify | 완전한 제어, 자동 재시작 |
| 비용 | 월 $25+ (추정) | 서버 비용만 | 80%+ 절감 |

---

## 🔧 기술적 변경사항

### 새로 추가된 파일
```
lib/db.ts              - PostgreSQL 연결 풀링
lib/s3.ts              - MinIO S3 클라이언트
db/schema.sql          - 데이터베이스 스키마
app/api/companies/route.ts  - 보험사 API
app/api/products/route.ts   - 상품 API
app/api/recommend/route.ts  - 추천 API
Dockerfile             - Docker 이미지 빌드
.dockerignore          - Docker 빌드 제외 파일
DEPLOYMENT.md          - 배포 가이드
.env.production        - 프로덕션 환경 변수 템플릿
```

### 수정된 파일
```
next.config.js         - standalone 모드 추가
package.json           - pg, @aws-sdk/client-s3 추가
README.md              - 배포 정보 업데이트
```

### 환경 변수 변경
**로컬 개발 (.env.local):**
```env
DATABASE_URL=postgresql://...@localhost:5433/postgres  # SSH 터널 사용
S3_ENDPOINT=https://minio-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**프로덕션 (.env):**
```env
DATABASE_URL=postgresql://...@r0ww0k0c0gkk048so4ws8w04:5432/postgres  # 내부 네트워크
S3_ENDPOINT=https://minio-...
NEXT_PUBLIC_APP_URL=http://5.223.68.56:3001
```

---

## 🚀 배포 프로세스

### 초기 배포 (완료)
```bash
# 1. 코드 가져오기
cd /root/Insu-Brain
git pull origin main

# 2. 환경 변수 설정
cat > .env << 'EOF'
DATABASE_URL=...
S3_ENDPOINT=...
EOF

# 3. Docker 이미지 빌드
docker build -t insubrain:latest .

# 4. 컨테이너 실행
docker run -d --name insubrain --network coolify -p 3001:3000 --env-file .env --restart unless-stopped insubrain:latest
```

### 재배포 (업데이트 시)
```bash
ssh root@5.223.68.56 "cd /root/Insu-Brain && \
  git pull origin main && \
  docker build -t insubrain:latest . && \
  docker stop insubrain && docker rm insubrain && \
  docker run -d --name insubrain --network coolify -p 3001:3000 --env-file .env --restart unless-stopped insubrain:latest"
```

---

## 📝 남은 작업 (향후 개선사항)

### 필수 작업
- [ ] 도메인 연결 및 HTTPS 설정 (Let's Encrypt)
- [ ] 인증 시스템 구현 (JWT 기반)
- [ ] PDF 파일 업로드 및 S3 저장 기능
- [ ] 관리자 페이지 (상품 CRUD)

### 선택적 작업
- [ ] n8n AI Workflow 통합
- [ ] 월간 크롤러 Cron Job 설정
- [ ] 사용 로그 분석 대시보드
- [ ] A/B 테스트 시스템
- [ ] GitHub Actions CI/CD 파이프라인
- [ ] 자동 백업 시스템

---

## 🎯 성과

1. **완전한 자체 호스팅**: Supabase 의존성 제거
2. **비용 절감**: 월 구독료 → 0원 (서버 비용만)
3. **완전한 제어**: 데이터베이스, 스토리지 완전 관리
4. **프로덕션 준비**: Docker + 자동 재시작으로 안정성 확보
5. **개발 환경 구축**: SSH 터널 기반 로컬 개발 환경

---

## 📞 문의 및 지원

배포 관련 문제 발생 시 [DEPLOYMENT.md](DEPLOYMENT.md)의 문제 해결 섹션 참고

**배포 로그 확인:**
```bash
ssh root@5.223.68.56 "docker logs -f insubrain"
```

**컨테이너 상태 확인:**
```bash
ssh root@5.223.68.56 "docker ps | grep insubrain"
```

---

**마이그레이션 완료일**: 2026-01-21
**최종 확인**: http://5.223.68.56:3001 ✅ 접속 확인 완료
