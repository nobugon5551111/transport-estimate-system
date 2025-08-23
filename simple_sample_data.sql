-- シンプルなサンプルデータ投入スクリプト

-- マスタ設定テーブル（シンプル版）
CREATE TABLE IF NOT EXISTS master_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key)
);

-- エリア設定テーブル（シンプル版）  
CREATE TABLE IF NOT EXISTS area_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_code TEXT UNIQUE NOT NULL,
  postal_code_prefix TEXT NOT NULL,
  area_name TEXT NOT NULL,
  area_rank TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 顧客テーブル（シンプル版）
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  user_id TEXT DEFAULT 'user001',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 案件テーブル（シンプル版）
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  customer_id INTEGER,
  status TEXT DEFAULT 'initial',
  priority TEXT DEFAULT 'medium',
  description TEXT,
  notes TEXT,
  user_id TEXT DEFAULT 'user001',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- スタッフ単価のサンプルデータ
INSERT OR REPLACE INTO master_settings (category, key, value) VALUES 
('staff', 'supervisor_rate', '15000'),
('staff', 'leader_rate', '12000'),
('staff', 'm2_staff_half_day_rate', '6000'),
('staff', 'm2_staff_full_day_rate', '10000'),
('staff', 'temp_staff_half_day_rate', '5500'),
('staff', 'temp_staff_full_day_rate', '9500');

-- 車両料金のサンプルデータ（2t車）
INSERT OR REPLACE INTO master_settings (category, key, value) VALUES 
('vehicle', 'vehicle_2t_shared_A', '15000'),
('vehicle', 'vehicle_2t_half_day_A', '20000'),
('vehicle', 'vehicle_2t_full_day_A', '30000'),
('vehicle', 'vehicle_2t_shared_B', '18000'),
('vehicle', 'vehicle_2t_half_day_B', '24000'),
('vehicle', 'vehicle_2t_full_day_B', '36000'),
('vehicle', 'vehicle_2t_shared_C', '22500'),
('vehicle', 'vehicle_2t_half_day_C', '30000'),
('vehicle', 'vehicle_2t_full_day_C', '45000'),
('vehicle', 'vehicle_2t_shared_D', '30000'),
('vehicle', 'vehicle_2t_half_day_D', '40000'),
('vehicle', 'vehicle_2t_full_day_D', '60000');

-- 車両料金のサンプルデータ（4t車）
INSERT OR REPLACE INTO master_settings (category, key, value) VALUES 
('vehicle', 'vehicle_4t_shared_A', '25000'),
('vehicle', 'vehicle_4t_half_day_A', '30000'),
('vehicle', 'vehicle_4t_full_day_A', '45000'),
('vehicle', 'vehicle_4t_shared_B', '30000'),
('vehicle', 'vehicle_4t_half_day_B', '36000'),
('vehicle', 'vehicle_4t_full_day_B', '54000'),
('vehicle', 'vehicle_4t_shared_C', '37500'),
('vehicle', 'vehicle_4t_half_day_C', '45000'),
('vehicle', 'vehicle_4t_full_day_C', '67500'),
('vehicle', 'vehicle_4t_shared_D', '50000'),
('vehicle', 'vehicle_4t_half_day_D', '60000'),
('vehicle', 'vehicle_4t_full_day_D', '90000');

-- その他サービス料金のサンプルデータ
INSERT OR REPLACE INTO master_settings (category, key, value) VALUES 
('services', 'parking_officer_hourly_rate', '3000'),
('services', 'transport_vehicle_20km_rate', '8000'),
('services', 'transport_vehicle_per_km_rate', '100'),
('services', 'fuel_per_liter_rate', '150'),
('services', 'waste_disposal_small_rate', '5000'),
('services', 'waste_disposal_medium_rate', '10000'),
('services', 'waste_disposal_large_rate', '20000'),
('services', 'protection_work_base_rate', '8000'),
('services', 'protection_work_floor_rate', '2000'),
('services', 'material_collection_small_rate', '3000'),
('services', 'material_collection_medium_rate', '8000'),
('services', 'material_collection_large_rate', '15000'),
('services', 'construction_m2_staff_rate', '8000'),
('services', 'work_time_early_multiplier', '1.15'),
('services', 'work_time_night_multiplier', '1.25'),
('services', 'work_time_midnight_multiplier', '1.5'),
('services', 'tax_rate', '0.10'),
('services', 'estimate_prefix', 'EST');

-- エリア設定のサンプルデータ
INSERT OR REPLACE INTO area_settings (area_code, postal_code_prefix, area_name, area_rank) VALUES 
('TOKYO_CENTER', '10', '東京都千代田区・中央区', 'A'),
('TOKYO_MINATO', '10', '東京都港区・渋谷区', 'A'),
('OSAKA_CENTER', '53', '大阪府大阪市中央区', 'B'),
('KANAGAWA', '21', '神奈川県横浜市', 'B'),
('SAITAMA', '33', '埼玉県さいたま市', 'C'),
('OKINAWA', '90', '沖縄県那覇市', 'D');

-- 顧客のサンプルデータ  
INSERT OR REPLACE INTO customers (id, name, contact_person, phone, email, address, notes) VALUES 
(1, '株式会社サンプル商事', '田中太郎', '03-1234-5678', 'tanaka@sample-corp.com', '東京都千代田区丸の内1-1-1', '長期取引先です'),
(2, '有限会社テスト運送', '佐藤花子', '06-9876-5432', 'sato@test-transport.co.jp', '大阪府大阪市中央区本町2-2-2', '急ぎの案件が多い'),
(3, '合同会社デモ物流', '鈴木次郎', '045-2468-1357', 'suzuki@demo-logistics.com', '神奈川県横浜市西区みなとみらい3-3-3', '新規開拓先'),
(4, '株式会社モックアップ', '高橋三郎', '048-1357-2468', 'takahashi@mockup-inc.jp', '埼玉県さいたま市大宮区桜木町4-4-4', '中規模案件メイン'),
(5, '沖縄サンプル企業', '山田美咲', '098-3579-2468', 'yamada@okinawa-sample.co.jp', '沖縄県那覇市久茂地5-5-5', '離島配送専門');

-- 案件のサンプルデータ
INSERT OR REPLACE INTO projects (id, name, customer_id, status, priority, description, notes) VALUES 
(1, 'オフィス移転プロジェクト', 1, 'quote_sent', 'high', '本社移転に伴う大型家具・OA機器の輸送', '3月末までに完了予定'),
(2, '工場設備搬送案件', 2, 'under_consideration', 'urgent', '製造ライン機械の移設作業', '夜間作業必須'),
(3, '倉庫商品配送業務', 3, 'order', 'medium', '定期的な商品配送業務の委託', '月次契約'),
(4, '展示会設営サポート', 4, 'initial', 'medium', '展示会ブース設営用資材の輸送', 'イベント期間限定'),
(5, '離島配送テスト案件', 5, 'failed', 'low', '沖縄本島から離島への配送テスト', 'コスト面で見合わず'),
(6, '緊急医療機器輸送', 1, 'quote_sent', 'urgent', '病院向け医療機器の緊急輸送', '温度管理必須'),
(7, '食品配送定期便', 2, 'order', 'high', '冷凍食品の定期配送業務', '冷蔵車両使用');