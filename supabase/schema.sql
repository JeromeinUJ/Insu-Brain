-- Insu-Brain KB Pilot Database Schema
-- Version: 1.0
-- Target: Supabase PostgreSQL

-- =============================================
-- 1. Insurance Companies Table
-- =============================================
CREATE TABLE IF NOT EXISTS insurance_companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  group_name TEXT NOT NULL CHECK (group_name IN ('major', 'general', 'online')),
  is_supported BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 999,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_insurance_companies_supported ON insurance_companies(is_supported);
CREATE INDEX idx_insurance_companies_sort ON insurance_companies(sort_order);

-- =============================================
-- 2. Insurance Products Table
-- =============================================
CREATE TABLE IF NOT EXISTS insurance_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES insurance_companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT NOT NULL CHECK (category IN ('health', 'car', 'child', 'travel', 'pension')),
  is_simplified BOOLEAN DEFAULT false, -- 간편보험 여부
  pdf_url TEXT, -- 약관 PDF URL
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_company ON insurance_products(company_id);
CREATE INDEX idx_products_category ON insurance_products(category);

-- =============================================
-- 3. Recommendation Rules Table (Simple Rule Engine)
-- =============================================
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id SERIAL PRIMARY KEY,
  rule_name TEXT NOT NULL,
  condition_tags TEXT[] NOT NULL, -- ['고혈압', '당뇨'] etc.
  age_min INTEGER,
  age_max INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'all')),
  occupation_tags TEXT[], -- ['운전직', '사무직'] etc.
  target_product_id UUID REFERENCES insurance_products(id) ON DELETE SET NULL,
  sales_talk TEXT NOT NULL, -- 추천 멘트
  priority INTEGER DEFAULT 0, -- 우선순위 (높을수록 먼저 매칭)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recommendation_rules_active ON recommendation_rules(is_active, priority DESC);

-- =============================================
-- 4. Comparison Results Cache (Optional)
-- =============================================
CREATE TABLE IF NOT EXISTS comparison_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_product_id UUID REFERENCES insurance_products(id),
  competitor_product_id UUID REFERENCES insurance_products(id),
  comparison_result JSONB, -- AI 분석 결과
  evidence_pages INTEGER[], -- [14, 22, 31] 페이지 번호
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_comparison_cache_products ON comparison_cache(kb_product_id, competitor_product_id);
CREATE INDEX idx_comparison_cache_expires ON comparison_cache(expires_at);

-- =============================================
-- SEED DATA: Insurance Companies (KB First)
-- =============================================
INSERT INTO insurance_companies (id, name, name_en, group_name, is_supported, sort_order) VALUES
  (1, 'KB손해보험', 'KB Insurance', 'major', true, 1),
  (2, '삼성화재', 'Samsung Fire & Marine', 'major', true, 2),
  (3, '현대해상', 'Hyundai Marine & Fire', 'major', true, 3),
  (4, 'DB손해보험', 'DB Insurance', 'major', true, 4),
  (5, '메리츠화재', 'Meritz Fire & Marine', 'major', true, 5),
  (6, 'AIG손해보험', 'AIG', 'major', true, 6),
  (7, 'NH농협손해보험', 'NH Nonghyup', 'major', true, 7),
  (8, '한화손해보험', 'Hanwha General', 'major', true, 8),
  (9, 'MG손해보험', 'MG Insurance', 'general', true, 9),
  (10, '롯데손해보험', 'Lotte Insurance', 'general', true, 10),
  (11, '흥국화재', 'Heungkuk Fire & Marine', 'general', true, 11),
  (12, '캐롯손해보험', 'Carrot General', 'online', true, 12),
  (13, '하나손해보험', 'Hana Insurance', 'general', true, 13),
  (14, 'KB라이프생명', 'KB Life', 'major', true, 14),
  (15, '신한라이프', 'Shinhan Life', 'major', true, 15)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('insurance_companies_id_seq', 15, true);

-- =============================================
-- SEED DATA: KB Sample Products
-- =============================================
INSERT INTO insurance_products (company_id, product_name, product_code, category, is_simplified, summary) VALUES
  (1, 'KB 간편건강보험', 'KB-HEALTH-001', 'health', true, '유병자도 가입 가능한 간편심사 건강보험'),
  (1, 'KB 자녀보험', 'KB-CHILD-001', 'child', false, '출생 전부터 15세까지 가입 가능한 자녀 종합보험'),
  (1, 'KB 운전자보험', 'KB-CAR-001', 'car', false, '운전자 형사합의금 및 변호사 선임비용 보장'),
  (1, 'KB 암보험', 'KB-HEALTH-002', 'health', false, 'KB 대표 암진단비 보장 상품')
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED DATA: Recommendation Rules
-- =============================================
INSERT INTO recommendation_rules
  (rule_name, condition_tags, age_min, age_max, gender, occupation_tags, sales_talk, priority, is_active)
VALUES
  ('유병자 간편보험 추천', ARRAY['고혈압', '당뇨', '고지혈증'], 20, 70, 'all', NULL,
   '고객님의 병력도 할증 없이 가입 가능한 KB 간편건강보험을 추천드립니다. 기존 보험 가입이 어려웠던 분들을 위한 맞춤 상품입니다.',
   100, true),

  ('자녀보험 추천', ARRAY[]::TEXT[], 0, 15, 'all', NULL,
   '출생 전부터 가입 가능한 KB 자녀보험으로 우리 아이의 미래를 지켜주세요. 성장기 질병 및 상해를 폭넓게 보장합니다.',
   80, true),

  ('운전자보험 추천', ARRAY[]::TEXT[], 20, 65, 'all', ARRAY['운전직', '배송기사', '택시기사'],
   '운전이 많으신 고객님께는 형사합의금과 변호사 비용까지 보장하는 KB 운전자보험을 추천드립니다.',
   90, true),

  ('성인 암보험 추천', ARRAY[]::TEXT[], 30, 60, 'all', NULL,
   '암 가족력이 있거나 건강검진 결과가 걱정되시는 고객님께는 KB 암보험을 추천드립니다. 진단비 최대 1억원 보장이 가능합니다.',
   70, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- RLS (Row Level Security) 설정 (선택사항)
-- =============================================
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_rules ENABLE ROW LEVEL SECURITY;

-- Public read access (인증 불필요)
CREATE POLICY "Public read access for companies" ON insurance_companies
  FOR SELECT USING (true);

CREATE POLICY "Public read access for products" ON insurance_products
  FOR SELECT USING (true);

CREATE POLICY "Public read access for rules" ON recommendation_rules
  FOR SELECT USING (is_active = true);

-- =============================================
-- Helper Functions
-- =============================================

-- 추천 규칙 매칭 함수
CREATE OR REPLACE FUNCTION match_recommendation_rules(
  p_age INTEGER,
  p_gender TEXT,
  p_tags TEXT[],
  p_occupation TEXT
)
RETURNS TABLE (
  rule_id INTEGER,
  product_name TEXT,
  sales_talk TEXT,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rr.id,
    ip.product_name,
    rr.sales_talk,
    rr.priority as match_score
  FROM recommendation_rules rr
  JOIN insurance_products ip ON rr.target_product_id = ip.id
  WHERE
    rr.is_active = true
    AND (rr.age_min IS NULL OR p_age >= rr.age_min)
    AND (rr.age_max IS NULL OR p_age <= rr.age_max)
    AND (rr.gender = 'all' OR rr.gender = p_gender)
    AND (
      rr.condition_tags IS NULL
      OR rr.condition_tags && p_tags -- 배열 겹침 체크
      OR p_occupation = ANY(rr.occupation_tags)
    )
  ORDER BY rr.priority DESC, rr.id ASC
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION match_recommendation_rules IS 'KB Pilot용 간단한 규칙 기반 상품 추천 엔진';
