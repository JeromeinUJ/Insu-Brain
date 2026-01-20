# 🎉 Welcome to Insu-Brain KB Pilot!

```
 ___                   ____            _
|_ _|_ __  ___ _   _  | __ ) _ __ __ _(_)_ __
 | || '_ \/ __| | | | |  _ \| '__/ _` | | '_ \
 | || | | \__ \ |_| | | |_) | | | (_| | | | | |
|___|_| |_|___/\__,_| |____/|_|  \__,_|_|_| |_|

         KB 손해보험 파일럿 에디션 v1.0
```

## 🚀 Quick Start (30초)

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

**끝!** 이제 사용 가능합니다. 🎊

---

## 📚 Documentation Guide

프로젝트가 처음이신가요? 이 순서대로 읽어보세요:

### 1️⃣ [README.md](README.md) - 프로젝트 개요
- 무엇을 만들었나?
- 어떤 기술을 썼나?
- 주요 기능은?

**소요 시간:** 5분

---

### 2️⃣ [SETUP.md](SETUP.md) - 설치 가이드
- Supabase 연동 방법
- 환경 변수 설정
- n8n 설치 (선택)

**소요 시간:** 15분

---

### 3️⃣ [COMPLIANCE.md](COMPLIANCE.md) - ⚠️ 법적 준수사항
- 왜 워터마크가 필요한가?
- SNS 업로드 금지 이유
- 과태료 3천만원 리스크

**소요 시간:** 10분 (필독!)

---

### 4️⃣ [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 완료 보고서
- 구현된 기능 목록
- 파일 구조 설명
- 다음 단계 계획

**소요 시간:** 10분

---

### 5️⃣ [COMMANDS.md](COMMANDS.md) - 명령어 모음
- 개발 서버 실행
- 빌드 & 배포
- 디버깅 팁

**북마크 추천!**

---

### 6️⃣ [INDEX.md](INDEX.md) - 전체 인덱스
- 파일별 상세 설명
- 컴포넌트 의존성 맵
- 학습 리소스

**레퍼런스용**

---

## 🎯 Your First Steps

### Step 1: 개발 서버 실행 (1분)

```bash
npm install  # 이미 했으면 생략
npm run dev
```

### Step 2: 브라우저 확인 (1분)

[http://localhost:3000](http://localhost:3000)

- [상품 비교] 탭 클릭
- 드롭다운에서 상품 선택
- [비교 분석 시작] 클릭
- 결과 확인!

### Step 3: 이미지 저장 테스트 (2분)

- [이미지 저장] 버튼 클릭
- ⚠️ 법적 경고창이 뜨는지 확인
- 체크박스 클릭 후 [동의 및 저장]
- 다운로드된 이미지에 워터마크 확인

**축하합니다!** 🎉 기본 기능이 모두 작동합니다.

---

## 🗺️ Project Structure (한눈에 보기)

```
📘 Documentation/       ← 지금 읽고 있는 곳
├─ START_HERE.md       ← 본 문서
├─ README.md
├─ SETUP.md
├─ COMPLIANCE.md
├─ PROJECT_SUMMARY.md
├─ COMMANDS.md
└─ INDEX.md

🎨 Application/         ← 실제 코드
├─ app/                ← 페이지
├─ components/         ← UI 컴포넌트
└─ lib/                ← 유틸리티

🗄️ Database/
└─ supabase/schema.sql ← DB 스키마

⚙️ Configuration/
└─ package.json 등
```

---

## 🎓 What You'll Learn

이 프로젝트를 통해 배울 수 있는 것들:

✅ **Next.js 14 App Router** - 최신 React 프레임워크
✅ **Tailwind CSS** - 유틸리티 기반 CSS
✅ **Supabase** - Firebase 대체 오픈소스
✅ **TypeScript** - 타입 안전성
✅ **html2canvas** - 웹페이지 → 이미지 변환
✅ **Compliance Engineering** - 법적 리스크 방어 시스템 설계

---

## ⚠️ Important Notes

### 1. 환경 변수 설정 (선택사항)

지금은 **Mock 데이터**로 작동합니다.
실제 데이터를 쓰려면 [SETUP.md](SETUP.md) 참고.

### 2. 워터마크 시스템 (필수 이해)

이미지 저장 시 **자동으로** 다음이 추가됩니다:
- 하단: "심의필 없음 / SNS 금지"
- 중앙: "INTERNAL USE ONLY"

**이유:** 보험업법 위반 방지 (과태료 3천만원)

### 3. Mock vs Real API

현재 상태:
- ✅ UI/UX: 완성
- ✅ 워터마크: 작동
- 🚧 AI 분석: Mock (가짜 데이터)

실제 AI 분석을 원하면:
- Supabase 설정
- n8n Workflow 구축
- [SETUP.md](SETUP.md) 참고

---

## 🚨 Troubleshooting

### "npm: command not found"

Node.js를 설치하세요:
- Windows: https://nodejs.org
- Mac: `brew install node`

### "Port 3000 is already in use"

```bash
# 포트 3000 사용 중인 프로세스 종료
kill -9 $(lsof -t -i:3000)
npm run dev
```

### "Module not found"

```bash
# 의존성 재설치
rm -rf node_modules
npm install
```

---

## 🎁 What's Included

### 📦 Features
- ✅ KB Yellow 브랜딩
- ✅ 상품 비교 탭
- ✅ AI 추천 탭
- ✅ 워터마크 시스템
- ✅ 법적 경고 모달
- ✅ PDF 뷰어
- ✅ 반응형 UI

### 📚 Documentation
- ✅ README (개요)
- ✅ SETUP (설치)
- ✅ COMPLIANCE (법무)
- ✅ PROJECT_SUMMARY (보고서)
- ✅ COMMANDS (명령어)
- ✅ INDEX (인덱스)

### 🗄️ Database
- ✅ 15개 보험사 마스터
- ✅ 4개 KB 상품
- ✅ 4개 추천 규칙
- ✅ RLS 보안 정책

---

## 🏆 Next Steps

완전히 준비되셨나요? 다음 단계로 가보세요:

### 초급 (지금 바로)
1. ✅ 개발 서버 실행 완료
2. [ ] [상품 비교] 탭 테스트
3. [ ] [AI 추천] 탭 테스트
4. [ ] 이미지 저장 & 워터마크 확인

### 중급 (1시간 내)
1. [ ] Supabase 프로젝트 생성 ([SETUP.md](SETUP.md))
2. [ ] 환경 변수 설정
3. [ ] 데이터베이스 스키마 실행
4. [ ] 실제 데이터로 테스트

### 고급 (1일 내)
1. [ ] n8n Docker 설치
2. [ ] AI Workflow 구축
3. [ ] Mock API → Real API 교체
4. [ ] Vercel 배포

---

## 📞 Need Help?

### 빠른 답변이 필요하면
1. **검색:** Ctrl+F로 문서 내 검색
2. **인덱스:** [INDEX.md](INDEX.md) 참고
3. **명령어:** [COMMANDS.md](COMMANDS.md) 참고

### 그래도 안 되면
- 📧 Email: dev@insu-brain.com
- 💬 Slack: #insu-brain-support
- 🐛 GitHub Issues

---

## 🎊 You're Ready!

모든 준비가 끝났습니다. 즐거운 개발 되세요!

```bash
npm run dev
```

**Happy Coding!** 💛

---

<p align="center">
  <strong>Built with ❤️ for KB손해보험</strong><br/>
  Copyright © 2026 Insu-Brain Team
</p>
