PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial_schema.sql','2025-10-27 00:37:51');
INSERT INTO "d1_migrations" VALUES(2,'0002_add_multiple_vehicles.sql','2025-10-27 00:37:52');
INSERT INTO "d1_migrations" VALUES(3,'0003_backup_system.sql','2025-10-27 00:37:52');
INSERT INTO "d1_migrations" VALUES(4,'0003_add_customer_status_management.sql','2025-10-27 00:37:52');
INSERT INTO "d1_migrations" VALUES(5,'0004_backup_schedule.sql','2025-10-27 00:37:53');
INSERT INTO "d1_migrations" VALUES(6,'0005_add_project_priority_notes.sql','2025-10-27 00:37:53');
INSERT INTO "d1_migrations" VALUES(7,'0006_add_line_items_json.sql','2025-10-27 00:37:53');
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    
  contact_person TEXT,                   
  phone TEXT,                           
  email TEXT,                           
  address TEXT,                         
  notes TEXT,                           
  user_id TEXT NOT NULL,                
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
, status TEXT DEFAULT 'active', deleted_at DATETIME NULL, deleted_reason TEXT NULL);
INSERT INTO "customers" VALUES(1,'株式会社サンプル物流','田中 太郎','03-1234-5678','tanaka@sample-logistics.com','東京都千代田区丸の内1-1-1',NULL,'test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','active',NULL,NULL);
INSERT INTO "customers" VALUES(2,'東京運送株式会社','佐藤 花子','03-9876-5432','sato@tokyo-transport.com','東京都港区青山2-2-2',NULL,'test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','active',NULL,NULL);
INSERT INTO "customers" VALUES(3,'関西配送センター','山田 次郎','06-1111-2222','yamada@kansai-delivery.com','大阪府大阪市中央区本町3-3-3',NULL,'test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','active',NULL,NULL);
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,          
  name TEXT NOT NULL,                    
  description TEXT,                      
  status TEXT NOT NULL DEFAULT 'initial', 
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, priority TEXT DEFAULT 'medium', notes TEXT DEFAULT '',
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
INSERT INTO "projects" VALUES(1,1,'オフィス移転プロジェクト','本社オフィス移転に伴う什器・書類の輸送','initial','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','medium','');
INSERT INTO "projects" VALUES(2,1,'倉庫間商品移動','物流倉庫A→Bへの商品移動作業','quote_sent','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','medium','');
INSERT INTO "projects" VALUES(3,2,'展示会用品輸送','東京ビッグサイト展示会への機材輸送','under_consideration','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','medium','');
INSERT INTO "projects" VALUES(4,3,'工場設備移設','製造ラインの移設作業','order','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55','medium','');
CREATE TABLE estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,          
  project_id INTEGER NOT NULL,           
  estimate_number TEXT NOT NULL,         
  
  
  delivery_address TEXT NOT NULL,        
  delivery_postal_code TEXT,             
  delivery_area TEXT NOT NULL,           
  
  
  vehicle_type TEXT NOT NULL,            
  operation_type TEXT NOT NULL,          
  vehicle_cost REAL NOT NULL DEFAULT 0,  
  
  
  supervisor_count INTEGER DEFAULT 0,    
  leader_count INTEGER DEFAULT 0,        
  m2_staff_half_day INTEGER DEFAULT 0,   
  m2_staff_full_day INTEGER DEFAULT 0,   
  temp_staff_half_day INTEGER DEFAULT 0, 
  temp_staff_full_day INTEGER DEFAULT 0, 
  staff_cost REAL NOT NULL DEFAULT 0,    
  
  
  parking_officer_hours REAL DEFAULT 0,  
  parking_officer_cost REAL DEFAULT 0,   
  
  transport_vehicles INTEGER DEFAULT 0,   
  transport_within_20km BOOLEAN DEFAULT TRUE, 
  transport_distance REAL DEFAULT 0,     
  transport_fuel_cost REAL DEFAULT 0,    
  transport_cost REAL DEFAULT 0,         
  
  waste_disposal_size TEXT DEFAULT 'none', 
  waste_disposal_cost REAL DEFAULT 0,    
  
  protection_work BOOLEAN DEFAULT FALSE, 
  protection_floors INTEGER DEFAULT 0,   
  protection_cost REAL DEFAULT 0,        
  
  material_collection_size TEXT DEFAULT 'none', 
  material_collection_cost REAL DEFAULT 0, 
  
  construction_m2_staff INTEGER DEFAULT 0, 
  construction_partner TEXT,              
  construction_cost REAL DEFAULT 0,      
  
  work_time_type TEXT DEFAULT 'normal',  
  work_time_multiplier REAL DEFAULT 1.0, 
  
  parking_fee REAL DEFAULT 0,            
  highway_fee REAL DEFAULT 0,            
  
  
  subtotal REAL NOT NULL DEFAULT 0,      
  tax_rate REAL NOT NULL DEFAULT 0.1,    
  tax_amount REAL NOT NULL DEFAULT 0,    
  total_amount REAL NOT NULL DEFAULT 0,  
  
  
  notes TEXT,                            
  ai_email_generated TEXT,               
  pdf_generated BOOLEAN DEFAULT FALSE,   
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, vehicle_2t_count INTEGER NOT NULL DEFAULT 0, vehicle_4t_count INTEGER NOT NULL DEFAULT 0, external_contractor_cost REAL NOT NULL DEFAULT 0, uses_multiple_vehicles BOOLEAN NOT NULL DEFAULT FALSE, line_items_json TEXT,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
INSERT INTO "estimates" VALUES(1,1,1,'EST-2025-001','東京都新宿区西新宿1-1-1','160-0023','A','4t車','終日',65000,1,2,0,3,0,0,51000,0,0,0,1,0,0,0,'none',0,0,0,0,'none',0,0,NULL,0,'normal',1,0,0,116000,0.1,11600,127600,'オフィス移転、什器・書類の輸送',NULL,0,'test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55',0,0,0,0,NULL);
INSERT INTO "estimates" VALUES(2,2,3,'EST-2025-002','東京都江東区有明3-11-1','135-0063','A','2t車','半日',35000,0,1,0,2,0,0,32000,0,0,0,1,0,0,0,'none',0,0,0,0,'none',0,0,NULL,0,'normal',1,0,0,67000,0.1,6700,73700,'展示会用品輸送、軽量機材',NULL,0,'test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55',0,0,0,0,NULL);
INSERT INTO "estimates" VALUES(3,2,3,'EST-2025-670','大阪府大阪市西区北堀江',NULL,'A','複数車両','終日',115000,0,1,0,2,0,1,53500,2,5000,1,1,0,0,15000,'small',8000,0,2,11000,'few',6000,1,NULL,12500,'early',1.2,1000,2000,262700,0.1,26270,288970,'zzzzzzzzzzzzzzz',NULL,0,'test-user-001','2025-10-27 00:44:12','2025-10-27 00:44:12',1,1,0,1,'{"vehicle":{"section_name":"車両費用","items":[{"description":"2t車 1台・終日（Aエリア）","detail":"@ ¥50,000","quantity":1,"unit_price":50000,"amount":50000},{"description":"4t車 1台・終日（Aエリア）","detail":"@ ¥65,000","quantity":1,"unit_price":65000,"amount":65000}],"subtotal":115000},"staff":{"section_name":"スタッフ費用","items":[{"description":"リーダー 1名","detail":"@ ¥17,000","quantity":1,"unit_price":17000,"amount":17000},{"description":"M2スタッフ（1日）2名","detail":"@ ¥12,500","quantity":2,"unit_price":12500,"amount":25000},{"description":"派遣スタッフ（1日）1名","detail":"@ ¥11,500","quantity":1,"unit_price":11500,"amount":11500}],"subtotal":53500},"services":{"section_name":"その他サービス費用","items":[{"description":"駐車対策員 2時間","detail":"@ ¥2,500","quantity":2,"unit_price":2500,"amount":5000},{"description":"人員輸送車両 1台（20km圏内）","detail":"","quantity":1,"unit_price":15000,"amount":15000},{"description":"引き取り廃棄（small）","detail":"","quantity":1,"unit_price":8000,"amount":8000},{"description":"養生作業（基本料金）","detail":"","quantity":1,"unit_price":5000,"amount":5000},{"description":"養生作業（フロア単価）","detail":"2フロア × ¥3,000","quantity":2,"unit_price":3000,"amount":6000},{"description":"残材回収（few）","detail":"","quantity":1,"unit_price":6000,"amount":6000},{"description":"施工 M2スタッフ 1人","detail":"@ ¥12,500","quantity":1,"unit_price":12500,"amount":12500},{"description":"作業時間帯割増（early：+20%）","detail":"","quantity":1,"unit_price":33699.99999999999,"amount":33699.99999999999,"note":"※ 基準額: ¥168,500（車両+スタッフ）× 20%"},{"description":"実費：駐車料金","detail":"","quantity":1,"unit_price":1000,"amount":1000},{"description":"実費：高速料金","detail":"","quantity":1,"unit_price":2000,"amount":2000}],"subtotal":94200}}');
INSERT INTO "estimates" VALUES(4,2,3,'EST-2025-438','大阪府大阪市西区北堀江',NULL,'A','複数車両','終日',115000,0,1,0,2,0,1,89000,1,2500,1,1,0,0,15000,'large',25000,0,3,14000,'many',20000,1,NULL,12500,'night',1.5,2000,3000,400000,0.1,40000,440000,replace('xxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxx\nccccccccccccc\nv\n','\n',char(10)),NULL,0,'test-user-001','2025-10-27 01:21:10','2025-10-27 01:21:10',1,1,0,1,'{"vehicle":{"section_name":"車両費用","items":[{"description":"2t車 1台・終日（Aエリア）","detail":"@ ¥50,000","quantity":1,"unit_price":50000,"amount":50000},{"description":"4t車 1台・終日（Aエリア）","detail":"@ ¥65,000","quantity":1,"unit_price":65000,"amount":65000}],"subtotal":115000},"staff":{"section_name":"スタッフ費用","items":[{"description":"リーダー 1名","detail":"@ ¥30,000","quantity":1,"unit_price":30000,"amount":30000},{"description":"M2スタッフ（1日）2名","detail":"@ ¥20,000","quantity":2,"unit_price":20000,"amount":40000},{"description":"派遣スタッフ（1日）1名","detail":"@ ¥19,000","quantity":1,"unit_price":19000,"amount":19000}],"subtotal":89000},"services":{"section_name":"その他サービス費用","items":[{"description":"駐車対策員 1時間","detail":"@ ¥2,500","quantity":1,"unit_price":2500,"amount":2500},{"description":"人員輸送車両 1台（20km圏内）","detail":"","quantity":1,"unit_price":15000,"amount":15000},{"description":"引き取り廃棄（large）","detail":"","quantity":1,"unit_price":25000,"amount":25000},{"description":"養生作業（基本料金）","detail":"","quantity":1,"unit_price":5000,"amount":5000},{"description":"養生作業（フロア単価）","detail":"3フロア × ¥3,000","quantity":3,"unit_price":3000,"amount":9000},{"description":"残材回収（many）","detail":"","quantity":1,"unit_price":20000,"amount":20000},{"description":"施工 M2スタッフ 1人","detail":"@ ¥12,500","quantity":1,"unit_price":12500,"amount":12500},{"description":"作業時間帯割増（night：+50%）","detail":"","quantity":1,"unit_price":102000,"amount":102000,"note":"※ 基準額: ¥204,000（車両+スタッフ）× 50%"},{"description":"実費：駐車料金","detail":"","quantity":1,"unit_price":2000,"amount":2000},{"description":"実費：高速料金","detail":"","quantity":1,"unit_price":3000,"amount":3000}],"subtotal":196000}}');
CREATE TABLE status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,           
  estimate_id INTEGER,                   
  old_status TEXT,                       
  new_status TEXT NOT NULL,              
  notes TEXT,                           
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (estimate_id) REFERENCES estimates(id)
);
CREATE TABLE master_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,                
  subcategory TEXT NOT NULL,             
  key TEXT NOT NULL,                     
  value TEXT NOT NULL,                   
  data_type TEXT DEFAULT 'string',       
  description TEXT,                      
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, subcategory, key, user_id)
);
INSERT INTO "master_settings" VALUES(7,'vehicle','2t_shared_A','price','25000','number','2t車共配・Aエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(8,'vehicle','2t_shared_B','price','28000','number','2t車共配・Bエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(9,'vehicle','2t_shared_C','price','32000','number','2t車共配・Cエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(10,'vehicle','2t_shared_D','price','40000','number','2t車共配・Dエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(11,'vehicle','2t_half_day_A','price','35000','number','2t車半日・Aエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(12,'vehicle','2t_half_day_B','price','38000','number','2t車半日・Bエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(13,'vehicle','2t_half_day_C','price','42000','number','2t車半日・Cエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(14,'vehicle','2t_half_day_D','price','50000','number','2t車半日・Dエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(15,'vehicle','2t_full_day_A','price','50000','number','2t車終日・Aエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(16,'vehicle','2t_full_day_B','price','55000','number','2t車終日・Bエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(17,'vehicle','2t_full_day_C','price','62000','number','2t車終日・Cエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(18,'vehicle','2t_full_day_D','price','75000','number','2t車終日・Dエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(19,'vehicle','4t_shared_A','price','35000','number','4t車共配・Aエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(20,'vehicle','4t_shared_B','price','38000','number','4t車共配・Bエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(21,'vehicle','4t_shared_C','price','42000','number','4t車共配・Cエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(22,'vehicle','4t_shared_D','price','52000','number','4t車共配・Dエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(23,'vehicle','4t_half_day_A','price','45000','number','4t車半日・Aエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(24,'vehicle','4t_half_day_B','price','48000','number','4t車半日・Bエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(25,'vehicle','4t_half_day_C','price','55000','number','4t車半日・Cエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(26,'vehicle','4t_half_day_D','price','65000','number','4t車半日・Dエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(27,'vehicle','4t_full_day_A','price','65000','number','4t車終日・Aエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(28,'vehicle','4t_full_day_B','price','70000','number','4t車終日・Bエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(29,'vehicle','4t_full_day_C','price','80000','number','4t車終日・Cエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(30,'vehicle','4t_full_day_D','price','95000','number','4t車終日・Dエリア','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(31,'service','parking_officer','hourly_rate','2500','number','駐車対策員時間単価（円/時間）','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(32,'service','transport_vehicle','base_rate_20km','15000','number','人員輸送車両基本料金（20km圏内）','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(33,'service','transport_vehicle','rate_per_km','150','number','人員輸送車両距離単価（円/km）','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(34,'service','fuel','rate_per_liter','160','number','燃料費（円/L）','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(35,'service','waste_disposal','large','25000','number','引き取り廃棄・大','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(36,'service','waste_disposal','medium','15000','number','引き取り廃棄・中','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(37,'service','waste_disposal','small','8000','number','引き取り廃棄・小','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(38,'service','protection_work','base_rate','5000','number','養生作業基本料金','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(39,'service','protection_work','floor_rate','3000','number','養生作業フロア単価','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(40,'service','material_collection','many','20000','number','残材回収・多','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(41,'service','material_collection','medium','12000','number','残材回収・中','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(42,'service','material_collection','few','6000','number','残材回収・少','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(43,'service','work_time','normal','1.0','number','通常時間帯','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(44,'service','work_time','early','1.2','number','早朝割増','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(45,'service','work_time','night','1.5','number','夜間割増','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(46,'service','work_time','midnight','2.0','number','深夜割増','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(47,'system','tax','rate','0.1','number','消費税率','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(48,'system','estimate','number_prefix','EST','string','見積番号プレフィックス','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "master_settings" VALUES(67,'staff','daily_rate','leader','30000','number','リーダー以上日当','test-user-001','2025-10-27 00:46:31','2025-10-27 00:46:31');
INSERT INTO "master_settings" VALUES(68,'staff','daily_rate','m2_full_day','20000','number','M2スタッフ終日','test-user-001','2025-10-27 00:46:31','2025-10-27 00:46:31');
INSERT INTO "master_settings" VALUES(69,'staff','daily_rate','m2_half_day','10000','number','M2スタッフ半日','test-user-001','2025-10-27 00:46:31','2025-10-27 00:46:31');
INSERT INTO "master_settings" VALUES(70,'staff','daily_rate','supervisor','40000','number','スーパーバイザー日当','test-user-001','2025-10-27 00:46:31','2025-10-27 00:46:31');
INSERT INTO "master_settings" VALUES(71,'staff','daily_rate','temp_full_day','19000','number','派遣スタッフ終日','test-user-001','2025-10-27 00:46:31','2025-10-27 00:46:31');
INSERT INTO "master_settings" VALUES(72,'staff','daily_rate','temp_half_day','9500','number','派遣スタッフ半日','test-user-001','2025-10-27 00:46:31','2025-10-27 00:46:31');
CREATE TABLE area_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  postal_code_prefix TEXT NOT NULL,      
  area_name TEXT NOT NULL,               
  area_rank TEXT NOT NULL,               
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(postal_code_prefix, user_id)
);
INSERT INTO "area_settings" VALUES(1,'10','東京都（千代田区）','A','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(2,'11','東京都（中央区・港区）','A','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(3,'15','東京都（渋谷区・新宿区）','A','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(4,'20','神奈川県（横浜市西区）','A','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(5,'21','神奈川県（横浜市中区）','B','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(6,'27','大阪府（大阪市都島区）','B','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(7,'53','愛知県（名古屋市中村区）','B','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(8,'81','福岡県（北九州市門司区）','C','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(9,'01','北海道（札幌市中央区）','D','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
INSERT INTO "area_settings" VALUES(10,'98','沖縄県（那覇市）','D','test-user-001','2025-10-27 00:37:55','2025-10-27 00:37:55');
CREATE TABLE backup_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'manual', 
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  record_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  created_by TEXT DEFAULT 'system',
  notes TEXT
);
INSERT INTO "backup_metadata" VALUES(1,'初期データバックアップ','manual','initial_backup_2024-08-22.json',15420,25,'completed','2024-08-22T10:00:00.000Z','2024-09-22T10:00:00.000Z','system',NULL);
INSERT INTO "backup_metadata" VALUES(2,'週次自動バックアップ','scheduled','weekly_backup_2024-08-22.json',28540,45,'completed','2024-08-22T02:00:00.000Z','2024-09-22T02:00:00.000Z','system',NULL);
CREATE TABLE backup_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_id INTEGER,
  operation_type TEXT NOT NULL, 
  operation_status TEXT NOT NULL, 
  operation_details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT,
  FOREIGN KEY (backup_id) REFERENCES backup_metadata(id)
);
CREATE TABLE backup_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL, 
  frequency_value INTEGER, 
  time_hour INTEGER DEFAULT 2, 
  time_minute INTEGER DEFAULT 0, 
  target_tables TEXT, 
  retention_days INTEGER DEFAULT 30, 
  is_active INTEGER DEFAULT 1, 
  last_run DATETIME, 
  run_count INTEGER DEFAULT 0, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT DEFAULT 'system'
);
INSERT INTO "backup_schedules" VALUES(1,'日次バックアップ','daily',NULL,2,0,'["customers", "projects", "estimates"]',7,1,NULL,0,'2025-10-27 00:37:53','2025-10-27 00:37:53','system');
INSERT INTO "backup_schedules" VALUES(2,'週次フルバックアップ','weekly',0,3,0,'["customers", "projects", "estimates", "vehicle_pricing", "staff_rates"]',30,1,NULL,0,'2025-10-27 00:37:53','2025-10-27 00:37:53','system');
INSERT INTO "backup_schedules" VALUES(3,'月次アーカイブ','monthly',1,1,0,'["customers", "projects", "estimates", "vehicle_pricing", "staff_rates"]',365,1,NULL,0,'2025-10-27 00:37:53','2025-10-27 00:37:53','system');
CREATE TABLE backup_execution_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER,
  backup_id INTEGER,
  execution_status TEXT NOT NULL, 
  execution_details TEXT,
  execution_time_ms INTEGER,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES backup_schedules(id),
  FOREIGN KEY (backup_id) REFERENCES backup_metadata(id)
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',7);
INSERT INTO "sqlite_sequence" VALUES('backup_metadata',2);
INSERT INTO "sqlite_sequence" VALUES('backup_schedules',3);
INSERT INTO "sqlite_sequence" VALUES('area_settings',10);
INSERT INTO "sqlite_sequence" VALUES('master_settings',72);
INSERT INTO "sqlite_sequence" VALUES('customers',3);
INSERT INTO "sqlite_sequence" VALUES('projects',4);
INSERT INTO "sqlite_sequence" VALUES('estimates',4);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX idx_estimates_project_id ON estimates(project_id);
CREATE INDEX idx_estimates_user_id ON estimates(user_id);
CREATE INDEX idx_estimates_created_at ON estimates(created_at);
CREATE INDEX idx_status_history_project_id ON status_history(project_id);
CREATE INDEX idx_status_history_user_id ON status_history(user_id);
CREATE INDEX idx_master_settings_user_id ON master_settings(user_id);
CREATE INDEX idx_master_settings_category ON master_settings(category, subcategory);
CREATE INDEX idx_area_settings_user_id ON area_settings(user_id);
CREATE INDEX idx_area_settings_postal_code ON area_settings(postal_code_prefix);
CREATE INDEX idx_estimates_multiple_vehicles ON estimates(uses_multiple_vehicles);
CREATE INDEX idx_backup_metadata_created_at ON backup_metadata(created_at);
CREATE INDEX idx_backup_metadata_status ON backup_metadata(status);
CREATE INDEX idx_backup_metadata_expires_at ON backup_metadata(expires_at);
CREATE INDEX idx_backup_history_backup_id ON backup_history(backup_id);
CREATE INDEX idx_backup_history_created_at ON backup_history(created_at);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_backup_schedules_active ON backup_schedules(is_active);
CREATE INDEX idx_backup_schedules_frequency ON backup_schedules(frequency);
CREATE INDEX idx_backup_schedules_last_run ON backup_schedules(last_run);
CREATE INDEX idx_backup_execution_log_schedule_id ON backup_execution_log(schedule_id);
CREATE INDEX idx_backup_execution_log_executed_at ON backup_execution_log(executed_at);