-- 担当者マスタテーブル
CREATE TABLE IF NOT EXISTS staff_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  seal_name TEXT,
  email TEXT,
  department TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_staff_members_active ON staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_members_sort ON staff_members(sort_order, name);
