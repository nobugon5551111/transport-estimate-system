-- サンプルデータ投入スクリプト

-- マスタ設定テーブル
CREATE TABLE IF NOT EXISTS master_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key)
);

-- エリア設定テーブル
CREATE TABLE IF NOT EXISTS area_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_code TEXT UNIQUE NOT NULL,
  postal_code_prefix TEXT NOT NULL,
  area_name TEXT NOT NULL,
  area_rank TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 顧客テーブル
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 案件テーブル
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  customer_id INTEGER,
  status TEXT DEFAULT 'initial',
  priority TEXT DEFAULT 'medium',
  description TEXT,
  notes TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 見積テーブル
CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  customer_id INTEGER,
  status TEXT DEFAULT 'draft',
  total_amount DECIMAL(15,2),
  estimate_data TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- スタッフ単価のサンプルデータ
INSERT OR REPLACE INTO master_settings (category, key, value, type) VALUES 
('staff', 'supervisor_rate', '15000', 'number'),
('staff', 'leader_rate', '12000', 'number'),
('staff', 'm2_staff_half_day_rate', '6000', 'number'),
('staff', 'm2_staff_full_day_rate', '10000', 'number'),
('staff', 'temp_staff_half_day_rate', '5500', 'number'),
('staff', 'temp_staff_full_day_rate', '9500', 'number');

-- 車両料金のサンプルデータ（2t車）
INSERT OR REPLACE INTO master_settings (category, key, value, type) VALUES 
('vehicle', 'vehicle_2t_shared_A', '15000', 'number'),
('vehicle', 'vehicle_2t_half_day_A', '20000', 'number'),
('vehicle', 'vehicle_2t_full_day_A', '30000', 'number'),
('vehicle', 'vehicle_2t_shared_B', '18000', 'number'),
('vehicle', 'vehicle_2t_half_day_B', '24000', 'number'),
('vehicle', 'vehicle_2t_full_day_B', '36000', 'number'),
('vehicle', 'vehicle_2t_shared_C', '22500', 'number'),
('vehicle', 'vehicle_2t_half_day_C', '30000', 'number'),
('vehicle', 'vehicle_2t_full_day_C', '45000', 'number'),
('vehicle', 'vehicle_2t_shared_D', '30000', 'number'),
('vehicle', 'vehicle_2t_half_day_D', '40000', 'number'),
('vehicle', 'vehicle_2t_full_day_D', '60000', 'number');

-- 車両料金のサンプルデータ（4t車）
INSERT OR REPLACE INTO master_settings (category, key, value, type) VALUES 
('vehicle', 'vehicle_4t_shared_A', '25000', 'number'),
('vehicle', 'vehicle_4t_half_day_A', '30000', 'number'),
('vehicle', 'vehicle_4t_full_day_A', '45000', 'number'),
('vehicle', 'vehicle_4t_shared_B', '30000', 'number'),
('vehicle', 'vehicle_4t_half_day_B', '36000', 'number'),
('vehicle', 'vehicle_4t_full_day_B', '54000', 'number'),
('vehicle', 'vehicle_4t_shared_C', '37500', 'number'),
('vehicle', 'vehicle_4t_half_day_C', '45000', 'number'),
('vehicle', 'vehicle_4t_full_day_C', '67500', 'number'),
('vehicle', 'vehicle_4t_shared_D', '50000', 'number'),
('vehicle', 'vehicle_4t_half_day_D', '60000', 'number'),
('vehicle', 'vehicle_4t_full_day_D', '90000', 'number');

-- その他サービス料金のサンプルデータ
INSERT OR REPLACE INTO master_settings (category, key, value, type) VALUES 
('services', 'parking_officer_hourly_rate', '3000', 'number'),
('services', 'transport_vehicle_20km_rate', '8000', 'number'),
('services', 'transport_vehicle_per_km_rate', '100', 'number'),
('services', 'fuel_per_liter_rate', '150', 'number'),
('services', 'waste_disposal_small_rate', '5000', 'number'),
('services', 'waste_disposal_medium_rate', '10000', 'number'),
('services', 'waste_disposal_large_rate', '20000', 'number'),
('services', 'protection_work_base_rate', '8000', 'number'),
('services', 'protection_work_floor_rate', '2000', 'number'),
('services', 'material_collection_small_rate', '3000', 'number'),
('services', 'material_collection_medium_rate', '8000', 'number'),
('services', 'material_collection_large_rate', '15000', 'number'),
('services', 'construction_m2_staff_rate', '8000', 'number'),
('services', 'work_time_early_multiplier', '1.15', 'number'),
('services', 'work_time_night_multiplier', '1.25', 'number'),
('services', 'work_time_midnight_multiplier', '1.5', 'number'),
('services', 'tax_rate', '0.10', 'number'),
('services', 'estimate_prefix', 'EST', 'string');

-- エリア設定のサンプルデータ
INSERT OR REPLACE INTO area_settings (area_code, postal_code_prefix, area_name, area_rank) VALUES 
('TOKYO_CENTER', '10', '東京都千代田区・中央区', 'A'),
('TOKYO_MINATO', '10', '東京都港区・渋谷区', 'A'),
('OSAKA_CENTER', '53', '大阪府大阪市中央区', 'B'),
('KANAGAWA', '21', '神奈川県横浜市', 'B'),
('SAITAMA', '33', '埼玉県さいたま市', 'C'),
('OKINAWA', '90', '沖縄県那覇市', 'D');

-- 顧客のサンプルデータ
INSERT OR REPLACE INTO customers (id, name, contact_person, phone, email, address, notes, user_id) VALUES 
(1, '株式会社サンプル商事', '田中太郎', '03-1234-5678', 'tanaka@sample-corp.com', '東京都千代田区丸の内1-1-1', '長期取引先です', 'user001'),
(2, '有限会社テスト運送', '佐藤花子', '06-9876-5432', 'sato@test-transport.co.jp', '大阪府大阪市中央区本町2-2-2', '急ぎの案件が多い', 'user001'),
(3, '合同会社デモ物流', '鈴木次郎', '045-2468-1357', 'suzuki@demo-logistics.com', '神奈川県横浜市西区みなとみらい3-3-3', '新規開拓先', 'user001'),
(4, '株式会社モックアップ', '高橋三郎', '048-1357-2468', 'takahashi@mockup-inc.jp', '埼玉県さいたま市大宮区桜木町4-4-4', '中規模案件メイン', 'user001'),
(5, '沖縄サンプル企業', '山田美咲', '098-3579-2468', 'yamada@okinawa-sample.co.jp', '沖縄県那覇市久茂地5-5-5', '離島配送専門', 'user001');

-- 案件のサンプルデータ
INSERT OR REPLACE INTO projects (id, name, customer_id, status, priority, description, notes, user_id) VALUES 
(1, 'オフィス移転プロジェクト', 1, 'quote_sent', 'high', '本社移転に伴う大型家具・OA機器の輸送', '3月末までに完了予定', 'user001'),
(2, '工場設備搬送案件', 2, 'under_consideration', 'urgent', '製造ライン機械の移設作業', '夜間作業必須', 'user001'),
(3, '倉庫商品配送業務', 3, 'order', 'medium', '定期的な商品配送業務の委託', '月次契約', 'user001'),
(4, '展示会設営サポート', 4, 'initial', 'medium', '展示会ブース設営用資材の輸送', 'イベント期間限定', 'user001'),
(5, '離島配送テスト案件', 5, 'failed', 'low', '沖縄本島から離島への配送テスト', 'コスト面で見合わず', 'user001'),
(6, '緊急医療機器輸送', 1, 'quote_sent', 'urgent', '病院向け医療機器の緊急輸送', '温度管理必須', 'user001'),
(7, '食品配送定期便', 2, 'order', 'high', '冷凍食品の定期配送業務', '冷蔵車両使用', 'user001');

-- 見積のサンプルデータ
INSERT OR REPLACE INTO estimates (id, project_id, customer_id, status, total_amount, estimate_data, user_id) VALUES 
(1, 1, 1, 'sent', 850000.00, '{"vehicle_type":"4t車","area":"A","operation_type":"終日","staff_count":{"supervisor":1,"leader":2,"m2_staff":4},"services":["養生作業","残材回収"],"transport_distance":25}', 'user001'),
(2, 2, 2, 'approved', 1200000.00, '{"vehicle_type":"4t車","area":"B","operation_type":"終日","staff_count":{"supervisor":1,"leader":3,"m2_staff":6},"services":["夜間割増","養生作業","駐車対策員"],"transport_distance":45}', 'user001'),
(3, 3, 3, 'approved', 450000.00, '{"vehicle_type":"2t車","area":"B","operation_type":"共配","staff_count":{"leader":1,"m2_staff":2},"services":[],"transport_distance":15}', 'user001'),
(4, 6, 1, 'draft', 680000.00, '{"vehicle_type":"2t車","area":"A","operation_type":"半日","staff_count":{"supervisor":1,"leader":1,"m2_staff":2},"services":["早朝割増","駐車対策員"],"transport_distance":8}', 'user001'),
(5, 7, 2, 'approved', 950000.00, '{"vehicle_type":"4t車","area":"B","operation_type":"終日","staff_count":{"leader":2,"m2_staff":3},"services":["冷蔵車両","定期契約割引"],"transport_distance":35}', 'user001');

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_master_settings_category_key ON master_settings(category, key);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_estimates_project_id ON estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);