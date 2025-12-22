-- 見積ごとの顧客担当者を保存するカラムを追加
-- パターンB: 見積ごとに担当者を指定（デフォルト値＋編集可能）

ALTER TABLE estimates ADD COLUMN customer_contact_person TEXT DEFAULT '';
