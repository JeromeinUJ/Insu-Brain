-- Insu-Brain Database Schema
-- PostgreSQL Schema for Insurance Comparison Platform

-- 보험사 테이블
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 보험 상품 테이블
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  pdf_url TEXT,
  coverage_details JSONB,
  premium_range VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 추천 규칙 테이블
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  conditions JSONB,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 크롤링 데이터 테이블 (월별 자동 수집 데이터)
CREATE TABLE IF NOT EXISTS crawled_products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  category VARCHAR(100),
  source_url TEXT,
  crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data JSONB
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_category ON recommendation_rules(category);
CREATE INDEX IF NOT EXISTS idx_crawled_products_category ON crawled_products(category);
CREATE INDEX IF NOT EXISTS idx_crawled_products_crawled_at ON crawled_products(crawled_at);

-- 초기 데이터: 보험사
INSERT INTO companies (name, code) VALUES
  ('KB손해보험', 'KB'),
  ('삼성화재', 'SAMSUNG'),
  ('현대해상', 'HYUNDAI'),
  ('DB손해보험', 'DB'),
  ('메리츠화재', 'MERITZ'),
  ('한화손해보험', 'HANWHA'),
  ('롯데손해보험', 'LOTTE'),
  ('AIG손해보험', 'AIG'),
  ('MG손해보험', 'MG'),
  ('악사손해보험', 'AXA'),
  ('처브손해보험', 'CHUBB'),
  ('캐롯손해보험', 'CARROT'),
  ('하나손해보험', 'HANA'),
  ('흥국화재', 'HEUNGKUK'),
  ('농협손해보험', 'NH')
ON CONFLICT (code) DO NOTHING;

-- 초기 데이터: 샘플 추천 규칙
INSERT INTO recommendation_rules (category, rule_type, conditions, priority) VALUES
  ('암보험', 'age_based', '{"min_age": 30, "max_age": 50}', 10),
  ('실손보험', 'mandatory', '{"required": true}', 100),
  ('운전자보험', 'lifestyle', '{"has_car": true}', 50),
  ('간편건강보험', 'age_based', '{"min_age": 20, "max_age": 40}', 30)
ON CONFLICT DO NOTHING;

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recommendation_rules_updated_at ON recommendation_rules;
CREATE TRIGGER update_recommendation_rules_updated_at BEFORE UPDATE ON recommendation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
