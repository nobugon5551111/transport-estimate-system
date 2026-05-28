-- Step 1: 既存データを一時テーブルにバックアップ
CREATE TABLE distance_area_pricing_backup AS SELECT * FROM distance_area_pricing;

-- Step 2: 既存テーブルを削除
DROP TABLE distance_area_pricing;

-- Step 3: plan_typeを含むUNIQUE制約でテーブルを再作成
CREATE TABLE distance_area_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_rank TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  price_index INTEGER NOT NULL,
  regions TEXT,
  dedicated_price_1 INTEGER NOT NULL,
  dedicated_price_2 INTEGER NOT NULL,
  charter_2t_price_1 INTEGER NOT NULL,
  charter_2t_price_2 INTEGER NOT NULL,
  road_permit_fee INTEGER DEFAULT NULL,
  transport_vehicle_fee INTEGER NOT NULL,
  survey_twoman_fee INTEGER DEFAULT NULL,
  survey_oneman_fee INTEGER DEFAULT NULL,
  oneman_discount_eligible BOOLEAN DEFAULT FALSE,
  oneman_discount_amount INTEGER DEFAULT 15000,
  highway_included BOOLEAN DEFAULT FALSE,
  effective_date TEXT DEFAULT '2026-03-01',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  plan_type TEXT DEFAULT 'A',
  UNIQUE(area_rank, effective_date, plan_type)
);

-- Step 4: バックアップからデータを復元
INSERT INTO distance_area_pricing (id, area_rank, distance_km, price_index, regions, dedicated_price_1, dedicated_price_2, charter_2t_price_1, charter_2t_price_2, road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee, oneman_discount_eligible, oneman_discount_amount, highway_included, effective_date, notes, created_at, updated_at, plan_type)
SELECT id, area_rank, distance_km, price_index, regions, dedicated_price_1, dedicated_price_2, charter_2t_price_1, charter_2t_price_2, road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee, oneman_discount_eligible, oneman_discount_amount, highway_included, effective_date, notes, created_at, updated_at, plan_type
FROM distance_area_pricing_backup;

-- Step 5: バックアップテーブルを削除
DROP TABLE distance_area_pricing_backup;

-- Step 6: プランBデータを挿入
INSERT INTO distance_area_pricing (area_rank, distance_km, price_index, regions, dedicated_price_1, dedicated_price_2, charter_2t_price_1, charter_2t_price_2, road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee, oneman_discount_eligible, oneman_discount_amount, highway_included, plan_type)
VALUES
('A', 15, 100, '大阪市', 53000, 55000, 55000, 58000, 10000, 5000, 25000, 20000, 1, 15000, 1, 'B'),
('B', 30, 105, '大阪府,神戸市,阪神南,阪神北,京都市,山城,奈良県', 56000, 58000, 58000, 61000, 11000, 6000, 26000, 21000, 1, 15000, 0, 'B'),
('C', 50, 110, '南丹', 59000, 61000, 61000, 64000, 12000, 6000, 28000, 22000, 1, 15000, 0, 'B'),
('D', 100, 120, '東播磨,北播磨,中播磨,丹波,滋賀県,和歌山県', 64000, 66000, 66000, 70000, 12000, 6000, 30000, 24000, 1, 15000, 0, 'B'),
('E', 150, 130, '淡路,西播磨,中丹,三重県', 69000, 72000, 72000, 76000, 13000, 7000, 33000, 26000, 1, 15000, 0, 'B'),
('F', 200, 140, '但馬,丹後,愛知県,岐阜県,徳島県,香川県', 75000, 77000, 77000, 81000, 14000, 7000, 35000, 28000, 1, 15000, 0, 'B'),
('G', 300, 160, '岡山県,鳥取県,福井県', 85000, 88000, 88000, 93000, NULL, 8000, NULL, NULL, 0, 15000, 0, 'B'),
('H', 400, 180, '広島県,愛媛県,高知県,島根県,石川県,富山県', 96000, 99000, 99000, 105000, NULL, 9000, NULL, NULL, 0, 15000, 0, 'B'),
('I', 500, 200, '山口県', 106000, 110000, 110000, 116000, NULL, 10000, NULL, NULL, 0, 15000, 0, 'B');
