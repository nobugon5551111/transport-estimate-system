-- 顧客マスタにログイン用カラム追加
ALTER TABLE customers ADD COLUMN login_id TEXT;
ALTER TABLE customers ADD COLUMN login_password TEXT;

-- ログインIDにユニークインデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_login_id ON customers(login_id) WHERE login_id IS NOT NULL;

-- 見積依頼テーブル
CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  
  -- 担当者・案件
  contact_person TEXT NOT NULL,
  project_name TEXT NOT NULL,
  
  -- 1. 配送先・ルート情報
  delivery_date TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  delivery_postal_code TEXT NOT NULL,
  pickup_location TEXT DEFAULT '',
  
  -- 2. 配送する家具の情報（JSON配列で複数品目対応）
  items_json TEXT NOT NULL DEFAULT '[]',
  
  -- 3. 配送先の設置環境
  building_type TEXT NOT NULL,
  installation_floor TEXT NOT NULL,
  has_elevator TEXT NOT NULL DEFAULT '無',
  elevator_size TEXT DEFAULT '',
  has_parking TEXT NOT NULL DEFAULT '無',
  has_protection_work TEXT DEFAULT '無',
  protection_scope TEXT DEFAULT '',
  has_hoisting TEXT DEFAULT '無',
  has_crane TEXT DEFAULT '無',
  delivery_route_info TEXT DEFAULT '',
  
  -- 備考
  notes TEXT DEFAULT '',
  
  -- ステータス管理
  status TEXT NOT NULL DEFAULT 'pending',
  estimate_id INTEGER,
  processed_at DATETIME,
  processed_by TEXT,
  
  -- メタ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (estimate_id) REFERENCES estimates(id)
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_customer ON quote_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at);
