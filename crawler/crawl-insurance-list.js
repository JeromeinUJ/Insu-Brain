/**
 * 보험협회 공시 사이트에서 상품 목록 크롤링
 *
 * 데이터 출처:
 * 1. 생명보험협회: pub.insure.or.kr
 * 2. 손해보험협회: kpub.knia.or.kr
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// 크롤링 결과 저장 경로
const OUTPUT_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 생명보험협회 상품 목록 크롤링
 */
async function crawlLifeInsuranceProducts() {
  console.log('\n[생명보험협회] 상품 목록 크롤링 시작...\n');

  try {
    // 실제 URL은 사이트 구조 분석 후 업데이트 필요
    const url = 'https://pub.insure.or.kr/compareDis/product/list.do';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // 테이블 파싱 (실제 HTML 구조에 맞게 수정 필요)
    $('table tbody tr').each((index, element) => {
      const $row = $(element);

      const product = {
        company: $row.find('td:nth-child(1)').text().trim(),
        productName: $row.find('td:nth-child(2)').text().trim(),
        category: $row.find('td:nth-child(3)').text().trim(),
        publicationDate: $row.find('td:nth-child(4)').text().trim(),
        pdfUrl: $row.find('a[href*=".pdf"]').attr('href') || '',
        source: 'life_insurance_association'
      };

      if (product.productName) {
        products.push(product);
      }
    });

    console.log(`✅ 생명보험 상품 ${products.length}개 발견`);
    return products;

  } catch (error) {
    console.error('❌ 생명보험협회 크롤링 실패:', error.message);
    return [];
  }
}

/**
 * 손해보험협회 상품 목록 크롤링
 */
async function crawlPropertyInsuranceProducts() {
  console.log('\n[손해보험협회] 상품 목록 크롤링 시작...\n');

  try {
    const url = 'https://kpub.knia.or.kr/productDisc/guide/productInf.do';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // 손해보험협회 사이트 구조에 맞게 파싱
    $('table tbody tr').each((index, element) => {
      const $row = $(element);

      const product = {
        company: $row.find('td:nth-child(1)').text().trim(),
        productName: $row.find('td:nth-child(2)').text().trim(),
        category: $row.find('td:nth-child(3)').text().trim(),
        publicationDate: $row.find('td:nth-child(4)').text().trim(),
        pdfUrl: $row.find('a[href*=".pdf"]').attr('href') || '',
        source: 'property_insurance_association'
      };

      if (product.productName) {
        products.push(product);
      }
    });

    console.log(`✅ 손해보험 상품 ${products.length}개 발견`);
    return products;

  } catch (error) {
    console.error('❌ 손해보험협회 크롤링 실패:', error.message);
    return [];
  }
}

/**
 * KB손해보험 상품 목록 크롤링 (예시)
 */
async function crawlKBInsuranceProducts() {
  console.log('\n[KB손해보험] 상품 목록 크롤링 시작...\n');

  try {
    // KB 공시실 URL (실제 URL은 확인 필요)
    const url = 'https://www.kbinsure.co.kr/CG302120001.ec';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.kbinsure.co.kr'
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const products = [];

    // KB 사이트 구조에 맞게 파싱 (실제 구조 확인 필요)
    $('.product-list .item').each((index, element) => {
      const $item = $(element);

      const product = {
        company: 'KB손해보험',
        productName: $item.find('.product-name').text().trim(),
        category: $item.find('.category').text().trim(),
        pdfUrl: $item.find('a.terms-download').attr('href') || '',
        source: 'kb_insurance'
      };

      if (product.productName) {
        products.push(product);
      }
    });

    console.log(`✅ KB손해보험 상품 ${products.length}개 발견`);
    return products;

  } catch (error) {
    console.error('❌ KB손해보험 크롤링 실패:', error.message);
    return [];
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('='.repeat(60));
  console.log('보험 약관 자동 수집 시스템 v1.0');
  console.log('='.repeat(60));

  const allProducts = [];

  // 1. 생명보험협회 크롤링
  const lifeProducts = await crawlLifeInsuranceProducts();
  allProducts.push(...lifeProducts);

  // 2. 손해보험협회 크롤링
  const propertyProducts = await crawlPropertyInsuranceProducts();
  allProducts.push(...propertyProducts);

  // 3. KB손해보험 직접 크롤링 (옵션)
  // const kbProducts = await crawlKBInsuranceProducts();
  // allProducts.push(...kbProducts);

  // 결과 저장
  const outputFile = path.join(OUTPUT_DIR, `products_${Date.now()}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 총 ${allProducts.length}개 상품 수집 완료`);
  console.log(`📁 저장 위치: ${outputFile}`);
  console.log('='.repeat(60) + '\n');

  // CSV 형식으로도 저장
  const csvFile = path.join(OUTPUT_DIR, `products_${Date.now()}.csv`);
  const csvContent = [
    'company,productName,category,publicationDate,pdfUrl,source',
    ...allProducts.map(p =>
      `"${p.company}","${p.productName}","${p.category}","${p.publicationDate}","${p.pdfUrl}","${p.source}"`
    )
  ].join('\n');

  fs.writeFileSync(csvFile, csvContent, 'utf8');
  console.log(`📊 CSV 저장 위치: ${csvFile}\n`);

  return allProducts;
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { crawlLifeInsuranceProducts, crawlPropertyInsuranceProducts, crawlKBInsuranceProducts };
