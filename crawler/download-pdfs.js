/**
 * PDF 자동 다운로드 스크립트 (Playwright 사용)
 *
 * 동적 웹사이트 지원 (JavaScript 렌더링)
 * CAPTCHA가 없는 사이트에서만 작동
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 다운로드 디렉토리
const DOWNLOAD_DIR = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

/**
 * 간단한 PDF 다운로드 (직접 링크가 있는 경우)
 */
async function downloadPDFDirect(url, filename) {
  try {
    console.log(`📥 다운로드 시작: ${filename}`);

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filePath = path.join(DOWNLOAD_DIR, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ 다운로드 완료: ${filename}`);
        resolve(filePath);
      });
      writer.on('error', reject);
    });

  } catch (error) {
    console.error(`❌ 다운로드 실패 (${filename}):`, error.message);
    return null;
  }
}

/**
 * Playwright를 사용한 동적 페이지 PDF 다운로드
 */
async function downloadPDFWithBrowser(pageUrl, filename) {
  let browser = null;

  try {
    console.log(`🌐 브라우저로 접근: ${pageUrl}`);

    browser = await chromium.launch({
      headless: true, // 백그라운드 실행
      // headless: false, // 디버깅 시 false로 설정
    });

    const context = await browser.newContext({
      acceptDownloads: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    // 페이지 로드
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // PDF 다운로드 버튼 찾기 및 클릭 (사이트마다 다름)
    const downloadSelectors = [
      'a:has-text("약관보기")',
      'a:has-text("약관다운로드")',
      'a[href*=".pdf"]',
      'button:has-text("다운로드")',
      '.btn-download',
    ];

    let downloadStarted = false;

    for (const selector of downloadSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`🔍 다운로드 버튼 발견: ${selector}`);

          // 다운로드 대기
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 30000 }),
            element.click()
          ]);

          // 파일 저장
          const filePath = path.join(DOWNLOAD_DIR, filename);
          await download.saveAs(filePath);

          console.log(`✅ 다운로드 완료: ${filename}`);
          downloadStarted = true;
          break;
        }
      } catch (error) {
        // 다음 selector 시도
        continue;
      }
    }

    if (!downloadStarted) {
      console.log('⚠️  다운로드 버튼을 찾을 수 없습니다.');

      // PDF 링크 직접 추출 시도
      const pdfLinks = await page.$$eval('a[href*=".pdf"]', links =>
        links.map(link => link.href)
      );

      if (pdfLinks.length > 0) {
        console.log(`📎 PDF 링크 발견: ${pdfLinks[0]}`);
        await browser.close();
        return await downloadPDFDirect(pdfLinks[0], filename);
      }
    }

    await browser.close();
    return downloadStarted;

  } catch (error) {
    console.error(`❌ 브라우저 다운로드 실패 (${filename}):`, error.message);
    if (browser) await browser.close();
    return null;
  }
}

/**
 * 상품 목록에서 PDF 일괄 다운로드
 */
async function downloadAllPDFs(products) {
  console.log('\n=== PDF 일괄 다운로드 시작 ===\n');
  console.log(`총 ${products.length}개 상품\n`);

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${product.productName}`);

    // 파일명 생성 (특수문자 제거)
    const safeFilename = `${product.company}_${product.productName}`
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '') + '.pdf';

    // 이미 다운로드된 파일은 스킵
    const filePath = path.join(DOWNLOAD_DIR, safeFilename);
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  이미 존재: ${safeFilename}`);
      results.skipped.push(product.productName);
      continue;
    }

    // PDF URL이 있는 경우 직접 다운로드
    if (product.pdfUrl && product.pdfUrl.startsWith('http')) {
      const result = await downloadPDFDirect(product.pdfUrl, safeFilename);
      if (result) {
        results.success.push(product.productName);
      } else {
        results.failed.push(product.productName);
      }
    } else {
      console.log('⚠️  PDF URL 없음 - 브라우저 접근 필요');
      results.failed.push(product.productName);
    }

    // 요청 간격 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 다운로드 결과');
  console.log('='.repeat(60));
  console.log(`✅ 성공: ${results.success.length}개`);
  console.log(`❌ 실패: ${results.failed.length}개`);
  console.log(`⏭️  스킵: ${results.skipped.length}개`);
  console.log('='.repeat(60) + '\n');

  if (results.failed.length > 0) {
    console.log('실패한 상품:');
    results.failed.forEach(name => console.log(`  - ${name}`));
    console.log('');
  }

  return results;
}

/**
 * 메인 실행 함수
 */
async function main() {
  // 크롤링된 상품 목록 로드
  const dataDir = path.join(__dirname, 'data');

  if (!fs.existsSync(dataDir)) {
    console.error('❌ data/ 폴더가 없습니다.');
    console.log('먼저 crawl-insurance-list.js를 실행하세요.\n');
    return;
  }

  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('products_') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ 상품 목록 파일이 없습니다.');
    console.log('먼저 crawl-insurance-list.js를 실행하세요.\n');
    return;
  }

  const latestFile = path.join(dataDir, files[0]);
  console.log(`📂 로딩: ${latestFile}\n`);

  const products = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

  // PDF 다운로드 실행
  await downloadAllPDFs(products);
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadPDFDirect, downloadPDFWithBrowser, downloadAllPDFs };
