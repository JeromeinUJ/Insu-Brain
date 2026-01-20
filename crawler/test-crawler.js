/**
 * 크롤러 테스트 스크립트
 * 실제 사이트 구조를 확인하고 selector를 검증
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function testLifeInsuranceStructure() {
  console.log('\n=== 생명보험협회 사이트 구조 테스트 ===\n');

  try {
    // 메인 페이지 확인
    const mainUrl = 'https://pub.insure.or.kr';
    console.log(`1. 메인 페이지 접근: ${mainUrl}`);

    const mainResponse = await axios.get(mainUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    console.log('✅ 메인 페이지 접근 성공');
    console.log(`   상태 코드: ${mainResponse.status}`);

    // 상품비교공시 페이지 시도
    const compareUrls = [
      'https://pub.insure.or.kr/compareDis/product/list.do',
      'https://pub.insure.or.kr/compareDis/list.do',
      'https://pub.insure.or.kr/compare/product/list.do',
    ];

    for (const url of compareUrls) {
      try {
        console.log(`\n2. 상품 페이지 테스트: ${url}`);
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': mainUrl
          },
          timeout: 30000
        });

        console.log(`✅ 접근 성공 (${response.status})`);

        // HTML 구조 분석
        const $ = cheerio.load(response.data);

        console.log('\n3. HTML 구조 분석:');
        console.log(`   - <table> 태그: ${$('table').length}개`);
        console.log(`   - <tbody> 태그: ${$('tbody').length}개`);
        console.log(`   - <tr> 태그: ${$('tr').length}개`);
        console.log(`   - PDF 링크: ${$('a[href*=".pdf"]').length}개`);

        // 테이블 내용 샘플 출력
        if ($('table tbody tr').length > 0) {
          console.log('\n4. 첫 번째 테이블 행 샘플:');
          $('table tbody tr').first().find('td').each((i, el) => {
            console.log(`   td[${i}]: ${$(el).text().trim().substring(0, 50)}`);
          });
        }

        // 제목이나 헤더 확인
        console.log('\n5. 페이지 제목 및 헤더:');
        console.log(`   Title: ${$('title').text()}`);
        console.log(`   H1: ${$('h1').text().trim()}`);
        console.log(`   H2: ${$('h2').first().text().trim()}`);

        break; // 성공하면 루프 종료

      } catch (error) {
        console.log(`❌ 실패: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

async function testPropertyInsuranceStructure() {
  console.log('\n\n=== 손해보험협회 사이트 구조 테스트 ===\n');

  try {
    const url = 'https://kpub.knia.or.kr/productDisc/guide/productInf.do';
    console.log(`1. 페이지 접근: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });

    console.log(`✅ 접근 성공 (${response.status})`);

    const $ = cheerio.load(response.data);

    console.log('\n2. HTML 구조 분석:');
    console.log(`   - <table> 태그: ${$('table').length}개`);
    console.log(`   - <tbody> 태그: ${$('tbody').length}개`);
    console.log(`   - <tr> 태그: ${$('tr').length}개`);
    console.log(`   - PDF 링크: ${$('a[href*=".pdf"]').length}개`);

    // 클래스 기반 요소 확인
    console.log('\n3. 주요 CSS 클래스:');
    const classes = [];
    $('[class]').each((i, el) => {
      const cls = $(el).attr('class');
      if (cls && !classes.includes(cls)) {
        classes.push(cls);
      }
    });
    console.log(`   발견된 클래스: ${classes.slice(0, 10).join(', ')}...`);

    console.log('\n4. 페이지 정보:');
    console.log(`   Title: ${$('title').text()}`);

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('보험 협회 사이트 구조 분석 테스트');
  console.log('='.repeat(60));

  await testLifeInsuranceStructure();
  await testPropertyInsuranceStructure();

  console.log('\n' + '='.repeat(60));
  console.log('테스트 완료');
  console.log('='.repeat(60));
  console.log('\n💡 Tip: 위 결과를 바탕으로 crawl-insurance-list.js를 수정하세요.\n');
}

main().catch(console.error);
