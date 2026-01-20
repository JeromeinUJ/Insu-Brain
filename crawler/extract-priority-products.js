/**
 * 중요 상품 PDF 다운로드 대상 추출
 * - 보험 상품 우선순위 선정
 * - KB 상품 우선
 * - 주요 카테고리 (건강, 암, 운전자, 자녀)
 */

const fs = require('fs');
const path = require('path');

function extractPriorityProducts() {
  console.log('\n=== 중요 상품 PDF 다운로드 대상 추출 ===\n');

  const dataDir = path.join(__dirname, 'data');
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('products_cleaned_') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ 정제된 데이터 파일이 없습니다.');
    console.log('먼저 clean-data.js를 실행하세요.\n');
    return;
  }

  const latestFile = path.join(dataDir, files[0]);
  const products = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

  console.log(`📂 파일: ${files[0]}`);
  console.log(`📊 전체: ${products.length}개\n`);

  // 우선순위 키워드
  const priorityKeywords = {
    'KB': 10,
    '간편건강': 8,
    '암보험': 8,
    '운전자': 7,
    '자녀': 7,
    '실손': 9,
    '건강보험': 6,
    '종합보험': 5,
    '저축': 4,
    '변액': 3
  };

  // 우선순위 점수 계산
  const scored = products.map(product => {
    let score = 0;
    const name = product.productName.toLowerCase();
    const company = product.company.toLowerCase();

    // 회사명 KB → 최우선
    if (company.includes('kb') || company.includes('케이비')) {
      score += 10;
    }

    // 주요 보험사 가산점
    const majorCompanies = ['삼성', '현대', '메리츠', 'db'];
    if (majorCompanies.some(c => company.includes(c))) {
      score += 5;
    }

    // 키워드 매칭
    Object.entries(priorityKeywords).forEach(([keyword, points]) => {
      if (name.includes(keyword.toLowerCase()) || company.includes(keyword.toLowerCase())) {
        score += points;
      }
    });

    return {
      ...product,
      priorityScore: score
    };
  });

  // 점수순 정렬
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  // Top 20 추출
  const top20 = scored.slice(0, 20);

  console.log('🎯 다운로드 우선순위 Top 20:\n');
  console.log('순위 | 점수 | 회사명 | 상품명');
  console.log('-'.repeat(80));

  top20.forEach((product, index) => {
    const rank = (index + 1).toString().padStart(2);
    const score = product.priorityScore.toString().padStart(2);
    const company = product.company.substring(0, 15).padEnd(15);
    const name = product.productName.substring(0, 35);

    console.log(`${rank}. | ${score}점 | ${company} | ${name}`);
  });

  // PDF 다운로드 가이드 생성
  console.log('\n' + '='.repeat(80));
  console.log('📥 다운로드 가이드\n');

  const downloadGuide = top20.map((product, index) => {
    return {
      priority: index + 1,
      score: product.priorityScore,
      company: product.company,
      productName: product.productName,
      category: product.category,
      source: product.source,
      downloadUrl: product.pdfUrl || '수동 검색 필요',
      status: product.pdfUrl ? '자동 가능' : '수동 다운로드',
      searchQuery: `${product.company} ${product.productName} 약관`,
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(`${product.company} ${product.productName} 약관 PDF`)}`
    };
  });

  // JSON 저장
  const timestamp = Date.now();
  const outputFile = path.join(dataDir, `priority_products_${timestamp}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(downloadGuide, null, 2), 'utf8');

  console.log(`📁 JSON 저장: ${path.basename(outputFile)}`);

  // CSV 저장
  const csvFile = path.join(dataDir, `priority_products_${timestamp}.csv`);
  const headers = ['priority', 'score', 'company', 'productName', 'status', 'searchUrl'];
  const csvContent = [
    headers.join(','),
    ...downloadGuide.map(p =>
      headers.map(h => `"${(p[h]?.toString() || '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  fs.writeFileSync(csvFile, csvContent, 'utf8');
  console.log(`📊 CSV 저장: ${path.basename(csvFile)}`);

  // 카테고리별 분류
  console.log('\n📊 카테고리별 우선순위:');
  const byCategory = {};
  top20.forEach(p => {
    const cat = p.category || '기타';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p.productName);
  });

  Object.entries(byCategory).forEach(([cat, products]) => {
    console.log(`\n${cat} (${products.length}개):`);
    products.forEach(name => console.log(`  - ${name}`));
  });

  // 다운로드 방법 안내
  console.log('\n' + '='.repeat(80));
  console.log('📥 다운로드 방법\n');
  console.log('1. 자동 다운로드 (PDF URL이 있는 경우):');
  console.log('   → download-pdfs.js 수정하여 priority_products.json 사용\n');
  console.log('2. 수동 다운로드 (PDF URL이 없는 경우):');
  console.log('   → priority_products.csv 열어서 searchUrl 클릭');
  console.log('   → 약관 PDF 다운로드');
  console.log('   → pdfs/ 폴더에 저장\n');
  console.log('3. 파일명 규칙:');
  console.log('   → {회사명}_{상품명}.pdf');
  console.log('   → 예: KB손해보험_간편건강보험.pdf\n');
  console.log('4. 업로드:');
  console.log('   → node upload-pdfs.js\n');

  return downloadGuide;
}

// 실행
if (require.main === module) {
  extractPriorityProducts();
}

module.exports = { extractPriorityProducts };
