/**
 * 데이터 정제 스크립트
 * - 헤더 행 제거
 * - 중복 제거
 * - 빈 데이터 제거
 * - 데이터 검증
 */

const fs = require('fs');
const path = require('path');

function cleanData() {
  console.log('\n=== 데이터 정제 시작 ===\n');

  const dataDir = path.join(__dirname, 'data');
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('products_final_') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ 정제할 데이터 파일이 없습니다.');
    return;
  }

  const latestFile = path.join(dataDir, files[0]);
  console.log(`📂 파일: ${files[0]}`);

  const rawData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  console.log(`📊 원본: ${rawData.length}개\n`);

  let cleaned = rawData;

  // 1. 헤더 행 제거
  console.log('1. 헤더 행 제거...');
  const headerKeywords = [
    '번호', 'No', '구분', '회사명', '상품명', '카테고리',
    'company', 'product', 'category', 'name',
    '전체', '선택', '판매시기', '유지기간'
  ];

  const beforeHeaderFilter = cleaned.length;
  cleaned = cleaned.filter(item => {
    const company = (item.company || '').toLowerCase();
    const productName = (item.productName || '').toLowerCase();

    // 헤더 키워드 체크
    const isHeader = headerKeywords.some(keyword =>
      company.includes(keyword.toLowerCase()) ||
      productName.includes(keyword.toLowerCase())
    );

    // 숫자만 있는 경우 (행 번호)
    const isRowNumber = /^\d+$/.test(company);

    return !isHeader && !isRowNumber;
  });

  console.log(`   제거: ${beforeHeaderFilter - cleaned.length}개`);
  console.log(`   남음: ${cleaned.length}개\n`);

  // 2. 빈 데이터 제거
  console.log('2. 빈 데이터 제거...');
  const beforeEmptyFilter = cleaned.length;
  cleaned = cleaned.filter(item => {
    return item.productName &&
           item.productName.trim().length > 2 &&
           item.productName !== 'undefined' &&
           item.productName !== 'null';
  });

  console.log(`   제거: ${beforeEmptyFilter - cleaned.length}개`);
  console.log(`   남음: ${cleaned.length}개\n`);

  // 3. 중복 제거 (productName + source 기준)
  console.log('3. 중복 제거...');
  const beforeDuplicateFilter = cleaned.length;
  const seen = new Set();
  cleaned = cleaned.filter(item => {
    const key = `${item.productName}_${item.source}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  console.log(`   제거: ${beforeDuplicateFilter - cleaned.length}개`);
  console.log(`   남음: ${cleaned.length}개\n`);

  // 4. 데이터 정규화
  console.log('4. 데이터 정규화...');
  cleaned = cleaned.map(item => ({
    company: (item.company || '').trim(),
    productName: (item.productName || '').trim(),
    category: (item.category || '').trim(),
    date: (item.date || '').trim(),
    details: (item.details || '').trim().replace(/\s+/g, ' '),
    pdfUrl: (item.pdfUrl || '').trim(),
    source: item.source,
    sourceUrl: item.sourceUrl
  }));

  console.log(`   ✅ 정규화 완료\n`);

  // 5. 카테고리별 분류
  console.log('5. 카테고리별 통계:');
  const byCategory = {};
  cleaned.forEach(item => {
    const cat = item.category || '기타';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}개`);
    });

  // 6. 결과 저장
  const timestamp = Date.now();
  const cleanedFile = path.join(dataDir, `products_cleaned_${timestamp}.json`);
  fs.writeFileSync(cleanedFile, JSON.stringify(cleaned, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 정제 완료!`);
  console.log(`📊 원본: ${rawData.length}개 → 정제: ${cleaned.length}개`);
  console.log(`📁 저장: ${path.basename(cleanedFile)}`);
  console.log('='.repeat(60));

  // CSV 저장
  const csvFile = path.join(dataDir, `products_cleaned_${timestamp}.csv`);
  const headers = ['company', 'productName', 'category', 'date', 'source', 'pdfUrl'];
  const csvContent = [
    headers.join(','),
    ...cleaned.map(p =>
      headers.map(h => `"${(p[h] || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(',')
    )
  ].join('\n');

  fs.writeFileSync(csvFile, csvContent, 'utf8');
  console.log(`📊 CSV: ${path.basename(csvFile)}\n`);

  // 7. 품질 보고서
  console.log('📈 품질 보고서:');
  const withPdf = cleaned.filter(p => p.pdfUrl && p.pdfUrl.length > 0).length;
  const withDetails = cleaned.filter(p => p.details && p.details.length > 10).length;

  console.log(`   PDF URL 있음: ${withPdf}개 (${(withPdf/cleaned.length*100).toFixed(1)}%)`);
  console.log(`   상세정보 있음: ${withDetails}개 (${(withDetails/cleaned.length*100).toFixed(1)}%)`);

  return cleaned;
}

// 실행
if (require.main === module) {
  cleanData();
}

module.exports = { cleanData };
