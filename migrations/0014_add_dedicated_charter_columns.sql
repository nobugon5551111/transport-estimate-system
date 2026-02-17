-- 専属便・2tチャーター対応カラム追加
-- 新料金体系（A-Iランク）に対応するための見積テーブル拡張

-- 専属便台数
ALTER TABLE estimates ADD COLUMN vehicle_dedicated_count INTEGER DEFAULT 0;

-- 専属便単価
ALTER TABLE estimates ADD COLUMN vehicle_dedicated_unit_price REAL DEFAULT 0;

-- 2tチャーター台数
ALTER TABLE estimates ADD COLUMN vehicle_charter_count INTEGER DEFAULT 0;

-- 2tチャーター単価
ALTER TABLE estimates ADD COLUMN vehicle_charter_unit_price REAL DEFAULT 0;

-- 輸送車両費（distance_area_pricingから）
ALTER TABLE estimates ADD COLUMN transport_vehicle_fee REAL DEFAULT 0;

-- 道路許可費（distance_area_pricingから）
ALTER TABLE estimates ADD COLUMN road_permit_fee REAL DEFAULT 0;

-- 現調費（ツーマン/ワンマン）
ALTER TABLE estimates ADD COLUMN survey_fee REAL DEFAULT 0;

-- 配送先までの距離（km）
ALTER TABLE estimates ADD COLUMN delivery_distance_km REAL DEFAULT 0;

-- ワンマン割引適用
ALTER TABLE estimates ADD COLUMN oneman_discount_applied INTEGER DEFAULT 0;
