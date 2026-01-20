# 📚 Insu-Brain KB Pilot - Complete Index

## 🎯 Quick Navigation

### For First-Time Users
1. Start here → [README.md](README.md)
2. Installation → [SETUP.md](SETUP.md)
3. Run `npm run dev`

### For Developers
1. Project overview → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Command cheatsheet → [COMMANDS.md](COMMANDS.md)
3. File structure → See below

### For Compliance Officers
1. Legal guide → [COMPLIANCE.md](COMPLIANCE.md)
2. Watermark logic → [lib/utils.ts](lib/utils.ts)
3. Warning modal → [components/compliance-alert.tsx](components/compliance-alert.tsx)

---

## 📁 Complete File Structure

```
Insu-Brain/
│
├── 📘 Documentation (읽어보세요!)
│   ├── README.md              ⭐ Start here - 프로젝트 개요
│   ├── SETUP.md               🚀 5분 빠른 설치
│   ├── COMPLIANCE.md          ⚠️  법적 준수사항 (중요!)
│   ├── PROJECT_SUMMARY.md     📊 완료 보고서
│   ├── COMMANDS.md            ⚡ 명령어 모음
│   └── INDEX.md               📚 본 문서
│
├── 🎨 Application Code
│   ├── app/
│   │   ├── layout.tsx         → 메인 레이아웃 (헤더/푸터)
│   │   ├── page.tsx           → 홈페이지 (탭 구조)
│   │   └── globals.css        → 글로벌 스타일 (KB Yellow)
│   │
│   ├── components/
│   │   ├── comparison-tab.tsx      → Tab 1: 상품 비교
│   │   ├── recommendation-tab.tsx  → Tab 2: AI 추천
│   │   ├── compliance-alert.tsx    → 법적 경고 모달 ⚠️
│   │   ├── pdf-viewer-modal.tsx    → 약관 PDF 뷰어
│   │   │
│   │   └── ui/                     → Shadcn/UI 컴포넌트
│   │       ├── button.tsx
│   │       ├── tabs.tsx
│   │       ├── dialog.tsx
│   │       └── select.tsx
│   │
│   └── lib/
│       ├── utils.ts           → 유틸리티 (워터마크 핵심 로직!) 🔑
│       └── supabase.ts        → DB 클라이언트 & 타입
│
├── 🗄️ Database
│   └── supabase/
│       └── schema.sql         → 데이터베이스 스키마 + Seed 데이터
│
├── ⚙️ Configuration
│   ├── package.json           → 의존성 목록
│   ├── tsconfig.json          → TypeScript 설정
│   ├── tailwind.config.ts     → Tailwind (KB Yellow 테마)
│   ├── next.config.js         → Next.js 설정
│   ├── postcss.config.js      → PostCSS
│   ├── .eslintrc.json         → ESLint 규칙
│   ├── .gitignore             → Git 무시 파일
│   └── .env.local.example     → 환경 변수 예시
│
└── 🔒 Private (gitignore됨)
    ├── .env.local             → Supabase 키 (생성 필요!)
    ├── node_modules/          → 의존성 패키지
    └── .next/                 → 빌드 결과물
```

---

## 🗺️ Component Dependency Map

```
app/page.tsx (메인 페이지)
│
├─→ ComparisonTab
│   ├─→ Select (UI)
│   ├─→ Button (UI)
│   ├─→ ComplianceAlert 🔒
│   └─→ PdfViewerModal
│
└─→ RecommendationTab
    ├─→ Select (UI)
    ├─→ Button (UI)
    └─→ ComplianceAlert 🔒

ComplianceAlert (법적 경고)
├─→ Dialog (UI)
├─→ DialogHeader
├─→ DialogFooter
└─→ Button (UI)

워터마크 시스템
lib/utils.ts → exportWithWatermark()
└─→ html2canvas (패키지)
```

---

## 📋 Feature Checklist

### ✅ Completed (MVP)
- [x] KB Yellow 브랜딩
- [x] 2개 탭 시스템 (비교/추천)
- [x] Mock AI 분석
- [x] Rule-based 추천
- [x] 워터마크 시스템
- [x] 법적 경고 모달
- [x] PDF 뷰어 (iframe)
- [x] Supabase 스키마
- [x] 반응형 레이아웃 (데스크톱)

### 🚧 In Progress (Post-MVP)
- [ ] Supabase 실제 연동
- [ ] n8n AI Workflow
- [ ] 설계사 로그인
- [ ] 실제 약관 PDF 업로드

### 💡 Future Enhancements
- [ ] 모바일 최적화
- [ ] 사용 로그 대시보드
- [ ] A/B 테스트
- [ ] 다국어 지원

---

## 🔑 Key Files Explained

### 1. [lib/utils.ts](lib/utils.ts) - 워터마크 핵심 로직
```typescript
export async function exportWithWatermark(
  elementId: string,
  filename: string = "insu-brain-result.png"
): Promise<void>
```
- DOM 요소를 복제
- 하단 Disclaimer Bar 추가
- 대각선 워터마크 추가
- html2canvas로 이미지 생성
- 자동 다운로드

### 2. [components/compliance-alert.tsx](components/compliance-alert.tsx) - 법적 경고
```typescript
interface ComplianceAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}
```
- 과태료 3천만원 명시
- 체크박스 동의 필수
- 동의 전까지 저장 버튼 비활성화

### 3. [supabase/schema.sql](supabase/schema.sql) - 데이터베이스
- `insurance_companies`: 15개 보험사 마스터
- `insurance_products`: 상품 마스터
- `recommendation_rules`: 추천 규칙
- `match_recommendation_rules()`: 추천 함수

### 4. [tailwind.config.ts](tailwind.config.ts) - KB Yellow 테마
```typescript
colors: {
  kb: {
    yellow: '#ffbc00',
    dark: '#1a1a1a',
    gray: '#2a2a2a',
  }
}
```

---

## 🎓 Learning Resources

### Next.js 14
- [Official Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Supabase
- [Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Tailwind CSS
- [Utility Classes](https://tailwindcss.com/docs)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)

### html2canvas
- [API Documentation](https://html2canvas.hertzen.com/documentation)

---

## 🔄 Development Workflow

### Day-to-Day Development
1. `npm run dev` - Start server
2. Edit components in `components/`
3. Save → Auto-reload
4. Check browser console for errors

### Before Commit
1. `npm run build` - Check for build errors
2. `npm run lint` - Check code style
3. Test on multiple browsers
4. Update documentation if needed

### Before Deployment
1. Update `.env.local` with production values
2. `npm run build` - Final production build
3. `vercel --prod` - Deploy

---

## 📞 Support Matrix

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Installation Help | [SETUP.md](SETUP.md) | Self-service |
| Build Errors | dev@insu-brain.com | 1 business day |
| Security Issues | security@kb.co.kr | 2 hours |
| Compliance Questions | [COMPLIANCE.md](COMPLIANCE.md) | Self-service |
| Feature Requests | GitHub Issues | 1 week |

---

## 🏆 Contributors

- **Lead Developer**: Claude (Anthropic AI)
- **Product Owner**: KB손해보험 디지털혁신팀
- **Compliance Advisor**: KB 준법감시팀
- **UI/UX Designer**: KB 디자인팀

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-01-19 | 🎉 Initial MVP Release |
|  |  | - KB Yellow 브랜딩 |
|  |  | - 2개 탭 시스템 |
|  |  | - 워터마크 & 경고 모달 |
|  |  | - Supabase 스키마 |

---

## 🎯 Quick Start (3 Steps)

```bash
# 1. Install
npm install

# 2. Setup Supabase (optional for demo)
# Follow SETUP.md

# 3. Run
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

---

## 🔗 Important Links

- **GitHub Repo**: (Add your repo URL)
- **Live Demo**: (Add Vercel URL after deploy)
- **Supabase Dashboard**: https://app.supabase.com
- **n8n Workflow**: http://localhost:5678 (if running)
- **KB손해보험**: https://www.kbinsure.co.kr

---

**📌 Bookmark this INDEX.md for quick navigation!**

Last Updated: 2026-01-19
