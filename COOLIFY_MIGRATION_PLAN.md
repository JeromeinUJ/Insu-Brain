# 🚀 Insu-Brain Coolify 마이그레이션 계획

**날짜:** 2026-01-20
**목적:** Supabase → Coolify (PostgreSQL + MinIO) 마이그레이션
**예상 소요 시간:** 1-2시간

---

## 📋 현재 상태

### ✅ 완료된 작업
- [x] Coolify 설치 (http://5.223.68.56:8000)
- [x] AUTO블로그 복구 완료
- [x] PostgreSQL 설치 완료 (Coolify 내부)
- [x] MinIO 설치 완료 (Coolify 내부)

### ⏸️ 대기 중
- [ ] Insu-Brain 코드 수정 (Supabase → PostgreSQL + MinIO)
- [ ] 환경 변수 설정
- [ ] Coolify 배포
- [ ] 크롤러 Cron Job 설정

---

## 🎯 마이그레이션 단계

### Phase 1: 데이터베이스 연결 정보 확인 (5분)

#### 1-1. Coolify에서 PostgreSQL 정보 확인

**접속:**
```
http://5.223.68.56:8000
```

**위치:**
1. Dashboard → My first project
2. "insubrain-postgres" 클릭
3. "Environment Variables" 탭에서 확인할 정보:
   - `POSTGRES_USER`: postgres
   - `POSTGRES_PASSWORD`: (자동 생성된 비밀번호)
   - `POSTGRES_DB`: postgres
   - `POSTGRES_HOST`: (내부 호스트명)
   - `POSTGRES_PORT`: 5432

**메모장에 기록:**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

#### 1-2. MinIO 정보 확인

**위치:**
1. Dashboard → My first project
2. "insubrain-minio" 클릭
3. "General" 탭에서 확인:
   - Admin User: (자동 생성)
   - Admin Password: (자동 생성)
   - S3 API URL: https://minio-n0c4gw0gg8sg04ckoks08wk4.5.223.68.56.sslip.io

**메모장에 기록:**
```
S3_ENDPOINT=[S3 API URL]
S3_ACCESS_KEY=[Admin User]
S3_SECRET_KEY=[Admin Password]
S3_BUCKET=insurance-pdfs
```

---

### Phase 2: 코드 수정 (30-40분)

#### 2-1. PostgreSQL 클라이언트 설치

```bash
cd E:\OneDrive\00.Personal\show-me-the-money\Insu-Brain
npm install pg
npm install @types/pg --save-dev
```

#### 2-2. lib/db.ts 생성 (새 파일)

**파일:** `lib/db.ts`

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export default pool;
```

#### 2-3. S3 클라이언트 설치 및 설정

```bash
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner
```

**파일:** `lib/s3.ts` (새 파일)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1', // MinIO는 리전 무관
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // MinIO 필수 설정
});

export const BUCKET_NAME = process.env.S3_BUCKET || 'insurance-pdfs';
```

#### 2-4. lib/supabase.ts → lib/db.ts로 교체

**수정할 파일들:**
1. `app/api/companies/route.ts`
2. `app/api/products/route.ts`
3. `app/api/recommend/route.ts`
4. 기타 Supabase 사용하는 모든 파일

**예시 변경:**

**Before (Supabase):**
```typescript
import { createClient } from '@/lib/supabase';

const supabase = createClient();
const { data } = await supabase.from('companies').select('*');
```

**After (PostgreSQL):**
```typescript
import { query } from '@/lib/db';

const result = await query('SELECT * FROM companies');
const data = result.rows;
```

#### 2-5. .env.local 업데이트

**파일:** `.env.local`

```bash
# PostgreSQL (Coolify)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# MinIO (Coolify)
S3_ENDPOINT=[S3 API URL]
S3_ACCESS_KEY=[Admin User]
S3_SECRET_KEY=[Admin Password]
S3_BUCKET=insurance-pdfs

# 기존 Supabase 변수 제거 또는 주석 처리
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### Phase 3: 데이터베이스 스키마 생성 (10분)

#### 3-1. 스키마 SQL 파일 작성

**파일:** `db/schema.sql` (새 파일)

```sql
-- 보험사 테이블
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 보험 상품 테이블
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 추천 규칙 테이블
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  conditions JSONB,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category);
```

#### 3-2. 스키마 실행

**PowerShell에서:**
```bash
ssh root@5.223.68.56

# PostgreSQL 컨테이너 찾기
docker ps | grep postgres

# 스키마 실행
docker exec -i [CONTAINER_ID] psql -U postgres -d postgres < schema.sql
```

**또는 Coolify Terminal 사용:**
1. Coolify → insubrain-postgres → Terminal 탭
2. schema.sql 내용 복사 → 붙여넣기 → 실행

---

### Phase 4: 로컬 테스트 (15분)

#### 4-1. 개발 서버 실행

```bash
npm run dev
```

#### 4-2. 테스트 항목

- [ ] http://localhost:3000 접속
- [ ] 보험사 목록 표시 확인
- [ ] 보험 상품 목록 확인
- [ ] 추천 기능 작동 확인

**에러 발생 시:**
- 콘솔 에러 메시지 확인
- DATABASE_URL 연결 확인
- PostgreSQL 컨테이너 실행 상태 확인

---

### Phase 5: GitHub 푸시 및 Coolify 배포 (20분)

#### 5-1. Git 커밋

```bash
git add .
git commit -m "Migrate from Supabase to Coolify (PostgreSQL + MinIO)

- Replace Supabase client with PostgreSQL pg pool
- Add MinIO S3 client for PDF storage
- Update environment variables
- Create database schema

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

#### 5-2. Coolify 환경 변수 설정

**Coolify 접속:**
```
http://5.223.68.56:8000
```

**위치:**
1. My first project → Insu-Brain 앱
2. Environment Variables 탭
3. 다음 변수 추가:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@insubrain-postgres:5432/postgres
S3_ENDPOINT=[MinIO S3 API URL]
S3_ACCESS_KEY=[MinIO Admin User]
S3_SECRET_KEY=[MinIO Admin Password]
S3_BUCKET=insurance-pdfs
```

**중요:**
- `DATABASE_URL`의 호스트는 `insubrain-postgres` (Coolify 내부 네트워크)
- 외부 IP 주소가 아님!

#### 5-3. 배포 실행

1. 우측 상단 **"Deploy"** 버튼 클릭
2. Logs 탭에서 빌드 진행 상황 확인
3. 완료 대기 (3-5분)

#### 5-4. 배포 확인

**접속:**
```
http://u4wsoco888kw8koocoko0oss.5.223.68.56.sslip.io
```

**확인 항목:**
- [ ] 페이지 로드 정상
- [ ] 보험사 목록 표시
- [ ] 보험 상품 검색 작동
- [ ] 에러 없음

---

### Phase 6: 크롤러 설정 (15분)

#### 6-1. 크롤러 코드 Coolify로 업로드

**방법 A: Git 서브모듈 (추천)**

```bash
cd E:\OneDrive\00.Personal\show-me-the-money\Insu-Brain

# crawler 폴더를 Git에 추가
git add crawler/
git commit -m "Add crawler scripts for monthly automation"
git push
```

**방법 B: Docker Image로 빌드**

`crawler/Dockerfile` 생성:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "crawl-all-urls.js"]
```

#### 6-2. Coolify Scheduled Task 설정

**Coolify에서:**
1. My first project 클릭
2. 우측 상단 "+" → "Scheduled Task" 선택
3. 설정:
   - **Name**: `insubrain-crawler`
   - **Schedule**: `0 3 1 * *` (매월 1일 오전 3시)
   - **Command**:
     ```bash
     cd /app/crawler && node crawl-all-urls.js && node clean-data.js
     ```
   - **Container**: Insu-Brain 앱과 동일한 컨테이너 사용

#### 6-3. 수동 테스트

**Coolify Terminal에서:**
```bash
cd /app/crawler
node crawl-all-urls.js
```

**확인:**
- 270개 상품 수집 확인
- `crawler/data/` 폴더에 JSON 파일 생성 확인

---

## 🔧 트러블슈팅

### 문제 1: DATABASE_URL 연결 안 됨

**증상:**
```
Error: getaddrinfo ENOTFOUND insubrain-postgres
```

**해결:**
1. Coolify에서 PostgreSQL 컨테이너 이름 확인
2. `DATABASE_URL`의 호스트명 수정
3. 같은 프로젝트 내에 있어야 내부 DNS 작동

### 문제 2: MinIO 연결 안 됨

**증상:**
```
SignatureDoesNotMatch
```

**해결:**
1. `S3_ACCESS_KEY`, `S3_SECRET_KEY` 다시 확인
2. `forcePathStyle: true` 설정 확인
3. `S3_ENDPOINT`에 프로토콜 포함 확인 (https://)

### 문제 3: 빌드 실패

**증상:**
```
Module not found: Can't resolve 'pg'
```

**해결:**
```bash
npm install pg @types/pg --save
git add package.json package-lock.json
git commit -m "Add pg dependencies"
git push
```

### 문제 4: 환경 변수 안 읽힘

**증상:**
```
DATABASE_URL is not defined
```

**해결:**
1. Coolify Environment Variables에서 "Available at Runtime" 체크 확인
2. "Update" 버튼 클릭했는지 확인
3. 재배포 필요

---

## 📊 체크리스트

### Phase 1: 정보 수집
- [ ] PostgreSQL 연결 정보 확인
- [ ] MinIO 연결 정보 확인
- [ ] 메모장에 환경 변수 정리

### Phase 2: 코드 수정
- [ ] `npm install pg @aws-sdk/client-s3` 실행
- [ ] `lib/db.ts` 생성
- [ ] `lib/s3.ts` 생성
- [ ] Supabase 코드 모두 제거
- [ ] `.env.local` 업데이트

### Phase 3: 데이터베이스
- [ ] `db/schema.sql` 작성
- [ ] PostgreSQL에 스키마 실행
- [ ] 테이블 생성 확인

### Phase 4: 로컬 테스트
- [ ] `npm run dev` 실행
- [ ] 로컬에서 정상 작동 확인

### Phase 5: 배포
- [ ] Git 커밋 & 푸시
- [ ] Coolify 환경 변수 설정
- [ ] Deploy 실행
- [ ] 배포된 사이트 접속 확인

### Phase 6: 크롤러
- [ ] crawler 코드 Git 푸시
- [ ] Coolify Scheduled Task 설정
- [ ] 수동 테스트 실행

---

## 💰 최종 비용 계산

### Before (Supabase)
- Hetzner: $13.49/월
- Supabase Pro: $25/월
- **합계: $38.49/월**

### After (Coolify)
- Hetzner: $13.49/월
- Coolify: $0 (자체 호스팅)
- **합계: $13.49/월**

### 절감액
- **월간: $25 절감 (65% 감소)**
- **연간: $300 절감**

---

## 📝 참고 자료

### Coolify 접속 정보
- URL: http://5.223.68.56:8000
- Email: (가입 시 설정한 이메일)
- Password: (가입 시 설정한 비밀번호)

### 서버 SSH 접속
```bash
ssh root@5.223.68.56
Password: ekgmldkQk1!!
```

### 주요 파일 위치
- 로컬 프로젝트: `E:\OneDrive\00.Personal\show-me-the-money\Insu-Brain`
- 서버 docker-compose: `/root/blog-automation/docker`
- 크롤러: `E:\OneDrive\00.Personal\show-me-the-money\Insu-Brain\crawler`

### GitHub Repository
```
https://github.com/JeromeinUJ/Insu-Brain
```

---

## 🚀 다음 실행 시

이 파일을 열고 Phase 1부터 순서대로 진행하세요!

**예상 소요 시간:** 1-2시간
**난이도:** 중간
**필요한 것:** Coolify 로그인 정보, SSH 비밀번호

화이팅! 💪
