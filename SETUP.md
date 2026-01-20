# 🚀 Insu-Brain KB Pilot - 설치 가이드

## 빠른 시작 (5분 완성)

### 1단계: 프로젝트 확인

프로젝트가 이미 생성되어 있습니다! 다음 명령어로 확인하세요:

```bash
ls -la
```

### 2단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

**축하합니다!** 🎉 기본 UI가 작동합니다. (현재는 Mock 데이터 사용)

---

## 실제 데이터 연동 (Supabase 설정)

### 3단계: Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 이름: `insu-brain-kb`
4. 데이터베이스 비밀번호 설정 (안전한 곳에 저장!)
5. Region: `Northeast Asia (Seoul)` 선택
6. "Create new project" 클릭 → 약 2분 대기

### 4단계: 데이터베이스 스키마 적용

1. Supabase Dashboard → 왼쪽 메뉴 **"SQL Editor"** 클릭
2. 새 쿼리 생성
3. 프로젝트의 `supabase/schema.sql` 파일 내용을 복사하여 붙여넣기
4. **"Run"** 버튼 클릭

**결과 확인:**
- `insurance_companies` 테이블: 15개 보험사 (KB손해보험 최상단)
- `insurance_products` 테이블: 4개 KB 상품
- `recommendation_rules` 테이블: 4개 추천 규칙

### 5단계: 환경 변수 설정

1. Supabase Dashboard → **"Settings"** → **"API"**
2. 다음 값을 복사:
   - `Project URL` (예: `https://xxxxx.supabase.co`)
   - `anon public` 키

3. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Windows
copy .env.local.example .env.local

# Mac/Linux
cp .env.local.example .env.local
```

4. `.env.local` 파일 열어서 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6단계: 재시작 및 테스트

```bash
# Ctrl+C로 개발 서버 종료 후 재시작
npm run dev
```

이제 실제 Supabase 데이터를 사용합니다!

---

## 고급 설정 (선택사항)

### n8n AI Workflow 연동

현재는 Mock 데이터로 비교 분석이 작동하지만, 실제 AI 분석을 위해서는 n8n이 필요합니다.

#### n8n 설치 (Docker 사용)

```bash
docker run -d -p 5678:5678 --name n8n n8nio/n8n
```

브라우저에서 [http://localhost:5678](http://localhost:5678) 접속

#### Workflow 생성 (예시)

1. **Webhook Trigger** 노드 추가
   - Method: POST
   - Path: `insu-brain-compare`

2. **Supabase** 노드 추가 (Vector Search)
   - 약관 PDF에서 관련 조항 검색

3. **OpenAI** 노드 추가
   - Model: gpt-4
   - Prompt: "다음 두 약관을 비교하여 KB 상품의 우위 조항을 찾아줘..."

4. **Respond to Webhook** 노드 추가

5. Webhook URL 복사 → `.env.local`에 추가:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/insu-brain-compare
```

6. `components/comparison-tab.tsx`에서 Mock API 코드를 실제 fetch로 교체

---

## 문제 해결

### Q: 빌드 에러가 발생해요

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Q: Supabase 연결이 안 돼요

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수 값에 따옴표가 **없는지** 확인
3. 개발 서버 재시작 (Ctrl+C → `npm run dev`)

### Q: 이미지 저장이 안 돼요

브라우저 콘솔(F12)에서 에러 확인:
- CORS 에러: html2canvas의 `useCORS: true` 옵션 확인
- 요소를 찾을 수 없음: `id="comparison-result"` 또는 `id="recommendation-result"` 확인

---

## 다음 단계

### 필수 작업

- [ ] Supabase에 실제 약관 PDF 업로드
- [ ] `insurance_products` 테이블의 `pdf_url` 업데이트
- [ ] 설계사 로그인 기능 추가 (Supabase Auth)

### 추천 개선사항

- [ ] n8n으로 실제 AI 비교 로직 구현
- [ ] 사용 로그 수집 (어떤 상품이 가장 많이 추천되는지)
- [ ] 모바일 반응형 최적화
- [ ] 다크/라이트 모드 토글

---

## 배포

### Vercel에 배포하기

1. [https://vercel.com](https://vercel.com) 접속
2. GitHub 리포지토리 연결
3. Environment Variables 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. "Deploy" 클릭

**완료!** 🚀 프로덕션 URL을 받게 됩니다.

---

## 지원

문제가 있으시면 `README.md` 파일을 참고하거나, 이슈를 제기해주세요.

**Happy Coding!** 💛
