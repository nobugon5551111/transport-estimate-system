-- 案件テーブルに priority と notes カラムを追加
ALTER TABLE projects ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN notes TEXT DEFAULT '';

-- 既存のデータにデフォルト値を設定
UPDATE projects SET priority = 'medium' WHERE priority IS NULL;
UPDATE projects SET notes = '' WHERE notes IS NULL;