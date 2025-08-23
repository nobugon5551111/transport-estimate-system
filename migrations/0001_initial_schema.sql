-- 輸送見積もりシステム 初期スキーマ
-- Created: 2025-08-18

-- 顧客マスタ
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 顧客名
  contact_person TEXT,                   -- 担当者名
  phone TEXT,                           -- 電話番号
  email TEXT,                           -- メールアドレス
  address TEXT,                         -- 住所
  notes TEXT,                           -- 備考
  user_id TEXT NOT NULL,                -- ユーザーID（Firebase匿名認証）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 案件マスタ
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,          -- 顧客ID
  name TEXT NOT NULL,                    -- 案件名
  description TEXT,                      -- 案件説明
  status TEXT NOT NULL DEFAULT 'initial', -- ステータス（initial, quote_sent, under_consideration, order, failed）
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 見積書テーブル
CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,          -- 顧客ID
  project_id INTEGER NOT NULL,           -- 案件ID
  estimate_number TEXT NOT NULL,         -- 見積書番号
  
  -- 配送先情報
  delivery_address TEXT NOT NULL,        -- 配送先住所
  delivery_postal_code TEXT,             -- 郵便番号
  delivery_area TEXT NOT NULL,           -- エリア（A/B/C/D）
  
  -- 車両情報
  vehicle_type TEXT NOT NULL,            -- 車種（2t車、4t車）
  operation_type TEXT NOT NULL,          -- 稼働形態（共配／半日／終日）
  vehicle_cost REAL NOT NULL DEFAULT 0,  -- 車両費用
  
  -- スタッフ情報
  supervisor_count INTEGER DEFAULT 0,    -- スーパーバイザー人数
  leader_count INTEGER DEFAULT 0,        -- リーダー人数
  m2_staff_half_day INTEGER DEFAULT 0,   -- M2スタッフ（半日）
  m2_staff_full_day INTEGER DEFAULT 0,   -- M2スタッフ（終日）
  temp_staff_half_day INTEGER DEFAULT 0, -- 派遣スタッフ（半日）
  temp_staff_full_day INTEGER DEFAULT 0, -- 派遣スタッフ（終日）
  staff_cost REAL NOT NULL DEFAULT 0,    -- スタッフ費用合計
  
  -- その他サービス
  parking_officer_hours REAL DEFAULT 0,  -- 駐車対策員（時間）
  parking_officer_cost REAL DEFAULT 0,   -- 駐車対策員費用
  
  transport_vehicles INTEGER DEFAULT 0,   -- 人員輸送車両台数
  transport_within_20km BOOLEAN DEFAULT TRUE, -- 20km圏内フラグ
  transport_distance REAL DEFAULT 0,     -- 距離（km）
  transport_fuel_cost REAL DEFAULT 0,    -- 燃料費
  transport_cost REAL DEFAULT 0,         -- 人員輸送費用
  
  waste_disposal_size TEXT DEFAULT 'none', -- 引き取り廃棄（large/medium/small/none）
  waste_disposal_cost REAL DEFAULT 0,    -- 引き取り廃棄費用
  
  protection_work BOOLEAN DEFAULT FALSE, -- 養生作業有無
  protection_floors INTEGER DEFAULT 0,   -- 荷下ろしフロア数
  protection_cost REAL DEFAULT 0,        -- 養生作業費用
  
  material_collection_size TEXT DEFAULT 'none', -- 残材回収（many/medium/few/none）
  material_collection_cost REAL DEFAULT 0, -- 残材回収費用
  
  construction_m2_staff INTEGER DEFAULT 0, -- 施工M2スタッフ数
  construction_partner TEXT,              -- 協力会社名
  construction_cost REAL DEFAULT 0,      -- 施工費用
  
  work_time_type TEXT DEFAULT 'normal',  -- 作業時間帯（normal/early/night/midnight）
  work_time_multiplier REAL DEFAULT 1.0, -- 割増率
  
  parking_fee REAL DEFAULT 0,            -- 実費：駐車料金
  highway_fee REAL DEFAULT 0,            -- 実費：高速料金
  
  -- 金額計算
  subtotal REAL NOT NULL DEFAULT 0,      -- 小計
  tax_rate REAL NOT NULL DEFAULT 0.1,    -- 消費税率
  tax_amount REAL NOT NULL DEFAULT 0,    -- 消費税額
  total_amount REAL NOT NULL DEFAULT 0,  -- 合計金額
  
  -- メタ情報
  notes TEXT,                            -- 備考
  ai_email_generated TEXT,               -- AI生成メール文
  pdf_generated BOOLEAN DEFAULT FALSE,   -- PDF生成フラグ
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- ステータス履歴テーブル
CREATE TABLE IF NOT EXISTS status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,           -- 案件ID
  estimate_id INTEGER,                   -- 見積ID（任意）
  old_status TEXT,                       -- 変更前ステータス
  new_status TEXT NOT NULL,              -- 変更後ステータス
  notes TEXT,                           -- 変更理由・備考
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (estimate_id) REFERENCES estimates(id)
);

-- マスタ設定テーブル
CREATE TABLE IF NOT EXISTS master_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,                -- カテゴリ（staff/area/vehicle/service）
  subcategory TEXT NOT NULL,             -- サブカテゴリ
  key TEXT NOT NULL,                     -- キー
  value TEXT NOT NULL,                   -- 値
  data_type TEXT DEFAULT 'string',       -- データ型（string/number/boolean）
  description TEXT,                      -- 説明
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, subcategory, key, user_id)
);

-- エリア設定テーブル
CREATE TABLE IF NOT EXISTS area_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postal_code_prefix TEXT NOT NULL,      -- 郵便番号2桁プレフィックス
  area_name TEXT NOT NULL,               -- エリア名
  area_rank TEXT NOT NULL,               -- エリアランク（A/B/C/D）
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(postal_code_prefix, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_project_id ON estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at);
CREATE INDEX IF NOT EXISTS idx_status_history_project_id ON status_history(project_id);
CREATE INDEX IF NOT EXISTS idx_status_history_user_id ON status_history(user_id);
CREATE INDEX IF NOT EXISTS idx_master_settings_user_id ON master_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_master_settings_category ON master_settings(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_area_settings_user_id ON area_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_area_settings_postal_code ON area_settings(postal_code_prefix);