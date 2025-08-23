-- 輸送見積もりシステム 初期データ
-- テストユーザーID: test-user-001

-- エリア設定（日本の主要郵便番号プレフィックス）
INSERT OR IGNORE INTO area_settings (postal_code_prefix, area_name, area_rank, user_id) VALUES 
  ('10', '東京都（千代田区）', 'A', 'test-user-001'),
  ('11', '東京都（中央区・港区）', 'A', 'test-user-001'),
  ('15', '東京都（渋谷区・新宿区）', 'A', 'test-user-001'),
  ('20', '神奈川県（横浜市西区）', 'A', 'test-user-001'),
  ('21', '神奈川県（横浜市中区）', 'B', 'test-user-001'),
  ('27', '大阪府（大阪市都島区）', 'B', 'test-user-001'),
  ('53', '愛知県（名古屋市中村区）', 'B', 'test-user-001'),
  ('81', '福岡県（北九州市門司区）', 'C', 'test-user-001'),
  ('01', '北海道（札幌市中央区）', 'D', 'test-user-001'),
  ('98', '沖縄県（那覇市）', 'D', 'test-user-001');

-- マスタ設定 - スタッフ単価
INSERT OR IGNORE INTO master_settings (category, subcategory, key, value, data_type, description, user_id) VALUES 
  -- スタッフ単価（円/日）
  ('staff', 'daily_rate', 'supervisor', '15000', 'number', 'スーパーバイザー日当', 'test-user-001'),
  ('staff', 'daily_rate', 'leader', '12000', 'number', 'リーダー以上日当', 'test-user-001'),
  ('staff', 'daily_rate', 'm2_half_day', '6000', 'number', 'M2スタッフ半日', 'test-user-001'),
  ('staff', 'daily_rate', 'm2_full_day', '10000', 'number', 'M2スタッフ終日', 'test-user-001'),
  ('staff', 'daily_rate', 'temp_half_day', '5500', 'number', '派遣スタッフ半日', 'test-user-001'),
  ('staff', 'daily_rate', 'temp_full_day', '9500', 'number', '派遣スタッフ終日', 'test-user-001'),
  
  -- 車両料金（エリア別・稼働形態別）
  ('vehicle', '2t_shared_A', 'price', '25000', 'number', '2t車共配・Aエリア', 'test-user-001'),
  ('vehicle', '2t_shared_B', 'price', '28000', 'number', '2t車共配・Bエリア', 'test-user-001'),
  ('vehicle', '2t_shared_C', 'price', '32000', 'number', '2t車共配・Cエリア', 'test-user-001'),
  ('vehicle', '2t_shared_D', 'price', '40000', 'number', '2t車共配・Dエリア', 'test-user-001'),
  
  ('vehicle', '2t_half_day_A', 'price', '35000', 'number', '2t車半日・Aエリア', 'test-user-001'),
  ('vehicle', '2t_half_day_B', 'price', '38000', 'number', '2t車半日・Bエリア', 'test-user-001'),
  ('vehicle', '2t_half_day_C', 'price', '42000', 'number', '2t車半日・Cエリア', 'test-user-001'),
  ('vehicle', '2t_half_day_D', 'price', '50000', 'number', '2t車半日・Dエリア', 'test-user-001'),
  
  ('vehicle', '2t_full_day_A', 'price', '50000', 'number', '2t車終日・Aエリア', 'test-user-001'),
  ('vehicle', '2t_full_day_B', 'price', '55000', 'number', '2t車終日・Bエリア', 'test-user-001'),
  ('vehicle', '2t_full_day_C', 'price', '62000', 'number', '2t車終日・Cエリア', 'test-user-001'),
  ('vehicle', '2t_full_day_D', 'price', '75000', 'number', '2t車終日・Dエリア', 'test-user-001'),
  
  ('vehicle', '4t_shared_A', 'price', '35000', 'number', '4t車共配・Aエリア', 'test-user-001'),
  ('vehicle', '4t_shared_B', 'price', '38000', 'number', '4t車共配・Bエリア', 'test-user-001'),
  ('vehicle', '4t_shared_C', 'price', '42000', 'number', '4t車共配・Cエリア', 'test-user-001'),
  ('vehicle', '4t_shared_D', 'price', '52000', 'number', '4t車共配・Dエリア', 'test-user-001'),
  
  ('vehicle', '4t_half_day_A', 'price', '45000', 'number', '4t車半日・Aエリア', 'test-user-001'),
  ('vehicle', '4t_half_day_B', 'price', '48000', 'number', '4t車半日・Bエリア', 'test-user-001'),
  ('vehicle', '4t_half_day_C', 'price', '55000', 'number', '4t車半日・Cエリア', 'test-user-001'),
  ('vehicle', '4t_half_day_D', 'price', '65000', 'number', '4t車半日・Dエリア', 'test-user-001'),
  
  ('vehicle', '4t_full_day_A', 'price', '65000', 'number', '4t車終日・Aエリア', 'test-user-001'),
  ('vehicle', '4t_full_day_B', 'price', '70000', 'number', '4t車終日・Bエリア', 'test-user-001'),
  ('vehicle', '4t_full_day_C', 'price', '80000', 'number', '4t車終日・Cエリア', 'test-user-001'),
  ('vehicle', '4t_full_day_D', 'price', '95000', 'number', '4t車終日・Dエリア', 'test-user-001'),
  
  -- その他サービス料金
  ('service', 'parking_officer', 'hourly_rate', '2500', 'number', '駐車対策員時間単価（円/時間）', 'test-user-001'),
  ('service', 'transport_vehicle', 'base_rate_20km', '15000', 'number', '人員輸送車両基本料金（20km圏内）', 'test-user-001'),
  ('service', 'transport_vehicle', 'rate_per_km', '150', 'number', '人員輸送車両距離単価（円/km）', 'test-user-001'),
  ('service', 'fuel', 'rate_per_liter', '160', 'number', '燃料費（円/L）', 'test-user-001'),
  
  ('service', 'waste_disposal', 'large', '25000', 'number', '引き取り廃棄・大', 'test-user-001'),
  ('service', 'waste_disposal', 'medium', '15000', 'number', '引き取り廃棄・中', 'test-user-001'),
  ('service', 'waste_disposal', 'small', '8000', 'number', '引き取り廃棄・小', 'test-user-001'),
  
  ('service', 'protection_work', 'base_rate', '5000', 'number', '養生作業基本料金', 'test-user-001'),
  ('service', 'protection_work', 'floor_rate', '3000', 'number', '養生作業フロア単価', 'test-user-001'),
  
  ('service', 'material_collection', 'many', '20000', 'number', '残材回収・多', 'test-user-001'),
  ('service', 'material_collection', 'medium', '12000', 'number', '残材回収・中', 'test-user-001'),
  ('service', 'material_collection', 'few', '6000', 'number', '残材回収・少', 'test-user-001'),
  
  -- 作業時間帯割増率
  ('service', 'work_time', 'normal', '1.0', 'number', '通常時間帯', 'test-user-001'),
  ('service', 'work_time', 'early', '1.2', 'number', '早朝割増', 'test-user-001'),
  ('service', 'work_time', 'night', '1.5', 'number', '夜間割増', 'test-user-001'),
  ('service', 'work_time', 'midnight', '2.0', 'number', '深夜割増', 'test-user-001'),
  
  -- システム設定
  ('system', 'tax', 'rate', '0.1', 'number', '消費税率', 'test-user-001'),
  ('system', 'estimate', 'number_prefix', 'EST', 'string', '見積番号プレフィックス', 'test-user-001');

-- テスト顧客データ
INSERT OR IGNORE INTO customers (name, contact_person, phone, email, address, user_id) VALUES 
  ('株式会社サンプル物流', '田中 太郎', '03-1234-5678', 'tanaka@sample-logistics.com', '東京都千代田区丸の内1-1-1', 'test-user-001'),
  ('東京運送株式会社', '佐藤 花子', '03-9876-5432', 'sato@tokyo-transport.com', '東京都港区青山2-2-2', 'test-user-001'),
  ('関西配送センター', '山田 次郎', '06-1111-2222', 'yamada@kansai-delivery.com', '大阪府大阪市中央区本町3-3-3', 'test-user-001');

-- テスト案件データ
INSERT OR IGNORE INTO projects (customer_id, name, description, status, user_id) VALUES 
  (1, 'オフィス移転プロジェクト', '本社オフィス移転に伴う什器・書類の輸送', 'initial', 'test-user-001'),
  (1, '倉庫間商品移動', '物流倉庫A→Bへの商品移動作業', 'quote_sent', 'test-user-001'),
  (2, '展示会用品輸送', '東京ビッグサイト展示会への機材輸送', 'under_consideration', 'test-user-001'),
  (3, '工場設備移設', '製造ラインの移設作業', 'order', 'test-user-001');

-- テスト見積データ
INSERT OR IGNORE INTO estimates (
  customer_id, project_id, estimate_number, 
  delivery_address, delivery_postal_code, delivery_area,
  vehicle_type, operation_type, vehicle_cost,
  supervisor_count, leader_count, m2_staff_full_day,
  staff_cost, subtotal, tax_rate, tax_amount, total_amount,
  notes, user_id
) VALUES 
  (1, 1, 'EST-2025-001', 
   '東京都新宿区西新宿1-1-1', '160-0023', 'A',
   '4t車', '終日', 65000,
   1, 2, 3,
   51000, 116000, 0.1, 11600, 127600,
   'オフィス移転、什器・書類の輸送', 'test-user-001'),
  (2, 3, 'EST-2025-002',
   '東京都江東区有明3-11-1', '135-0063', 'A', 
   '2t車', '半日', 35000,
   0, 1, 2,
   32000, 67000, 0.1, 6700, 73700,
   '展示会用品輸送、軽量機材', 'test-user-001');