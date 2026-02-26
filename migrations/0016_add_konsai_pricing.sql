-- 混載便料金テーブル（A〜Fランク）
CREATE TABLE IF NOT EXISTS konsai_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rank TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  distance_label TEXT NOT NULL,
  regions TEXT NOT NULL,
  price INTEGER NOT NULL,
  overtime_fee INTEGER NOT NULL DEFAULT 7000,
  road_permit_fee INTEGER,
  transport_vehicle_fee INTEGER,
  survey_twoman_fee INTEGER,
  survey_oneman_fee INTEGER,
  oneman_discount_amount INTEGER DEFAULT 15000,
  highway_included INTEGER DEFAULT 1,
  effective_date TEXT DEFAULT '2026-03-01',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 混載便配達日スケジュール（参考表示用）
CREATE TABLE IF NOT EXISTS konsai_delivery_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prefecture TEXT NOT NULL,
  region_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  delivery_days TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_konsai_pricing_rank ON konsai_pricing(rank);
CREATE INDEX IF NOT EXISTS idx_konsai_delivery_prefecture ON konsai_delivery_schedule(prefecture);
CREATE INDEX IF NOT EXISTS idx_konsai_delivery_rank ON konsai_delivery_schedule(rank);

-- 混載便料金データ投入
INSERT INTO konsai_pricing (rank, distance_km, distance_label, regions, price, overtime_fee, road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee, highway_included, notes) VALUES
('A', 15,  '15km未満',   '大阪市',                                     13000, 7000, 10000, 5000,  25000, 20000, 1, '高速料金込み'),
('B', 30,  '30km未満',   '大阪府,神戸,阪神南,阪神北,京都市,山城,奈良市,奈良北西部', 14800, 7000, 11500, 5800,  28800, 23000, 1, NULL),
('C', 50,  '50km未満',   '南丹,奈良東部,奈良中部',                       17000, 7000, 13200, 6700,  33100, 26500, 1, NULL),
('D', 100, '100km未満',  '東播磨,北播磨,中播磨,丹波,滋賀県,和歌山北部',   19800, 7000, 15200, 7700,  38000, 30500, 1, NULL),
('E', 150, '150km未満',  '淡路,西播磨,中丹,滋賀湖東,滋賀湖北,奈良吉野,和歌山日高', 23300, 7000, 17500, 8900,  43700, 35000, 1, NULL),
('F', 200, '150km以上',  '但馬,丹後,和歌山南部',                         27700, 7000, 20000, 10000, 50000, 40000, 1, NULL);

-- 配達日スケジュールデータ投入
-- 大阪府
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('大阪府', '大阪市全域', 'A', '月曜休'),
('大阪府', '大阪府全域（大阪市除く）', 'B', '月曜休');

-- 兵庫県
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('兵庫県', '神戸', 'B', '月曜休'),
('兵庫県', '阪神南（尼崎・西宮・芦屋）', 'B', '月曜休'),
('兵庫県', '阪神北（伊丹・宝塚・川西・三田・猪名川）', 'B', '月曜休'),
('兵庫県', '東播磨（明石・加古川・高砂・稲美・播磨）', 'D', '火・木・土'),
('兵庫県', '北播磨（西脇・三木・小野・加西・加東・多可）', 'D', '火・木・土'),
('兵庫県', '中播磨（姫路・神河・市川・福崎）', 'D', '火・土'),
('兵庫県', '丹波（丹波篠山・丹波）', 'D', '火・土'),
('兵庫県', '淡路（洲本・南淡路・淡路）', 'E', '火・土'),
('兵庫県', '西播磨（相生・たつの・赤穂・宍粟・太子・上郡・佐用）', 'E', '火・土'),
('兵庫県', '但馬（豊岡・養父・朝来・香美・新温泉）', 'F', '火・土');

-- 京都府
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('京都府', '京都市', 'B', '月曜休'),
('京都府', '山城（向日・長岡京・宇治・城陽・八幡・京田辺他）', 'B', '月曜休'),
('京都府', '南丹（亀岡・南丹・京丹波）', 'C', '月曜休'),
('京都府', '中丹（福知山・綾部・舞鶴）', 'E', '火・木・土'),
('京都府', '丹後（京丹後・宮津・与謝野・伊根）', 'F', '火・木・土');

-- 滋賀県
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('滋賀県', '大津', 'D', '月曜休'),
('滋賀県', '湖西（高島）', 'D', '月曜休'),
('滋賀県', '湖南（草津・守山・栗東・野洲）', 'D', '月曜休'),
('滋賀県', '甲賀（甲賀・湖南）', 'D', '火・木・土'),
('滋賀県', '東近江（東近江・近江八幡・日野・竜王）', 'D', '火・木・土'),
('滋賀県', '湖東（彦根・甲良・多賀・豊郷・愛荘）', 'E', '火・土'),
('滋賀県', '湖北（長浜・米原）', 'E', '火・土');

-- 奈良県
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('奈良県', '奈良市', 'B', '月曜休'),
('奈良県', '北西部（生駒・香芝・大和郡山・大和高田他）', 'B', '月曜休'),
('奈良県', '東部（宇陀・山添・曽爾・御杖）', 'C', '火・木・土'),
('奈良県', '中部（明日香・田原本・桜井・天理他）', 'C', '火・木・土'),
('奈良県', '吉野（大淀・五條・御所・下市他）', 'E', '火・土');

-- 和歌山県
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('和歌山県', '和海（和歌山・海南・紀美野）', 'D', '火・木・土'),
('和歌山県', '那賀（岩出・紀の川）', 'D', '火・木・土'),
('和歌山県', '伊都（橋本・九度山・高野・かつらぎ）', 'D', '火・木・土'),
('和歌山県', '有田（有田・有田川・湯浅・広川）', 'D', '水・土'),
('和歌山県', '日高（御坊・由良・日高・日高川・美浜・印南・みなべ）', 'E', '水・土'),
('和歌山県', '西牟婁（田辺・上富田・白浜・すさみ）', 'F', '水'),
('和歌山県', '東牟婁（新宮・古座川・串本・那智勝浦他）', 'F', '水');

-- 三重県（既存エリアE対応）
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('三重県', '三重県全域', 'E', '要確認');

-- 愛知県・岐阜県（既存エリアF → 混載便F適用）
INSERT INTO konsai_delivery_schedule (prefecture, region_name, rank, delivery_days) VALUES
('愛知県', '愛知県全域', 'F', '要確認'),
('岐阜県', '岐阜県全域', 'F', '要確認'),
('徳島県', '徳島県全域', 'F', '要確認'),
('香川県', '香川県全域', 'F', '要確認');
