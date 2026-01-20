/**
 * Playwright를 사용한 동적 페이지 크롤러
 * JavaScript로 렌더링되는 협회 공시 사이트 지원
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 결과 저장 경로
const OUTPUT_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 생명보험협회 크롤링 (Playwright)
 */
async function crawlLifeInsurance() {
  console.log('\n[생명보험협회] 크롤링 시작...\n');

  let browser = null;
  const products = [];

  try {
    browser = await chromium.launch({
      headless: true, // 백그라운드 실행
      // headless: false, // 디버깅 시 false로 변경
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    console.log('페이지 로딩 중...');
    await page.goto('https://pub.insure.or.kr', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('✅ 메인 페이지 로드 완료');

    // 상품비교공시 메뉴 클릭 시도
    try {
      // 다양한 selector 시도
      const menuSelectors = [
        'text=상품비교공시',
        'a:has-text("상품비교공시")',
        'a:has-text("비교공시")',
        '.menu:has-text("상품")'
      ];

      for (const selector of menuSelectors) {
        const element = await page.$(selector);
        if (element) {
          console.log(`메뉴 발견: ${selector}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          break;
        }
      }
    } catch (error) {
      console.log('⚠️  메뉴 클릭 실패, 직접 URL 접근 시도');
    }

    // 직접 URL 접근
    const urls = [
      'https://pub.insure.or.kr/compareDis/product/list.do',
      'https://pub.insure.or.kr/compare',
      'https://pub.insure.or.kr/compareDis'
    ];

    for (const url of urls) {
      try {
        console.log(`\n시도: ${url}`);
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 60000
        });

        // 페이지 렌더링 대기
        await page.waitForTimeout(3000);

        // 테이블 확인
        const tables = await page.$$('table');
        console.log(`테이블 발견: ${tables.length}개`);

        if (tables.length > 0) {
          // 테이블 데이터 추출
          const rows = await page.$$('table tbody tr');
          console.log(`행 발견: ${rows.length}개`);

          for (const row of rows.slice(0, 100)) { // 최대 100개
            const cells = await row.$$('td');
            if (cells.length >= 2) {
              const texts = await Promise.all(
                cells.map(cell => cell.textContent())
              );

              // PDF 링크 찾기
              const pdfLink = await row.$('a[href*=".pdf"]');
              const pdfUrl = pdfLink ? await pdfLink.getAttribute('href') : '';

              products.push({
                company: texts[0]?.trim() || '',
                productName: texts[1]?.trim() || '',
                category: texts[2]?.trim() || '',
                publicationDate: texts[3]?.trim() || '',
                pdfUrl: pdfUrl,
                source: 'life_insurance_association'
              });
            }
          }

          console.log(`✅ ${products.length}개 상품 수집`);
          break; // 성공하면 루프 종료
        }
      } catch (error) {
        console.log(`❌ 실패: ${error.message}`);
      }
    }

    await browser.close();
    return products;

  } catch (error) {
    console.error('❌ 크롤링 실패:', error.message);
    if (browser) await browser.close();
    return products;
  }
}

/**
 * 손해보험협회 크롤링 (Playwright)
 */
async function crawlPropertyInsurance() {
  console.log('\n[손해보험협회] 크롤링 시작...\n');

  let browser = null;
  const products = [];

  try {
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    console.log('페이지 로딩 중...');
    await page.goto('https://kpub.knia.or.kr/productDisc/guide/productInf.do', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('✅ 페이지 로드 완료');

    // 렌더링 대기
    await page.waitForTimeout(3000);

    // 테이블 또는 목록 확인
    const tables = await page.$$('table');
    const lists = await page.$$('.product-list, .list, .grid');

    console.log(`테이블: ${tables.length}개, 목록: ${lists.length}개`);

    if (tables.length > 0) {
      const rows = await page.$$('table tbody tr');
      console.log(`행: ${rows.length}개`);

      for (const row of rows.slice(0, 100)) {
        const cells = await row.$$('td');
        if (cells.length >= 2) {
          const texts = await Promise.all(
            cells.map(cell => cell.textContent())
          );

          const pdfLink = await row.$('a[href*=".pdf"]');
          const pdfUrl = pdfLink ? await pdfLink.getAttribute('href') : '';

          products.push({
            company: texts[0]?.trim() || '',
            productName: texts[1]?.trim() || '',
            category: texts[2]?.trim() || '',
            publicationDate: texts[3]?.trim() || '',
            pdfUrl: pdfUrl,
            source: 'property_insurance_association'
          });
        }
      }
    }

    console.log(`✅ ${products.length}개 상품 수집`);

    await browser.close();
    return products;

  } catch (error) {
    console.error('❌ 크롤링 실패:', error.message);
    if (browser) await browser.close();
    return products;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('='.repeat(60));
  console.log('보험 약관 자동 수집 시스템 v2.0 (Playwright)');
  console.log('='.repeat(60));

  const allProducts = [];

  // 1. 생명보험협회
  const lifeProducts = await crawlLifeInsurance();
  allProducts.push(...lifeProducts);

  // 2. 손해보험협회
  const propertyProducts = await crawlPropertyInsurance();
  allProducts.push(...propertyProducts);

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
    const csvContent = [
      'company,productName,category,publicationDate,pdfUrl,source',
      ...allProducts.map(p =>
        `"${p.company}","${p.productName}","${p.category}","${p.publicationDate}","${p.pdfUrl}","${p.source}"`
      )
    ].join('\n');

    fs.writeFileSync(csvFile, csvContent, 'utf8');
    console.log(`📊 CSV: ${csvFile}\n`);
  }

  return allProducts;
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { crawlLifeInsurance, crawlPropertyInsurance };
