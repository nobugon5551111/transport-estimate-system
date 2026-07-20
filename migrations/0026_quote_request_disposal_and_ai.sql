-- 見積依頼テーブルに引取家具（廃棄）カラムを追加
ALTER TABLE quote_requests ADD COLUMN furniture_disposal TEXT NOT NULL DEFAULT '無';
ALTER TABLE quote_requests ADD COLUMN furniture_disposal_items TEXT DEFAULT '[]';

-- AI自動見積結果を保存するカラムを追加
ALTER TABLE quote_requests ADD COLUMN ai_estimate_json TEXT;
ALTER TABLE quote_requests ADD COLUMN ai_estimate_generated_at DATETIME;
ALTER TABLE quote_requests ADD COLUMN ai_estimate_error TEXT;
