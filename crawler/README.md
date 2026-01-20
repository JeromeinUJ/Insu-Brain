# 🤖 보험 약관 자동 수집 시스템

실제 운영용 보험 약관 PDF 자동 수집 및 업데이트 시스템

---

## 📋 시스템 개요

### 목적
- 매달 자동으로 전체 보험사의 약관을 수집
- 수동 작업 없이 데이터베이스 자동 업데이트
- 법적 리스크 최소화 (공개 API 및 공시 데이터 활용)

### 데이터 출처
1. **생명보험협회 공시실** ([pub.insure.or.kr](https://pub.insure.or.kr))
2. **손해보험협회 공시실** ([kpub.knia.or.kr](https://kpub.knia.or.kr))
3. **금융감독원 통합공시** ([fine.fss.or.kr](https://fine.fss.or.kr))
4. **개별 보험사 공시실** (필요 시)

---

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
cd crawler
npm install
```

설치되는 패키지:
- `axios` - HTTP 요청
- `cheerio` - HTML 파싱
- `playwright` - 동적 웹 크롤링

### 2. 상품 목록 수집
```bash
npm run crawl
```

출력:
- `crawler/data/products_{timestamp}.json` - 전체 상품 목록
- `crawler/data/products_{timestamp}.csv` - CSV 형식

### 3. PDF 다운로드
```bash
npm run download
```

출력:
- `pdfs/*.pdf` - 다운로드된 약관 파일

### 4. Supabase 업로드
```bash
cd ..
node upload-pdfs.js
```

자동으로:
- ✅ Supabase Storage에 업로드
- ✅ 데이터베이스 pdf_url 업데이트

---

## 📂 파일 구조

```
crawler/
├── package.json                    # 패키지 설정
├── crawl-insurance-list.js         # 상품 목록 크롤링
├── download-pdfs.js                # PDF 자동 다운로드
├── test-crawler.js                 # 테스트 스크립트
├── data/                           # 크롤링 결과 저장
│   ├── products_1234567890.json
│   └── products_1234567890.csv
└── README.md                       # 이 파일

../pdfs/                            # 다운로드된 PDF
└── KB손해보험_KB간편건강보험.pdf
```

---

## 🎯 작동 원리

### Step 1: 상품 목록 수집 (crawl-insurance-list.js)

**생명보험협회 크롤링:**
```javascript
const response = await axios.get('https://pub.insure.or.kr/compareDis/product/list.do');
const $ = cheerio.load(response.data);

// 테이블에서 상품 정보 추출
$('table tbody tr').each((i, el) => {
  const product = {
    company: $(el).find('td:nth-child(1)').text(),
    productName: $(el).find('td:nth-child(2)').text(),
    pdfUrl: $(el).find('a[href*=".pdf"]').attr('href')
  };
  products.push(product);
});
```

**손해보험협회 크롤링:**
```javascript
const response = await axios.get('https://kpub.knia.or.kr/productDisc/guide/productInf.do');
// 동일한 방식으로 파싱
```

---

### Step 2: PDF 다운로드 (download-pdfs.js)

**직접 링크가 있는 경우:**
```javascript
async function downloadPDFDirect(url, filename) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filename);
  response.data.pipe(writer);
}
```

**동적 페이지인 경우 (Playwright 사용):**
```javascript
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(pageUrl);

// "약관보기" 버튼 클릭
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('a:has-text("약관보기")')
]);

await download.saveAs(filename);
```

---

## ⚙️ 설정 및 커스터마이징

### 크롤링 대상 추가

`crawl-insurance-list.js`에 함수 추가:

```javascript
async function crawlSamsungInsurance() {
  const url = 'https://www.samsungfire.com/disclosure';
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // 삼성화재 사이트 구조에 맞게 파싱
  const products = [];
  $('.product-item').each((i, el) => {
    products.push({
      company: '삼성화재',
      productName: $(el).find('.name').text(),
      pdfUrl: $(el).find('a.download').attr('href')
    });
  });

  return products;
}

// main() 함수에 추가
async function main() {
  const lifeProducts = await crawlLifeInsuranceProducts();
  const propertyProducts = await crawlPropertyInsuranceProducts();
  const samsungProducts = await crawlSamsungInsurance(); // 추가

  const allProducts = [...lifeProducts, ...propertyProducts, ...samsungProducts];
  // ...
}
```

---

## 🔄 정기 실행 (Cron / 스케줄러)

### Linux / Mac (Crontab)

```bash
# 매달 1일 새벽 3시에 실행
0 3 1 * * cd /path/to/Insu-Brain/crawler && npm run crawl && npm run download && cd .. && node upload-pdfs.js
```

### Windows (작업 스케줄러)

1. 작업 스케줄러 열기
2. "기본 작업 만들기"
3. 트리거: 매월 1일 03:00
4. 동작: 프로그램 시작
   - 프로그램: `node`
   - 인수: `E:\...\Insu-Brain\crawler\crawl-insurance-list.js`

### GitHub Actions (클라우드)

`.github/workflows/crawl-insurance.yml`:

```yaml
name: Monthly Insurance Crawl

on:
  schedule:
    - cron: '0 3 1 * *'  # 매달 1일 03:00 UTC

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd crawler && npm install
      - run: cd crawler && npm run crawl
      - run: cd crawler && npm run download
      - run: node upload-pdfs.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## 🚨 법적 준수사항

### ✅ 허용되는 데이터 수집

1. **공시실 데이터**
   - 생명/손해보험협회 공시 데이터는 공개 정보
   - 법적 의무로 공시된 약관
   - robots.txt 확인 필수

2. **금융감독원 데이터**
   - 공공데이터포털 API 활용 (합법)
   - 이용 신청 후 API 키 발급

3. **개별 보험사 공시실**
   - 공시 의무 데이터는 수집 가능
   - 단, robots.txt 및 이용약관 준수

### ⚠️ 주의사항

1. **과도한 요청 금지**
   ```javascript
   // 요청 간 2초 대기 (서버 부하 방지)
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

2. **User-Agent 명시**
   ```javascript
   headers: {
     'User-Agent': 'InsuranceCrawler/1.0 (contact@insu-brain.com)'
   }
   ```

3. **저작권 존중**
   - 약관 원문은 저작물
   - 비영리 연구 목적 → OK
   - 상업적 재판매 → 라이선스 필요

---

## 🔧 문제 해결

### Q: "Connection timeout" 오류

```javascript
// timeout 증가
const response = await axios.get(url, {
  timeout: 60000  // 60초
});
```

### Q: CAPTCHA 때문에 다운로드 안 됨

**해결책 1: 협회 사이트 우선 사용**
- 개별 보험사보다 협회 사이트가 CAPTCHA 없음

**해결책 2: 수동 + 자동 하이브리드**
- CAPTCHA 있는 사이트만 수동 다운로드
- 나머지는 자동화

**해결책 3: OCR CAPTCHA 우회 (비추천)**
- 법적 문제 발생 가능

### Q: HTML 구조가 변경됨

```bash
# 테스트 스크립트로 구조 확인
node test-crawler.js
```

변경된 selector를 `crawl-insurance-list.js`에 업데이트:
```javascript
// 기존
$('table tbody tr')

// 변경 후
$('.product-list .item')
```

---

## 📊 성능 및 확장성

### 현재 성능
- 상품 목록 수집: ~5초 (200개 상품)
- PDF 다운로드: ~30분 (200개 PDF, 평균 9초/개)
- Supabase 업로드: ~5분

### 확장 방안

**1. 병렬 처리**
```javascript
// 순차 처리 (느림)
for (const product of products) {
  await downloadPDF(product);
}

// 병렬 처리 (빠름)
await Promise.all(
  products.map(product => downloadPDF(product))
);
```

**2. 캐싱**
```javascript
// 이미 다운로드된 파일은 스킵
if (fs.existsSync(filePath)) {
  console.log('이미 존재');
  return;
}
```

**3. 분산 처리**
- AWS Lambda로 각 보험사별 크롤러 분리
- 동시 실행으로 시간 단축

---

## 🎯 로드맵

### Phase 1 (현재)
- ✅ 협회 사이트 크롤링
- ✅ 직접 링크 PDF 다운로드
- ✅ Supabase 자동 업로드

### Phase 2 (1개월)
- [ ] 15개 주요 보험사 개별 크롤러
- [ ] Playwright 동적 페이지 처리
- [ ] GitHub Actions 자동화

### Phase 3 (3개월)
- [ ] PDF 텍스트 추출 (OCR)
- [ ] Vector Store 구축
- [ ] n8n AI 비교 로직 연동

### Phase 4 (6개월)
- [ ] 약관 변경 감지 알림
- [ ] 자동 비교 분석 리포트
- [ ] 대시보드 (어떤 약관이 자주 변경되는지)

---

## 💡 추가 아이디어

### 약관 변경 감지
```javascript
// 이전 버전과 비교
const oldPDF = fs.readFileSync('old/KB간편건강보험.pdf');
const newPDF = fs.readFileSync('pdfs/KB간편건강보험.pdf');

if (oldPDF.equals(newPDF)) {
  console.log('변경 없음');
} else {
  console.log('⚠️ 약관 변경 감지!');
  sendNotification('KB간편건강보험 약관이 변경되었습니다.');
}
```

### 통계 대시보드
```javascript
// 크롤링 통계
const stats = {
  totalProducts: 200,
  totalPDFs: 180,
  lastUpdate: '2026-01-20',
  mostChangedProduct: 'KB 암보험 (3회 변경)',
  avgPDFSize: '2.5MB'
};
```

---

## 📞 지원

문제가 발생하면:
1. `crawler/data/` 폴더의 로그 확인
2. `node test-crawler.js`로 테스트
3. GitHub Issues에 문의

---

**다음 단계:**
```bash
npm run crawl
```
를 실행해보세요! 🚀
