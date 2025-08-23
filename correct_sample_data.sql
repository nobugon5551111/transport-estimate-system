-- 既存のテーブル構造に合わせたサンプルデータ投入

-- スタッフ単価のサンプルデータ
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id) VALUES 
('staff', 'rates', 'supervisor_rate', '15000', 'number', 'スーパーバイザー日給', 'user001'),
('staff', 'rates', 'leader_rate', '12000', 'number', 'リーダー以上日給', 'user001'),
('staff', 'rates', 'm2_staff_half_day_rate', '6000', 'number', 'M2スタッフ半日給', 'user001'),
('staff', 'rates', 'm2_staff_full_day_rate', '10000', 'number', 'M2スタッフ終日給', 'user001'),
('staff', 'rates', 'temp_staff_half_day_rate', '5500', 'number', '派遣スタッフ半日給', 'user001'),
('staff', 'rates', 'temp_staff_full_day_rate', '9500', 'number', '派遣スタッフ終日給', 'user001');

-- 車両料金のサンプルデータ（2t車）
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id) VALUES 
('vehicle', '2t', 'vehicle_2t_shared_A', '15000', 'number', '2t車共配Aエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_half_day_A', '20000', 'number', '2t車半日Aエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_full_day_A', '30000', 'number', '2t車終日Aエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_shared_B', '18000', 'number', '2t車共配Bエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_half_day_B', '24000', 'number', '2t車半日Bエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_full_day_B', '36000', 'number', '2t車終日Bエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_shared_C', '22500', 'number', '2t車共配Cエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_half_day_C', '30000', 'number', '2t車半日Cエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_full_day_C', '45000', 'number', '2t車終日Cエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_shared_D', '30000', 'number', '2t車共配Dエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_half_day_D', '40000', 'number', '2t車半日Dエリア', 'user001'),
('vehicle', '2t', 'vehicle_2t_full_day_D', '60000', 'number', '2t車終日Dエリア', 'user001');

-- 車両料金のサンプルデータ（4t車）
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id) VALUES 
('vehicle', '4t', 'vehicle_4t_shared_A', '25000', 'number', '4t車共配Aエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_half_day_A', '30000', 'number', '4t車半日Aエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_full_day_A', '45000', 'number', '4t車終日Aエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_shared_B', '30000', 'number', '4t車共配Bエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_half_day_B', '36000', 'number', '4t車半日Bエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_full_day_B', '54000', 'number', '4t車終日Bエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_shared_C', '37500', 'number', '4t車共配Cエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_half_day_C', '45000', 'number', '4t車半日Cエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_full_day_C', '67500', 'number', '4t車終日Cエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_shared_D', '50000', 'number', '4t車共配Dエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_half_day_D', '60000', 'number', '4t車半日Dエリア', 'user001'),
('vehicle', '4t', 'vehicle_4t_full_day_D', '90000', 'number', '4t車終日Dエリア', 'user001');

-- その他サービス料金のサンプルデータ
INSERT OR REPLACE INTO master_settings (category, subcategory, key, value, data_type, description, user_id) VALUES 
('services', 'parking', 'parking_officer_hourly_rate', '3000', 'number', '駐車対策員時間単価', 'user001'),
('services', 'transport', 'transport_vehicle_20km_rate', '8000', 'number', '人員輸送車両20km基本料金', 'user001'),
('services', 'transport', 'transport_vehicle_per_km_rate', '100', 'number', '人員輸送車両距離単価', 'user001'),
('services', 'transport', 'fuel_per_liter_rate', '150', 'number', '燃料費単価', 'user001'),
('services', 'waste', 'waste_disposal_small_rate', '5000', 'number', '引き取り廃棄小', 'user001'),
('services', 'waste', 'waste_disposal_medium_rate', '10000', 'number', '引き取り廃棄中', 'user001'),
('services', 'waste', 'waste_disposal_large_rate', '20000', 'number', '引き取り廃棄大', 'user001'),
('services', 'protection', 'protection_work_base_rate', '8000', 'number', '養生作業基本料金', 'user001'),
('services', 'protection', 'protection_work_floor_rate', '2000', 'number', '養生作業フロア単価', 'user001'),
('services', 'material', 'material_collection_small_rate', '3000', 'number', '残材回収少', 'user001'),
('services', 'material', 'material_collection_medium_rate', '8000', 'number', '残材回収中', 'user001'),
('services', 'material', 'material_collection_large_rate', '15000', 'number', '残材回収多', 'user001'),
('services', 'construction', 'construction_m2_staff_rate', '8000', 'number', '施工M2スタッフ単価', 'user001'),
('services', 'time', 'work_time_early_multiplier', '1.15', 'number', '早朝割増率', 'user001'),
('services', 'time', 'work_time_night_multiplier', '1.25', 'number', '夜間割増率', 'user001'),
('services', 'time', 'work_time_midnight_multiplier', '1.5', 'number', '深夜割増率', 'user001'),
('services', 'system', 'tax_rate', '0.10', 'number', '消費税率', 'user001'),
('services', 'system', 'estimate_prefix', 'EST', 'string', '見積番号プレフィックス', 'user001');

-- エリア設定のサンプルデータ  
INSERT OR REPLACE INTO area_settings (postal_code_prefix, area_name, area_rank, user_id) VALUES 
('10', '東京都千代田区・中央区', 'A', 'user001'),
('10', '東京都港区・渋谷区', 'A', 'user001'),
('53', '大阪府大阪市中央区', 'B', 'user001'),
('21', '神奈川県横浜市', 'B', 'user001'),
('33', '埼玉県さいたま市', 'C', 'user001'),
('90', '沖縄県那覇市', 'D', 'user001');

-- 顧客のサンプルデータ
INSERT OR REPLACE INTO customers (id, name, contact_person, phone, email, address, notes, user_id) VALUES 
(1, '株式会社サンプル商事', '田中太郎', '03-1234-5678', 'tanaka@sample-corp.com', '東京都千代田区丸の内1-1-1', '長期取引先です', 'user001'),
(2, '有限会社テスト運送', '佐藤花子', '06-9876-5432', 'sato@test-transport.co.jp', '大阪府大阪市中央区本町2-2-2', '急ぎの案件が多い', 'user001'),
(3, '合同会社デモ物流', '鈴木次郎', '045-2468-1357', 'suzuki@demo-logistics.com', '神奈川県横浜市西区みなとみらい3-3-3', '新規開拓先', 'user001'),
(4, '株式会社モックアップ', '高橋三郎', '048-1357-2468', 'takahashi@mockup-inc.jp', '埼玉県さいたま市大宮区桜木町4-4-4', '中規模案件メイン', 'user001'),
(5, '沖縄サンプル企業', '山田美咲', '098-3579-2468', 'yamada@okinawa-sample.co.jp', '沖縄県那覇市久茂地5-5-5', '離島配送専門', 'user001');

-- 案件のサンプルデータ（priorityフィールドがないため、statusとdescription, notesのみ）
INSERT OR REPLACE INTO projects (id, name, customer_id, status, description, user_id) VALUES 
(1, 'オフィス移転プロジェクト', 1, 'quote_sent', '本社移転に伴う大型家具・OA機器の輸送。3月末までに完了予定。優先度：高', 'user001'),
(2, '工場設備搬送案件', 2, 'under_consideration', '製造ライン機械の移設作業。夜間作業必須。優先度：緊急', 'user001'),
(3, '倉庫商品配送業務', 3, 'order', '定期的な商品配送業務の委託。月次契約。優先度：中', 'user001'),
(4, '展示会設営サポート', 4, 'initial', '展示会ブース設営用資材の輸送。イベント期間限定。優先度：中', 'user001'),
(5, '離島配送テスト案件', 5, 'failed', '沖縄本島から離島への配送テスト。コスト面で見合わず。優先度：低', 'user001'),
(6, '緊急医療機器輸送', 1, 'quote_sent', '病院向け医療機器の緊急輸送。温度管理必須。優先度：緊急', 'user001'),
(7, '食品配送定期便', 2, 'order', '冷凍食品の定期配送業務。冷蔵車両使用。優先度：高', 'user001');