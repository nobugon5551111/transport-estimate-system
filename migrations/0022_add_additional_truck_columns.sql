-- 4トン車追加（フリー入力）用カラム追加
ALTER TABLE estimates ADD COLUMN additional_truck_count INTEGER DEFAULT 0;
ALTER TABLE estimates ADD COLUMN additional_truck_unit_price INTEGER DEFAULT 0;
ALTER TABLE estimates ADD COLUMN additional_truck_cost INTEGER DEFAULT 0;
