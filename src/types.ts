// 輸送見積もりシステム 型定義

export interface Bindings {
  DB: D1Database;
  AI: Ai;
}

export interface Customer {
  id?: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id?: number;
  customer_id: number;
  name: string;
  description?: string;
  status: 'initial' | 'quote_sent' | 'under_consideration' | 'order' | 'failed';
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Estimate {
  id?: number;
  customer_id: number;
  project_id: number;
  estimate_number: string;
  
  // 配送先情報
  delivery_address: string;
  delivery_postal_code?: string;
  delivery_area: 'A' | 'B' | 'C' | 'D';
  
  // 車両情報
  vehicle_type: '2t車' | '4t車';
  operation_type: '共配' | '半日' | '終日';
  vehicle_cost: number;
  
  // スタッフ情報
  supervisor_count: number;
  leader_count: number;
  m2_staff_half_day: number;
  m2_staff_full_day: number;
  temp_staff_half_day: number;
  temp_staff_full_day: number;
  staff_cost: number;
  
  // その他サービス
  parking_officer_hours: number;
  parking_officer_cost: number;
  transport_vehicles: number;
  transport_within_20km: boolean;
  transport_distance: number;
  transport_fuel_cost: number;
  transport_cost: number;
  waste_disposal_size: 'large' | 'medium' | 'small' | 'none';
  waste_disposal_cost: number;
  protection_work: boolean;
  protection_floors: number;
  protection_cost: number;
  material_collection_size: 'many' | 'medium' | 'few' | 'none';
  material_collection_cost: number;
  construction_m2_staff: number;
  construction_partner?: string;
  construction_cost: number;
  work_time_type: 'normal' | 'early' | 'night' | 'midnight';
  work_time_multiplier: number;
  parking_fee: number;
  highway_fee: number;
  
  // 金額計算
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  
  // メタ情報
  notes?: string;
  ai_email_generated?: string;
  pdf_generated: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface StatusHistory {
  id?: number;
  project_id: number;
  estimate_id?: number;
  old_status?: string;
  new_status: string;
  notes?: string;
  user_id: string;
  created_at?: string;
}

export interface MasterSetting {
  id?: number;
  category: string;
  subcategory: string;
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean';
  description?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface AreaSetting {
  id?: number;
  postal_code_prefix: string;
  area_name: string;
  area_rank: 'A' | 'B' | 'C' | 'D';
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

// API リクエスト・レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PostalCodeApiResponse {
  success: boolean;
  data?: {
    address: string;
    area: 'A' | 'B' | 'C' | 'D';
    area_name: string;
  };
  error?: string;
}

export interface AIOptimizationRequest {
  delivery_area: 'A' | 'B' | 'C' | 'D';
  vehicle_type: '2t車' | '4t車';
  operation_type: '共配' | '半日' | '終日';
  work_type: string;
  additional_services: string[];
}

export interface AIOptimizationResponse {
  supervisor_count: number;
  leader_count: number;
  m2_staff_half_day: number;
  m2_staff_full_day: number;
  temp_staff_half_day: number;
  temp_staff_full_day: number;
  reasoning: string;
}

export interface AIEmailRequest {
  customer_name: string;
  project_name: string;
  total_amount: number;
  estimate_details: {
    vehicle_info: string;
    staff_info: string;
    services_info: string;
  };
}

export interface AIEmailResponse {
  email_content: string;
  subject: string;
}

// 見積作成フロー用の型
export interface EstimateFlowState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  customer_id?: number;
  project_id?: number;
  delivery_info?: {
    postal_code: string;
    address: string;
    area: 'A' | 'B' | 'C' | 'D';
  };
  vehicle_info?: {
    type: '2t車' | '4t車';
    operation: '共配' | '半日' | '終日';
    cost: number;
  };
  staff_info?: {
    supervisor_count: number;
    leader_count: number;
    m2_staff_half_day: number;
    m2_staff_full_day: number;
    temp_staff_half_day: number;
    temp_staff_full_day: number;
    total_cost: number;
  };
  services_info?: {
    parking_officer_hours: number;
    transport_vehicles: number;
    transport_within_20km: boolean;
    transport_distance: number;
    transport_fuel_cost: number;
    waste_disposal_size: 'large' | 'medium' | 'small' | 'none';
    protection_work: boolean;
    protection_floors: number;
    material_collection_size: 'many' | 'medium' | 'few' | 'none';
    construction_m2_staff: number;
    construction_partner?: string;
    work_time_type: 'normal' | 'early' | 'night' | 'midnight';
    parking_fee: number;
    highway_fee: number;
    total_cost: number;
  };
  notes?: string;
  total_amount?: number;
}