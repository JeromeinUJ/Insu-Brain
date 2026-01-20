/**
 * 디버깅용 크롤러 - 스크린샷과 HTML 저장
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugSite() {
  console.log('\n=== 디버깅 크롤러 시작 ===\n');

  const browser = await chromium.launch({
    headless: false, // 브라우저 창 보이게
    slowMo: 1000, // 느리게 실행
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('1. 생명보험협회 메인 페이지 접근...');
    await page.goto('https://pub.insure.or.kr', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    // 스크린샷 저장
    await page.screenshot({ path: 'crawler/debug_main.png', fullPage: true });
    console.log('✅ 스크린샷 저장: debug_main.png');

    // HTML 저장
    const html = await page.content();
    fs.writeFileSync('crawler/debug_main.html', html, 'utf8');
    console.log('✅ HTML 저장: debug_main.html');

    // 페이지에서 사용 가능한 모든 링크 찾기
    console.log('\n2. 페이지 내 링크 분석:');
    const links = await page.$$eval('a', anchors =>
      anchors
        .map(a => ({ text: a.textContent.trim(), href: a.href }))
        .filter(l => l.text.includes('비교') || l.text.includes('공시') || l.text.includes('상품'))
        .slice(0, 20)
    );

    console.log('관련 링크:');
    links.forEach(link => {
      console.log(`  - ${link.text}: ${link.href}`);
    });

    // 상품비교공시 링크 클릭 시도
    console.log('\n3. 상품비교공시 메뉴 클릭 시도...');

    const menuLink = await page.$('a:has-text("상품비교")');
    if (menuLink) {
      const href = await menuLink.getAttribute('href');
      console.log(`발견된 링크: ${href}`);

      await menuLink.click();
      await page.waitForTimeout(5000);

      await page.screenshot({ path: 'crawler/debug_compare.png', fullPage: true });
      console.log('✅ 스크린샷 저장: debug_compare.png');

      const compareHtml = await page.content();
      fs.writeFileSync('crawler/debug_compare.html', compareHtml, 'utf8');
      console.log('✅ HTML 저장: debug_compare.html');

      // 테이블 확인
      const tables = await page.$$('table');
      console.log(`\n테이블 발견: ${tables.length}개`);

      if (tables.length > 0) {
        const rows = await page.$$('table tr');
        console.log(`행 발견: ${rows.length}개`);

        // 첫 5행 출력
        console.log('\n첫 5행 샘플:');
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const text = await rows[i].textContent();
          console.log(`  행${i}: ${text.trim().substring(0, 100)}`);
        }
      }
    } else {
      console.log('❌ 상품비교 링크를 찾을 수 없습니다.');
    }

    console.log('\n4. 브라우저를 10초간 열어둡니다. 수동으로 확인하세요...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== 디버깅 완료 ===');
  console.log('\n확인할 파일:');
  console.log('  - crawler/debug_main.png');
  console.log('  - crawler/debug_main.html');
  console.log('  - crawler/debug_compare.png');
  console.log('  - crawler/debug_compare.html');
}

debugSite();
