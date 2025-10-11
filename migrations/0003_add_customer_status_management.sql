-- 顧客ステータス管理機能追加
-- 論理削除と復活機能をサポート

-- customersテーブルにステータス管理カラムを追加
ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE customers ADD COLUMN deleted_at DATETIME NULL;
ALTER TABLE customers ADD COLUMN deleted_reason TEXT NULL;

-- ステータス値の説明:
-- 'active': 有効（通常表示）
-- 'inactive': 無効（一時的に非表示、いつでも復活可能）
-- 'deleted': 論理削除（非表示、復活可能、将来的に完全削除対象）

-- インデックス追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);

-- 既存データはすべて'active'に設定
UPDATE customers SET status = 'active' WHERE status IS NULL;