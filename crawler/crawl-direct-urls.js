/**
 * 직접 URL 접근 크롤러
 * 발견된 실제 데이터 페이지 URL 사용
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function crawlDirectUrls() {
  console.log('\n=== 직접 URL 크롤링 시작 ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const allProducts = [];

  // 발견된 실제 데이터 페이지 URL들
  const urls = [
    {
      url: 'https://pub.insure.or.kr/compareDis/mdclInsrn/contChange/prod.do',
      name: '생명보험협회 - 세대별 상품 비교'
    },
    {
      url: 'https://pub.insure.or.kr/compareSummary/saving/list.do',
      name: '생명보험협회 - 저축성 요약공시'
    },
    {
      url: 'https://kpub.knia.or.kr/productDisc/guide/productInf.do',
      name: '손해보험협회 - 상품공시'
    }
  ];

  for (const { url, name } of urls) {
    console.log(`\n📄 ${name}`);
    console.log(`   URL: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 60000
      });

      // 충분한 렌더링 대기
      await page.waitForTimeout(5000);

      // 다양한 방법으로 데이터 추출 시도

      // 1. 테이블 방식
      const tables = await page.$$('table');
      console.log(`   테이블: ${tables.length}개`);

      if (tables.length > 0) {
        const rows = await page.$$('table tbody tr, table tr');
        console.log(`   행: ${rows.length}개`);

        for (const row of rows.slice(0, 50)) {
          try {
            const cells = await row.$$('td, th');
            if (cells.length >= 2) {
              const texts = [];
              for (const cell of cells) {
                const text = await cell.textContent();
                texts.push(text.trim());
              }

              // 헤더가 아닌 실제 데이터만
              if (texts[0] && !texts[0].includes('번호') && !texts[0].includes('No')) {
                const product = {
                  company: texts[0] || '',
                  productName: texts[1] || '',
                  category: texts[2] || '',
                  details: texts.slice(3).join(' | '),
                  source: name,
                  url: url
                };

                if (product.productName) {
                  allProducts.push(product);
                }
              }
            }
          } catch (error) {
            // 개별 행 에러는 무시
          }
        }
      }

      // 2. 리스트 방식
      const listItems = await page.$$('.list-item, .product-item, .item');
      console.log(`   리스트 아이템: ${listItems.length}개`);

      for (const item of listItems.slice(0, 50)) {
        try {
          const text = await item.textContent();
          if (text.trim().length > 10) {
            allProducts.push({
              productName: text.trim().substring(0, 100),
              source: name,
              url: url
            });
          }
        } catch (error) {
          // 개별 아이템 에러는 무시
        }
      }

      console.log(`   ✅ 누적: ${allProducts.length}개`);

    } catch (error) {
      console.log(`   ❌ 실패: ${error.message}`);
    }
  }

  await browser.close();

  // 결과 저장
  const timestamp = Date.now();
  const outputFile = path.join(OUTPUT_DIR, `products_${timestamp}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 총 ${allProducts.length}개 상품 수집 완료`);
  console.log(`📁 저장: ${outputFile}`);
  console.log('='.repeat(60) + '\n');

  // CSV 저장
  if (allProducts.length > 0) {
    const csvFile = path.join(OUTPUT_DIR, `products_${timestamp}.csv`);
    const headers = Object.keys(allProducts[0]);
    const csvContent = [
      headers.join(','),
      ...allProducts.map(p =>
        headers.map(h => `"${(p[h] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    fs.writeFileSync(csvFile, csvContent, 'utf8');
    console.log(`📊 CSV: ${csvFile}\n`);
  }

  return allProducts;
}

crawlDirectUrls();
