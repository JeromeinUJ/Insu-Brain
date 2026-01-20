/**
 * 추가 데이터 URL 탐색기
 */

const { chromium } = require('playwright');

async function findMoreUrls() {
  console.log('\n=== 추가 URL 탐색 시작 ===\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const discoveredUrls = [];

  // 1. 생명보험협회 전체 메뉴 탐색
  console.log('1. 생명보험협회 메뉴 탐색...');
  await page.goto('https://pub.insure.or.kr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const lifeLinks = await page.$$eval('a[href]', links =>
    links
      .map(a => ({ text: a.textContent.trim(), href: a.href }))
      .filter(l =>
        l.href.includes('pub.insure.or.kr') &&
        (l.href.includes('compare') ||
         l.href.includes('Dis') ||
         l.href.includes('list') ||
         l.href.includes('product'))
      )
  );

  console.log(`   발견: ${lifeLinks.length}개 링크`);
  lifeLinks.forEach(link => {
    if (!discoveredUrls.find(u => u.url === link.href)) {
      discoveredUrls.push({
        url: link.href,
        text: link.text,
        source: '생명보험협회'
      });
    }
  });

  // 2. 손해보험협회 전체 메뉴 탐색
  console.log('\n2. 손해보험협회 메뉴 탐색...');
  await page.goto('https://www.knia.or.kr', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const propertyLinks = await page.$$eval('a[href]', links =>
    links
      .map(a => ({ text: a.textContent.trim(), href: a.href }))
      .filter(l =>
        l.href.includes('knia.or.kr') &&
        (l.href.includes('product') ||
         l.href.includes('disc') ||
         l.href.includes('list') ||
         l.href.includes('compare'))
      )
  );

  console.log(`   발견: ${propertyLinks.length}개 링크`);
  propertyLinks.forEach(link => {
    if (!discoveredUrls.find(u => u.url === link.href)) {
      discoveredUrls.push({
        url: link.href,
        text: link.text,
        source: '손해보험협회'
      });
    }
  });

  // 3. 각 URL 테스트 (테이블이 있는지 확인)
  console.log('\n3. URL 검증 중...\n');

  const validUrls = [];

  for (const item of discoveredUrls.slice(0, 20)) { // 처음 20개만 테스트
    try {
      await page.goto(item.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      await page.waitForTimeout(2000);

      const tables = await page.$$('table');
      const rows = await page.$$('table tr');

      if (tables.length > 0 && rows.length > 5) {
        console.log(`✅ ${item.text}`);
        console.log(`   ${item.url}`);
        console.log(`   테이블: ${tables.length}개, 행: ${rows.length}개\n`);

        validUrls.push({
          ...item,
          tableCount: tables.length,
          rowCount: rows.length
        });
      }
    } catch (error) {
      // 타임아웃이나 에러는 무시
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 유효한 데이터 페이지: ${validUrls.length}개 발견`);
  console.log('='.repeat(60));

  console.log('\n사용 가능한 URL 목록:\n');
  validUrls.forEach((item, i) => {
    console.log(`${i + 1}. ${item.text} (${item.rowCount}행)`);
    console.log(`   ${item.url}\n`);
  });

  return validUrls;
}

findMoreUrls();
