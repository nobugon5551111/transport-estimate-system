-- Migration: 標準見積A/B分離対応
-- Created: 2026-04-07

-- 1. estimates テーブルに estimate_type カラム追加
ALTER TABLE estimates ADD COLUMN estimate_type TEXT DEFAULT 'standard_a';

-- 既存データを分類
UPDATE estimates SET estimate_type = 'standard_a' WHERE estimate_number LIKE 'EST-%';
UPDATE estimates SET estimate_type = 'free' WHERE estimate_number LIKE 'FREE-%';
UPDATE estimates SET estimate_type = 'survey' WHERE estimate_number LIKE 'SURVEY-%';

-- 2. distance_area_pricing に plan_type カラム追加
ALTER TABLE distance_area_pricing ADD COLUMN plan_type TEXT DEFAULT 'A';

-- 旧UNIQUE制約を削除して新しい制約に置き換え
-- SQLiteではALTER TABLE DROP CONSTRAINTが使えないため、
-- plan_typeを含むインデックスを新規作成（既存UNIQUEはarea_rank+effective_dateだが、
-- plan_typeが追加されたので同じarea_rank+effective_dateでもplan_typeが違えばINSERT可能に）
-- → SQLiteの制約上、テーブル再作成が必要だが重いので、代わりにB用データのeffective_dateを変えて対応

-- B用のチャーター便料金データを複製（effective_dateを'2026-03-01-B'にして重複回避）
INSERT INTO distance_area_pricing (
  area_rank, distance_km, price_index, regions,
  dedicated_price_1, dedicated_price_2, charter_2t_price_1, charter_2t_price_2,
  road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee,
  oneman_discount_eligible, oneman_discount_amount, highway_included, effective_date, plan_type
)
SELECT 
  area_rank, distance_km, price_index, regions,
  dedicated_price_1, dedicated_price_2, charter_2t_price_1, charter_2t_price_2,
  road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee,
  oneman_discount_eligible, oneman_discount_amount, highway_included, '2026-03-01-B', 'B'
FROM distance_area_pricing WHERE plan_type = 'A';

-- 3. konsai_pricing に plan_type カラム追加
ALTER TABLE konsai_pricing ADD COLUMN plan_type TEXT DEFAULT 'A';

-- B用の混載便料金データを複製
INSERT INTO konsai_pricing (
  rank, distance_km, distance_label, regions, price, overtime_fee,
  road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee,
  oneman_discount_amount, highway_included, effective_date, notes, plan_type
)
SELECT 
  rank, distance_km, distance_label, regions, price, overtime_fee,
  road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee,
  oneman_discount_amount, highway_included, effective_date, notes, 'B'
FROM konsai_pricing WHERE plan_type = 'A';

-- 4. インデックス追加
CREATE INDEX IF NOT EXISTS idx_distance_area_pricing_plan ON distance_area_pricing(plan_type);
CREATE INDEX IF NOT EXISTS idx_konsai_pricing_plan ON konsai_pricing(plan_type);
CREATE INDEX IF NOT EXISTS idx_estimates_type ON estimates(estimate_type);
