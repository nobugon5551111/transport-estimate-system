-- Migration: 距離ベース料金区分テーブル追加（2026年3月料金改定対応）
-- Created: 2026-02-17
-- Purpose: Excelの「地区別料金区分」をシステムに組み込む（A〜Iランク、距離ベース判定）

-- 距離ベース料金区分テーブル
CREATE TABLE IF NOT EXISTS distance_area_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_rank TEXT NOT NULL,              -- ランク（A〜I）
  distance_km INTEGER NOT NULL,         -- 距離閾値（km）
  price_index INTEGER NOT NULL,         -- 指数（100〜200）
  regions TEXT,                          -- 地域名（カンマ区切り）
  
  -- 料金カラム（一次改定 = 現行使用料金）
  dedicated_price_1 INTEGER NOT NULL,    -- 専属便・一次改定
  dedicated_price_2 INTEGER NOT NULL,    -- 専属便・二次改定
  charter_2t_price_1 INTEGER NOT NULL,   -- 2tチャーター・一次改定
  charter_2t_price_2 INTEGER NOT NULL,   -- 2tチャーター・二次改定
  
  -- 付帯料金
  road_permit_fee INTEGER DEFAULT NULL,  -- 道路許可申請（NULLは非対応）
  transport_vehicle_fee INTEGER NOT NULL, -- 輸送車両費
  survey_twoman_fee INTEGER DEFAULT NULL, -- 現地調査ツーマン（NULLは非対応）
  survey_oneman_fee INTEGER DEFAULT NULL, -- 現地調査ワンマン（NULLは非対応）
  
  -- ワンマン割引対象フラグ
  oneman_discount_eligible BOOLEAN DEFAULT FALSE, -- ワンマン利用可能（A〜Fのみ）
  oneman_discount_amount INTEGER DEFAULT 15000,   -- ワンマン割引額
  
  -- 高速料金込みフラグ
  highway_included BOOLEAN DEFAULT FALSE, -- 高速料金込み（Aランクのみ）
  
  -- メタ情報
  effective_date TEXT DEFAULT '2026-03-01', -- 適用開始日
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(area_rank, effective_date)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_distance_area_pricing_rank ON distance_area_pricing(area_rank);
CREATE INDEX IF NOT EXISTS idx_distance_area_pricing_distance ON distance_area_pricing(distance_km);
CREATE INDEX IF NOT EXISTS idx_distance_area_pricing_effective ON distance_area_pricing(effective_date);

-- 本社座標テーブル（距離計算の基点）
CREATE TABLE IF NOT EXISTS office_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  office_name TEXT NOT NULL,
  postal_code TEXT,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2026年3月1日改定料金データ投入
-- ========================================

INSERT OR REPLACE INTO distance_area_pricing (
  area_rank, distance_km, price_index, regions,
  dedicated_price_1, dedicated_price_2, charter_2t_price_1, charter_2t_price_2,
  road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee,
  oneman_discount_eligible, oneman_discount_amount, highway_included,
  effective_date, notes
) VALUES
-- Aランク: 15km圏内 - 大阪市
('A', 15, 100, '大阪市',
 53000, 55000, 55000, 58000,
 10000, 5000, 25000, 20000,
 1, 15000, 1,
 '2026-03-01', '高速料金込み'),

-- Bランク: 30km圏内 - 大阪府・神戸市・阪神南・阪神北・京都市・山城・奈良県
('B', 30, 105, '大阪府,神戸市,阪神南,阪神北,京都市,山城,奈良県',
 56000, 58000, 58000, 61000,
 11000, 6000, 26000, 21000,
 1, 15000, 0,
 '2026-03-01', NULL),

-- Cランク: 50km圏内 - 南丹
('C', 50, 110, '南丹',
 59000, 61000, 61000, 64000,
 12000, 6000, 28000, 22000,
 1, 15000, 0,
 '2026-03-01', NULL),

-- Dランク: 100km圏内 - 東播磨・北播磨・中播磨・丹波・滋賀県・和歌山県
('D', 100, 120, '東播磨,北播磨,中播磨,丹波,滋賀県,和歌山県',
 64000, 66000, 66000, 70000,
 12000, 6000, 30000, 24000,
 1, 15000, 0,
 '2026-03-01', NULL),

-- Eランク: 150km圏内 - 淡路・西播磨・中丹・三重県
('E', 150, 130, '淡路,西播磨,中丹,三重県',
 69000, 72000, 72000, 76000,
 13000, 7000, 33000, 26000,
 1, 15000, 0,
 '2026-03-01', NULL),

-- Fランク: 200km圏内 - 但馬・丹後・愛知県・岐阜県・徳島県・香川県
('F', 200, 140, '但馬,丹後,愛知県,岐阜県,徳島県,香川県',
 75000, 77000, 77000, 81000,
 14000, 7000, 35000, 28000,
 1, 15000, 0,
 '2026-03-01', NULL),

-- Gランク: 300km圏内 - 岡山県・鳥取県・福井県
('G', 300, 160, '岡山県,鳥取県,福井県',
 85000, 88000, 88000, 93000,
 NULL, 8000, NULL, NULL,
 0, 15000, 0,
 '2026-03-01', '道路許可・現地調査非対応'),

-- Hランク: 400km圏内 - 広島県・愛媛県・高知県・島根県・石川県・富山県
('H', 400, 180, '広島県,愛媛県,高知県,島根県,石川県,富山県',
 96000, 99000, 99000, 105000,
 NULL, 9000, NULL, NULL,
 0, 15000, 0,
 '2026-03-01', '道路許可・現地調査非対応'),

-- Iランク: 500km圏内 - 山口県
('I', 500, 200, '山口県',
 106000, 110000, 110000, 116000,
 NULL, 10000, NULL, NULL,
 0, 15000, 0,
 '2026-03-01', '道路許可・現地調査非対応');

-- 本社（オフィスM2）座標登録
-- 〒550-0014 大阪市西区北堀江3-6-8
INSERT OR REPLACE INTO office_locations (
  office_name, postal_code, address, latitude, longitude, is_primary
) VALUES (
  'オフィスM2本社', '550-0014', '大阪市西区北堀江3-6-8',
  34.6725, 135.4882, 1
);

-- 既存vehicle_pricingにE〜Iランクのデータも追加（既存の共配/半日/終日体系を拡張）
-- 一次改定の専属便料金をベースに、既存の稼働形態別料金を按分して追加
INSERT OR IGNORE INTO vehicle_pricing (vehicle_type, operation_type, area, price, user_id) VALUES
-- 2t車 E〜Iランク
('2t車', '共配', 'E', 34000, 'system'),
('2t車', '共配', 'F', 37000, 'system'),
('2t車', '共配', 'G', 42000, 'system'),
('2t車', '共配', 'H', 48000, 'system'),
('2t車', '共配', 'I', 53000, 'system'),
('2t車', '半日', 'E', 39000, 'system'),
('2t車', '半日', 'F', 42000, 'system'),
('2t車', '半日', 'G', 48000, 'system'),
('2t車', '半日', 'H', 55000, 'system'),
('2t車', '半日', 'I', 60000, 'system'),
('2t車', '終日', 'E', 49000, 'system'),
('2t車', '終日', 'F', 53000, 'system'),
('2t車', '終日', 'G', 60000, 'system'),
('2t車', '終日', 'H', 68000, 'system'),
('2t車', '終日', 'I', 75000, 'system'),
-- 4t車 E〜Iランク
('4t車', '共配', 'E', 45000, 'system'),
('4t車', '共配', 'F', 48000, 'system'),
('4t車', '共配', 'G', 55000, 'system'),
('4t車', '共配', 'H', 62000, 'system'),
('4t車', '共配', 'I', 68000, 'system'),
('4t車', '半日', 'E', 55000, 'system'),
('4t車', '半日', 'F', 58000, 'system'),
('4t車', '半日', 'G', 65000, 'system'),
('4t車', '半日', 'H', 73000, 'system'),
('4t車', '半日', 'I', 80000, 'system'),
('4t車', '終日', 'E', 70000, 'system'),
('4t車', '終日', 'F', 75000, 'system'),
('4t車', '終日', 'G', 85000, 'system'),
('4t車', '終日', 'H', 96000, 'system'),
('4t車', '終日', 'I', 106000, 'system'),

-- 専属便タイプの追加（distance_area_pricingの一次改定料金を使用）
('専属便', '終日', 'A', 53000, 'system'),
('専属便', '終日', 'B', 56000, 'system'),
('専属便', '終日', 'C', 59000, 'system'),
('専属便', '終日', 'D', 64000, 'system'),
('専属便', '終日', 'E', 69000, 'system'),
('専属便', '終日', 'F', 75000, 'system'),
('専属便', '終日', 'G', 85000, 'system'),
('専属便', '終日', 'H', 96000, 'system'),
('専属便', '終日', 'I', 106000, 'system'),

-- 2tチャーター（distance_area_pricingの一次改定料金を使用）
('2tチャーター', '終日', 'A', 55000, 'system'),
('2tチャーター', '終日', 'B', 58000, 'system'),
('2tチャーター', '終日', 'C', 61000, 'system'),
('2tチャーター', '終日', 'D', 66000, 'system'),
('2tチャーター', '終日', 'E', 72000, 'system'),
('2tチャーター', '終日', 'F', 77000, 'system'),
('2tチャーター', '終日', 'G', 88000, 'system'),
('2tチャーター', '終日', 'H', 99000, 'system'),
('2tチャーター', '終日', 'I', 110000, 'system');
