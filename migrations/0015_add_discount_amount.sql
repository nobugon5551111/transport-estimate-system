-- 値引き額カラム追加
ALTER TABLE estimates ADD COLUMN discount_amount REAL DEFAULT 0;
