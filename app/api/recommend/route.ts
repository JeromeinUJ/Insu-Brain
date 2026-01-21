import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { age, gender, occupation, healthTags } = body;

    // 추천 규칙 매칭
    const rulesResult = await query(
      `SELECT * FROM recommendation_rules
       WHERE category IN (
         SELECT DISTINCT category FROM products WHERE company_id IN (
           SELECT id FROM companies WHERE code = 'KB'
         )
       )
       ORDER BY priority DESC`
    );

    const rules = rulesResult.rows;
    const recommendations: any[] = [];

    // Rule matching logic
    for (const rule of rules) {
      const conditions = rule.conditions || {};
      let matchScore = rule.priority;
      let shouldRecommend = false;

      // Age-based matching
      if (conditions.min_age && conditions.max_age) {
        if (age >= conditions.min_age && age <= conditions.max_age) {
          shouldRecommend = true;
          matchScore += 20;
        }
      }

      // Health condition matching
      if (healthTags && healthTags.length > 0 && conditions.health_conditions) {
        const matchingConditions = healthTags.filter((tag: string) =>
          conditions.health_conditions.includes(tag)
        );
        if (matchingConditions.length > 0) {
          shouldRecommend = true;
          matchScore += matchingConditions.length * 10;
        }
      }

      // Occupation matching
      if (occupation && conditions.occupations) {
        if (conditions.occupations.includes(occupation)) {
          shouldRecommend = true;
          matchScore += 30;
        }
      }

      if (shouldRecommend) {
        // 해당 카테고리의 KB 상품 찾기
        const productResult = await query(
          `SELECT p.*, c.name as company_name
           FROM products p
           JOIN companies c ON p.company_id = c.id
           WHERE c.code = 'KB' AND p.category = $1
           LIMIT 1`,
          [rule.category]
        );

        if (productResult.rows.length > 0) {
          const product = productResult.rows[0];
          recommendations.push({
            product: product.name,
            category: product.category,
            reason: `${rule.category} 카테고리의 상품을 추천드립니다.`,
            details: product.description ? product.description.split('\n').slice(0, 3) : [],
            score: matchScore,
            productId: product.id,
          });
        }
      }
    }

    // Default recommendations if no matches
    if (recommendations.length === 0) {
      const defaultResult = await query(
        `SELECT p.*, c.name as company_name
         FROM products p
         JOIN companies c ON p.company_id = c.id
         WHERE c.code = 'KB'
         ORDER BY p.created_at DESC
         LIMIT 3`
      );

      defaultResult.rows.forEach((product, idx) => {
        recommendations.push({
          product: product.name,
          category: product.category,
          reason: '고객님께 적합한 KB 상품입니다.',
          details: product.description ? product.description.split('\n').slice(0, 3) : [],
          score: 50 - idx * 10,
          productId: product.id,
        });
      });
    }

    // Sort by score and return top 3
    recommendations.sort((a, b) => b.score - a.score);

    return NextResponse.json(recommendations.slice(0, 3));
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
