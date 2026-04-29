-- Migration: スタッフ・サービスマスターにプランA/B対応追加
-- Created: 2026-04-29
-- 全マスターデータ（車両・スタッフ・サービス）でプランA/Bを統一管理

-- 1. staff_rates テーブルを再作成（UNIQUE制約にplan_typeを含める）
CREATE TABLE staff_rates_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_type TEXT NOT NULL,
  rate REAL NOT NULL,
  user_id TEXT DEFAULT 'system',
  plan_type TEXT DEFAULT 'A',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(staff_type, user_id, plan_type)
);

-- 既存データをプランAとしてコピー
INSERT INTO staff_rates_new (id, staff_type, rate, user_id, plan_type, created_at, updated_at)
SELECT id, staff_type, rate, user_id, 'A', created_at, updated_at FROM staff_rates;

-- 旧テーブルを削除して新テーブルをリネーム
DROP TABLE staff_rates;
ALTER TABLE staff_rates_new RENAME TO staff_rates;

-- プランB用のスタッフ単価データを複製（Aと同じ値でコピー）
INSERT INTO staff_rates (staff_type, rate, user_id, plan_type, created_at, updated_at)
SELECT staff_type, rate, user_id, 'B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM staff_rates WHERE plan_type = 'A';

-- 2. master_settings テーブルに plan_type カラム追加
ALTER TABLE master_settings ADD COLUMN plan_type TEXT DEFAULT 'A';

-- 既存データをプランAとして設定
UPDATE master_settings SET plan_type = 'A' WHERE plan_type IS NULL;

-- プランB用のスタッフ日当データを複製
INSERT INTO master_settings (category, subcategory, key, value, data_type, description, user_id, plan_type, created_at, updated_at)
SELECT category, subcategory, key, value, data_type, description, user_id, 'B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM master_settings WHERE plan_type = 'A' AND category = 'staff';

-- プランB用のサービス料金データを複製
INSERT INTO master_settings (category, subcategory, key, value, data_type, description, user_id, plan_type, created_at, updated_at)
SELECT category, subcategory, key, value, data_type, description, user_id, 'B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM master_settings WHERE plan_type = 'A' AND category = 'service';

-- システム設定（system, vehicle）はプラン共通のためコピー不要
-- vehicleカテゴリは distance_area_pricing / konsai_pricing テーブルで既にA/B管理済み

-- 3. インデックス追加
CREATE INDEX IF NOT EXISTS idx_staff_rates_plan ON staff_rates(plan_type);
CREATE INDEX IF NOT EXISTS idx_master_settings_plan ON master_settings(plan_type);
CREATE INDEX IF NOT EXISTS idx_master_settings_cat_plan ON master_settings(category, plan_type);
