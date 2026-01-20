/**
 * 모든 발견된 URL 크롤링
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function crawlAllUrls() {
  console.log('\n=== 전체 URL 크롤링 시작 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const allProducts = [];

  // 발견된 모든 URL
  const urls = [
    { url: 'https://pub.insure.or.kr/summary/disRegal/list.do', name: '공시관련 규정' },
    { url: 'https://pub.insure.or.kr/summary/decide/list.do', name: '의결사항' },
    { url: 'https://pub.insure.or.kr/compareDis/mdclInsrn/contChange/info.do', name: '계약전환제도 안내' },
    { url: 'https://pub.insure.or.kr/compareDis/mdclInsrn/contChange/prod.do', name: '세대별 상품 비교' },
    { url: 'https://pub.insure.or.kr/compareSummary/saving/list.do', name: '저축성 요약공시' },
    { url: 'https://pub.insure.or.kr/mngtDis/mngtDis/list.do', name: '정기공시' },
    { url: 'https://pub.insure.or.kr/mngtDis/frequentDis/list.do', name: '수시공시' },
    { url: 'https://pub.insure.or.kr/mngtDis/corpGov/list.do', name: '지배구조공시' },
    { url: 'https://pub.insure.or.kr/loan/type/householdLoanNew/list.do', name: '대출유형별공시' },
    { url: 'https://pub.insure.or.kr/loan/type/insLoan/list.do', name: '보험계약대출' },
    { url: 'https://pub.insure.or.kr/loan/type/loanFee/list.do', name: '대출수수료' },
    { url: 'https://pub.insure.or.kr/loan/type/businessInterRate/list.do', name: '중소기업대출' },
    // 손해보험협회
    { url: 'https://kpub.knia.or.kr/productDisc/guide/productInf.do', name: '손보협회 상품공시' },
  ];

  for (const { url, name } of urls) {
    console.log(`\n📄 ${name}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000
      });

      await page.waitForTimeout(3000);

      // 테이블 데이터 추출
      const rows = await page.$$('table tbody tr, table tr');
      let extracted = 0;

      for (const row of rows) {
        try {
          const cells = await row.$$('td, th');
          if (cells.length >= 2) {
            const texts = [];
            for (const cell of cells) {
              const text = await cell.textContent();
              texts.push(text.trim());
            }

            // 헤더가 아닌 실제 데이터만
            if (texts[0] &&
                !texts[0].includes('번호') &&
                !texts[0].includes('No') &&
                !texts[0].includes('구분') &&
                texts[0].length > 0 &&
                texts[0] !== '0') {

              // PDF 링크 찾기
              const pdfLink = await row.$('a[href*=".pdf"]');
              const pdfUrl = pdfLink ? await pdfLink.getAttribute('href') : '';

              const product = {
                company: texts[0] || '',
                productName: texts[1] || '',
                category: texts[2] || '',
                date: texts[3] || '',
                details: texts.slice(4).join(' | '),
                pdfUrl: pdfUrl,
                source: name,
                sourceUrl: url
              };

              // 최소한의 데이터 검증
              if (product.productName && product.productName.length > 2) {
                allProducts.push(product);
                extracted++;
              }
            }
          }
        } catch (error) {
          // 개별 행 에러는 무시
        }
      }

      console.log(`   ✅ ${extracted}개 수집 (누적: ${allProducts.length}개)`);

    } catch (error) {
      console.log(`   ❌ 실패: ${error.message}`);
    }
  }

  await browser.close();

  // 결과 저장
  const timestamp = Date.now();
  const outputFile = path.join(OUTPUT_DIR, `products_final_${timestamp}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 총 ${allProducts.length}개 상품 수집 완료!`);
  console.log(`📁 JSON: ${outputFile}`);
  console.log('='.repeat(60));

  // CSV 저장
  if (allProducts.length > 0) {
    const csvFile = path.join(OUTPUT_DIR, `products_final_${timestamp}.csv`);
    const headers = ['company', 'productName', 'category', 'date', 'details', 'pdfUrl', 'source', 'sourceUrl'];
    const csvContent = [
      headers.join(','),
      ...allProducts.map(p =>
        headers.map(h => `"${(p[h] || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(',')
      )
    ].join('\n');

    fs.writeFileSync(csvFile, csvContent, 'utf8');
    console.log(`📊 CSV: ${csvFile}`);
  }

  // 통계
  console.log('\n📊 수집 통계:');
  const bySource = {};
  allProducts.forEach(p => {
    bySource[p.source] = (bySource[p.source] || 0) + 1;
  });
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`   ${source}: ${count}개`);
  });

  console.log('\n');
  return allProducts;
}

crawlAllUrls();
