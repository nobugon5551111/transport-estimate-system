-- バックアップスケジュール管理テーブル

CREATE TABLE IF NOT EXISTS backup_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- daily, weekly, monthly
  frequency_value INTEGER, -- 曜日(0-6)または日付(1-31)
  time_hour INTEGER DEFAULT 2, -- 実行時刻（時）
  time_minute INTEGER DEFAULT 0, -- 実行時刻（分）
  target_tables TEXT, -- JSON配列でテーブル名を保存
  retention_days INTEGER DEFAULT 30, -- バックアップ保持日数
  is_active INTEGER DEFAULT 1, -- スケジュール有効/無効
  last_run DATETIME, -- 最終実行日時
  run_count INTEGER DEFAULT 0, -- 実行回数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT DEFAULT 'system'
);

-- バックアップ実行ログテーブル
CREATE TABLE IF NOT EXISTS backup_execution_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER,
  backup_id INTEGER,
  execution_status TEXT NOT NULL, -- success, failed, skipped
  execution_details TEXT,
  execution_time_ms INTEGER,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES backup_schedules(id),
  FOREIGN KEY (backup_id) REFERENCES backup_metadata(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_backup_schedules_active ON backup_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_frequency ON backup_schedules(frequency);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_last_run ON backup_schedules(last_run);
CREATE INDEX IF NOT EXISTS idx_backup_execution_log_schedule_id ON backup_execution_log(schedule_id);
CREATE INDEX IF NOT EXISTS idx_backup_execution_log_executed_at ON backup_execution_log(executed_at);

-- サンプルスケジュール設定
INSERT OR IGNORE INTO backup_schedules (
  schedule_name, frequency, frequency_value, time_hour, time_minute, 
  target_tables, retention_days, is_active
) VALUES 
  ('日次バックアップ', 'daily', NULL, 2, 0, 
   '["customers", "projects", "estimates"]', 7, 1),
  ('週次フルバックアップ', 'weekly', 0, 3, 0, 
   '["customers", "projects", "estimates", "vehicle_pricing", "staff_rates"]', 30, 1),
  ('月次アーカイブ', 'monthly', 1, 1, 0, 
   '["customers", "projects", "estimates", "vehicle_pricing", "staff_rates"]', 365, 1);