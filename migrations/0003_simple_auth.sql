-- シンプル認証システム用テーブル

-- ユーザーテーブル（シンプル版）
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- user_id (既存のuser_idと互換性あり)
  name TEXT NOT NULL,   -- ユーザー名（見積書に印刷される名前）
  password TEXT NOT NULL,  -- bcryptハッシュ化されたパスワード
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- セッションテーブル
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 見積書テーブルに作成者名カラムを追加
-- 既存のuser_idカラムはそのまま維持
ALTER TABLE estimates ADD COLUMN created_by_name TEXT;

-- 初期ユーザー作成（パスワード: admin123）
-- bcryptハッシュは後でAPI経由で正しく生成します
INSERT OR IGNORE INTO users (id, name, password) VALUES 
  ('admin', '管理者', '$2b$10$dummy_hash_will_be_replaced');

-- 既存の見積書に作成者名を遡及適用（オプション）
UPDATE estimates SET created_by_name = '既存ユーザー' WHERE created_by_name IS NULL;
