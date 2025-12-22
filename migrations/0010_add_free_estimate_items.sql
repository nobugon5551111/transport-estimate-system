-- フリー見積項目テーブル
CREATE TABLE IF NOT EXISTS free_estimate_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  unit TEXT,
  quantity REAL DEFAULT 1,
  unit_price REAL DEFAULT 0,
  total_price REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_free_estimate_items_estimate_id ON free_estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_free_estimate_items_sort_order ON free_estimate_items(estimate_id, sort_order);
