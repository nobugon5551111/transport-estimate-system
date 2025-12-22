-- バックアップシステムのテーブル作成

-- バックアップメタデータテーブル
CREATE TABLE IF NOT EXISTS backup_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'manual', -- manual, scheduled, auto
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  record_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  created_by TEXT DEFAULT 'system',
  notes TEXT
);

-- バックアップ履歴テーブル（操作ログ）
CREATE TABLE IF NOT EXISTS backup_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_id INTEGER,
  operation_type TEXT NOT NULL, -- create, download, restore, delete
  operation_status TEXT NOT NULL, -- success, failed
  operation_details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  FOREIGN KEY (backup_id) REFERENCES backup_metadata(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_backup_metadata_created_at ON backup_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_status ON backup_metadata(status);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_expires_at ON backup_metadata(expires_at);
CREATE INDEX IF NOT EXISTS idx_backup_history_backup_id ON backup_history(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at);

-- サンプルデータ（開発用）
INSERT OR IGNORE INTO backup_metadata (
  backup_name, backup_type, file_name, file_size, record_count, status, created_at, expires_at
) VALUES 
  ('初期データバックアップ', 'manual', 'initial_backup_2024-08-22.json', 15420, 25, 'completed', 
   '2024-08-22T10:00:00.000Z', '2024-09-22T10:00:00.000Z'),
  ('週次自動バックアップ', 'scheduled', 'weekly_backup_2024-08-22.json', 28540, 45, 'completed',
   '2024-08-22T02:00:00.000Z', '2024-09-22T02:00:00.000Z');