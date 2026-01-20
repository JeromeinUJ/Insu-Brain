import { createClient } from '@supabase/supabase-js';

// These should be in .env.local for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on our schema
export type InsuranceCompany = {
  id: number;
  name: string;
  name_en?: string;
  group_name: 'major' | 'general' | 'online';
  is_supported: boolean;
  sort_order: number;
  logo_url?: string;
  created_at: string;
  updated_at: string;
};

export type InsuranceProduct = {
  id: string;
  company_id: number;
  product_name: string;
  product_code?: string;
  category: 'health' | 'car' | 'child' | 'travel' | 'pension';
  is_simplified: boolean;
  pdf_url?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
};

export type RecommendationRule = {
  id: number;
  rule_name: string;
  condition_tags: string[];
  age_min?: number;
  age_max?: number;
  gender?: 'male' | 'female' | 'all';
  occupation_tags?: string[];
  target_product_id?: string;
  sales_talk: string;
  priority: number;
  is_active: boolean;
  created_at: string;
};

export type RecommendationResult = {
  rule_id: number;
  product_name: string;
  sales_talk: string;
  match_score: number;
};
