# Insu-Brain x KB Pilot Edition

KB손해보험 설계사를 위한 AI 기반 보험 비교 및 추천 플랫폼 MVP

## 🎯 핵심 가치

1. **KB First**: KB 주력 상품 위주의 비교 논리 및 고객 맞춤 추천 제공
2. **Evidence Based**: 약관 원문(PDF) 페이지 링크로 신뢰도 확보
3. **Legally Safe**: 강력한 워터마크 및 경고 시스템으로 광고 심의 리스크 차단

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI, Radix UI
- **Database**: PostgreSQL (Coolify)
- **Storage**: MinIO S3 (Coolify)
- **Deployment**: Docker + Coolify
- **Orchestrator**: n8n (AI Workflow, 예정)
- **Utilities**: html2canvas (이미지 생성), zustand (상태 관리)

## 🌐 배포 환경

**프로덕션 (Coolify):**
- URL: http://5.223.68.56:3001
- 상태: ✅ 정상 작동 중
- 배포일: 2026-01-21
- 데이터베이스: PostgreSQL (15개 보험사)
- 스토리지: MinIO S3

자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md) 참고

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

PostgreSQL 및 MinIO 정보 입력:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@localhost:5433/postgres
S3_ENDPOINT=https://minio-[ID].yourdomain.com
S3_ACCESS_KEY=[ACCESS_KEY]
S3_SECRET_KEY=[SECRET_KEY]
S3_BUCKET=insurance-pdfs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. SSH 터널 설정 (로컬 개발)

PostgreSQL에 접근하려면 SSH 터널이 필요합니다:

```bash
ssh -L 5433:r0ww0k0c0gkk048so4ws8w04:5432 root@5.223.68.56
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 데이터베이스 스키마 실행

PostgreSQL 컨테이너에서 `db/schema.sql` 실행:

```bash
# 서버에 접속
ssh root@5.223.68.56

# schema.sql 파일을 컨테이너에 복사
docker cp /path/to/schema.sql r0ww0k0c0gkk048so4ws8w04:/tmp/schema.sql

# PostgreSQL에서 실행
docker exec r0ww0k0c0gkk048so4ws8w04 psql -U postgres -d postgres -f /tmp/schema.sql
```

## 🎨 주요 기능

### Tab 1: 상품 비교 (Comparison)

- **목적**: "A사보다 우리가 뭐가 좋아?"
- **Input**: 내 상품(KB 고정), 경쟁사 상품
- **Output**: KB 약관의 우위 조항(면책 기간, 보장 범위 등) 분석
- **Evidence**: 결과 텍스트 내 `(약관 14p)` 클릭 시 PDF 뷰어 모달 실행

### Tab 2: AI 추천 (Recommendation)

- **목적**: "이 고객한테 뭐 팔아야 해?"
- **Input**: 나이, 성별, 직업군, 병력 태그
- **Rule Engine**:
  - 유병자 태그 → KB 간편건강보험
  - 15세 이하 → KB 자녀보험
  - 운전직 → KB 운전자보험
  - 30~60세 → KB 암보험 (기본)

### 컴플라이언스 모듈

#### 1. 워터마크 시스템 (`lib/utils.ts`)

- 이미지 하단: "심의필 없음 / SNS 게시 금지 / 1:1 상담용" 문구 강제 합성
- 이미지 중앙: "INTERNAL USE ONLY" 대각선 워터마크

#### 2. 경고 다이얼로그 (`components/compliance-alert.tsx`)

- [이미지 저장] 버튼 클릭 시 법적 경고창 표시
- 체크박스 동의 후에만 다운로드 실행
- 과태료 3천만원 리스크 명시

## 📁 프로젝트 구조

```
Insu-Brain/
├── app/
│   ├── layout.tsx          # 메인 레이아웃 (KB 브랜딩 헤더)
│   ├── page.tsx            # 메인 페이지 (탭 구조)
│   └── globals.css         # 글로벌 스타일 (KB Yellow 테마)
├── components/
│   ├── ui/                 # Shadcn/UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   └── select.tsx
│   ├── comparison-tab.tsx      # 상품 비교 탭
│   ├── recommendation-tab.tsx  # AI 추천 탭
│   ├── compliance-alert.tsx    # 법적 경고 모달
│   └── pdf-viewer-modal.tsx    # 약관 PDF 뷰어
├── lib/
│   ├── utils.ts            # 유틸리티 (워터마크 로직)
│   └── supabase.ts         # Supabase 클라이언트
├── supabase/
│   └── schema.sql          # 데이터베이스 스키마 + Seed
└── tailwind.config.ts      # Tailwind 설정 (KB Yellow)
```

## 🎨 디자인 시스템

### 컬러 팔레트

- **Primary (KB Yellow)**: `#ffbc00` - 액션 버튼, 강조 텍스트
- **Background**: `#1a1a1a` - 다크 모드 배경
- **Card**: `#2a2a2a` - 카드 배경
- **Border**: `#3a3a3a` - 구분선

### 타이포그래피

- **Font**: Inter (Google Fonts)
- **Headings**: 2xl (30px), xl (24px), lg (18px)
- **Body**: sm (14px), base (16px)

## ⚠️ 법적 준수사항

### 광고 심의 리스크 방어

1. **모든 출력물에 워터마크 강제 삽입**
   - 하단 Disclaimer Bar (회색 배경)
   - 대각선 "INTERNAL USE ONLY" 텍스트

2. **다운로드 전 의무 경고**
   - 과태료 3천만원 명시
   - 체크박스 동의 필수

3. **허용 사용처**
   - ✅ 카카오톡 1:1 전송
   - ✅ 문자 메시지
   - ❌ SNS (페이스북, 인스타그램, 블로그)
   - ❌ 카페, 단체 채팅방

## 🔄 n8n 연동 (선택사항)

현재는 Mock 데이터로 동작하지만, 실제 AI 비교 로직은 n8n Workflow로 처리 가능:

### Workflow 구조 예시

1. **Webhook Trigger**: Next.js에서 POST 요청
2. **Vector Search**: Supabase Vector Store에서 약관 검색
3. **OpenAI GPT-4**: 비교 분석 수행
4. **Response**: JSON 형태로 결과 반환

### 연동 방법

1. n8n에서 Workflow 생성
2. Webhook URL 복사
3. `.env.local`에 `NEXT_PUBLIC_N8N_WEBHOOK_URL` 추가
4. `components/comparison-tab.tsx`의 `handleCompare` 함수 수정

## 📊 데이터베이스 스키마

### insurance_companies (보험사 마스터)

| Column | Type | Description |
| --- | --- | --- |
| id | int | PK (KB손해보험 = 1) |
| name | text | 회사명 |
| group_name | text | major/general/online |
| sort_order | int | 정렬 순서 (KB = 1) |

### insurance_products (상품 마스터)

| Column | Type | Description |
| --- | --- | --- |
| id | uuid | PK |
| company_id | int | FK (보험사 ID) |
| product_name | text | 상품명 |
| category | text | health/car/child |
| pdf_url | text | 약관 PDF URL |

### recommendation_rules (추천 규칙)

| Column | Type | Description |
| --- | --- | --- |
| id | int | PK |
| condition_tags | text[] | 병력 태그 배열 |
| age_min/max | int | 나이 범위 |
| occupation_tags | text[] | 직업군 태그 |
| target_product_id | uuid | 추천 상품 ID |
| sales_talk | text | 추천 멘트 |
| priority | int | 우선순위 |

## 🚀 배포

### Docker + Coolify 배포 (현재 방식)

배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md) 참고

**빠른 재배포:**
```bash
ssh root@5.223.68.56 "cd /root/Insu-Brain && \
  git pull origin main && \
  docker build -t insubrain:latest . && \
  docker stop insubrain && docker rm insubrain && \
  docker run -d --name insubrain --network coolify -p 3001:3000 --env-file .env --restart unless-stopped insubrain:latest"
```

### 환경 변수 (프로덕션)

서버의 `/root/Insu-Brain/.env` 파일:

- `DATABASE_URL`: PostgreSQL 연결 (내부 컨테이너 네트워크)
- `S3_ENDPOINT`: MinIO S3 엔드포인트
- `S3_ACCESS_KEY`, `S3_SECRET_KEY`: MinIO 인증 정보
- `NEXT_PUBLIC_APP_URL`: 프로덕션 URL

## 📝 향후 개선사항

- [x] Supabase → PostgreSQL + MinIO 마이그레이션 (2026-01-21 완료)
- [x] Docker 컨테이너화 및 Coolify 배포 (2026-01-21 완료)
- [ ] 인증 시스템 구현 (설계사 로그인)
- [ ] 실제 n8n AI Workflow 연동
- [ ] PDF 약관 파일 업로드 기능
- [ ] 상품 CRUD 관리자 페이지
- [ ] 추천 규칙 시각화 대시보드
- [ ] A/B 테스트 (어떤 멘트가 더 효과적인지)
- [ ] 사용 로그 분석 (어떤 상품이 가장 많이 추천되는지)
- [ ] 도메인 연결 및 HTTPS 설정
- [ ] 월간 크롤러 Cron Job 자동화

## 📄 라이선스

Copyright © 2026 Insu-Brain. KB손해보험 파일럿 프로그램.

## 🆘 문의

- 기술 지원: dev@insu-brain.com
- 영업 문의: sales@kb.co.kr
