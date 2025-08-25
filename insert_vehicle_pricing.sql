-- 車両料金設定データの挿入
-- 各車両タイプ、稼働形態、配送エリアの組み合わせで料金を設定

-- 2トン車 - 終日 - 各エリア
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('vehicle', 'pricing', 'vehicle_2t_full_day_A', '25000', 'number', '2トン車・終日・Aエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_full_day_B', '30000', 'number', '2トン車・終日・Bエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_full_day_C', '35000', 'number', '2トン車・終日・Cエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_full_day_D', '40000', 'number', '2トン車・終日・Dエリア料金', '1');

-- 2トン車 - 半日 - 各エリア
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('vehicle', 'pricing', 'vehicle_2t_half_day_A', '15000', 'number', '2トン車・半日・Aエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_half_day_B', '18000', 'number', '2トン車・半日・Bエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_half_day_C', '21000', 'number', '2トン車・半日・Cエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_half_day_D', '24000', 'number', '2トン車・半日・Dエリア料金', '1');

-- 2トン車 - 共配 - 各エリア
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('vehicle', 'pricing', 'vehicle_2t_shared_A', '12000', 'number', '2トン車・共配・Aエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_shared_B', '14000', 'number', '2トン車・共配・Bエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_shared_C', '16000', 'number', '2トン車・共配・Cエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_2t_shared_D', '18000', 'number', '2トン車・共配・Dエリア料金', '1');

-- 4トン車 - 終日 - 各エリア
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('vehicle', 'pricing', 'vehicle_4t_full_day_A', '45000', 'number', '4トン車・終日・Aエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_full_day_B', '50000', 'number', '4トン車・終日・Bエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_full_day_C', '55000', 'number', '4トン車・終日・Cエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_full_day_D', '60000', 'number', '4トン車・終日・Dエリア料金', '1');

-- 4トン車 - 半日 - 各エリア
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('vehicle', 'pricing', 'vehicle_4t_half_day_A', '25000', 'number', '4トン車・半日・Aエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_half_day_B', '28000', 'number', '4トン車・半日・Bエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_half_day_C', '31000', 'number', '4トン車・半日・Cエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_half_day_D', '34000', 'number', '4トン車・半日・Dエリア料金', '1');

-- 4トン車 - 共配 - 各エリア
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('vehicle', 'pricing', 'vehicle_4t_shared_A', '20000', 'number', '4トン車・共配・Aエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_shared_B', '22000', 'number', '4トン車・共配・Bエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_shared_C', '24000', 'number', '4トン車・共配・Cエリア料金', '1'),
('vehicle', 'pricing', 'vehicle_4t_shared_D', '26000', 'number', '4トン車・共配・Dエリア料金', '1');

-- エリア設定の挿入
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('area', 'settings', 'A_name', '京都市内', 'string', 'Aエリア名称', '1'),
('area', 'settings', 'A_description', '京都市内及び近郊', 'string', 'Aエリア詳細', '1'),
('area', 'settings', 'B_name', '京都府内', 'string', 'Bエリア名称', '1'),
('area', 'settings', 'B_description', '京都府内（市外）', 'string', 'Bエリア詳細', '1'),
('area', 'settings', 'C_name', '関西圏', 'string', 'Cエリア名称', '1'),
('area', 'settings', 'C_description', '大阪・兵庫・奈良・滋賀', 'string', 'Cエリア詳細', '1'),
('area', 'settings', 'D_name', 'その他', 'string', 'Dエリア名称', '1'),
('area', 'settings', 'D_description', 'その他遠方エリア', 'string', 'Dエリア詳細', '1');

-- スタッフ料金設定の挿入
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id)
VALUES 
('staff', 'pricing', 'hourly_rate', '2500', 'number', 'スタッフ時給（円/時間）', '1'),
('staff', 'pricing', 'daily_rate', '15000', 'number', 'スタッフ日給（円/日）', '1'),
('staff', 'pricing', 'overtime_rate', '3500', 'number', 'スタッフ残業料金（円/時間）', '1');