-- Migration: マスターデータテーブル追加
-- Created: 2025-10-28
-- Purpose: 車両料金マスターとスタッフ料金マスターテーブルの作成

-- 車両料金マスター
CREATE TABLE IF NOT EXISTS vehicle_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_type TEXT NOT NULL,        -- 車種（2t車、4t車）
  operation_type TEXT NOT NULL,      -- 稼働形態（共配、半日、終日）
  area TEXT NOT NULL,                -- エリア（A、B、C、D）
  price REAL NOT NULL,               -- 料金
  user_id TEXT DEFAULT 'system',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vehicle_type, operation_type, area, user_id)
);

-- スタッフ料金マスター
CREATE TABLE IF NOT EXISTS staff_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_type TEXT NOT NULL,          -- スタッフ種別（supervisor、leader、m2_full、m2_half、temp_full、temp_half）
  rate REAL NOT NULL,                -- 単価
  user_id TEXT DEFAULT 'system',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(staff_type, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_vehicle_pricing_lookup ON vehicle_pricing(vehicle_type, operation_type, area);
CREATE INDEX IF NOT EXISTS idx_staff_rates_type ON staff_rates(staff_type);

-- 車両料金マスターのサンプルデータ
INSERT OR IGNORE INTO vehicle_pricing (vehicle_type, operation_type, area, price, user_id) VALUES
-- 2t車
('2t車', '共配', 'A', 25000, 'system'),
('2t車', '共配', 'B', 28000, 'system'),
('2t車', '共配', 'C', 30000, 'system'),
('2t車', '共配', 'D', 32000, 'system'),
('2t車', '半日', 'A', 30000, 'system'),
('2t車', '半日', 'B', 33000, 'system'),
('2t車', '半日', 'C', 35000, 'system'),
('2t車', '半日', 'D', 37000, 'system'),
('2t車', '終日', 'A', 40000, 'system'),
('2t車', '終日', 'B', 43000, 'system'),
('2t車', '終日', 'C', 45000, 'system'),
('2t車', '終日', 'D', 47000, 'system'),

-- 4t車
('4t車', '共配', 'A', 35000, 'system'),
('4t車', '共配', 'B', 38000, 'system'),
('4t車', '共配', 'C', 40000, 'system'),
('4t車', '共配', 'D', 42000, 'system'),
('4t車', '半日', 'A', 45000, 'system'),
('4t車', '半日', 'B', 48000, 'system'),
('4t車', '半日', 'C', 50000, 'system'),
('4t車', '半日', 'D', 52000, 'system'),
('4t車', '終日', 'A', 60000, 'system'),
('4t車', '終日', 'B', 63000, 'system'),
('4t車', '終日', 'C', 65000, 'system'),
('4t車', '終日', 'D', 67000, 'system');

-- スタッフ料金マスターのサンプルデータ
INSERT OR IGNORE INTO staff_rates (staff_type, rate, user_id) VALUES
('supervisor', 18000, 'system'),      -- スーパーバイザー
('leader', 15000, 'system'),          -- リーダー
('m2_full', 12000, 'system'),         -- M2スタッフ（終日）
('m2_half', 6000, 'system'),          -- M2スタッフ（半日）
('temp_full', 10000, 'system'),       -- 派遣スタッフ（終日）
('temp_half', 5000, 'system');        -- 派遣スタッフ（半日）
