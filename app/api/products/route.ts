import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const companyId = searchParams.get('company_id');

    let sql = `
      SELECT p.*, c.name as company_name, c.code as company_code
      FROM products p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND p.category = $${params.length}`;
    }

    if (companyId) {
      params.push(companyId);
      sql += ` AND p.company_id = $${params.length}`;
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, name, category, description, pdf_url, coverage_details, premium_range } = body;

    const result = await query(
      `INSERT INTO products (company_id, name, category, description, pdf_url, coverage_details, premium_range)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [company_id, name, category, description, pdf_url, coverage_details, premium_range]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
