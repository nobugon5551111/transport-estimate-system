-- 駐禁対策員のデフォルト料金をmaster_settingsに挿入（プランA/B）
-- 半日料金（拘束4h）= ¥11,000
-- 全日料金（拘束8h）= ¥16,000
-- 交通費: 大阪市内 ¥1,000 / 大阪府下 ¥1,500 / 京都 ¥2,000 / 兵庫 ¥2,000

-- Plan A
INSERT OR IGNORE INTO master_settings (category, subcategory, key, value, description, user_id, plan_type)
VALUES
  ('services', 'parking_officer', 'half_day_rate', '11000', '駐禁対策員半日料金（拘束4時間）', 1, 'A'),
  ('services', 'parking_officer', 'full_day_rate', '16000', '駐禁対策員終日料金（拘束8時間）', 1, 'A'),
  ('services', 'parking_officer', 'transport_osaka_city', '1000', '駐禁対策員交通費・大阪市内', 1, 'A'),
  ('services', 'parking_officer', 'transport_osaka_suburb', '1500', '駐禁対策員交通費・大阪府下', 1, 'A'),
  ('services', 'parking_officer', 'transport_kyoto', '2000', '駐禁対策員交通費・京都', 1, 'A'),
  ('services', 'parking_officer', 'transport_hyogo', '2000', '駐禁対策員交通費・兵庫', 1, 'A');

-- Plan B
INSERT OR IGNORE INTO master_settings (category, subcategory, key, value, description, user_id, plan_type)
VALUES
  ('services', 'parking_officer', 'half_day_rate', '11000', '駐禁対策員半日料金（拘束4時間）', 1, 'B'),
  ('services', 'parking_officer', 'full_day_rate', '16000', '駐禁対策員終日料金（拘束8時間）', 1, 'B'),
  ('services', 'parking_officer', 'transport_osaka_city', '1000', '駐禁対策員交通費・大阪市内', 1, 'B'),
  ('services', 'parking_officer', 'transport_osaka_suburb', '1500', '駐禁対策員交通費・大阪府下', 1, 'B'),
  ('services', 'parking_officer', 'transport_kyoto', '2000', '駐禁対策員交通費・京都', 1, 'B'),
  ('services', 'parking_officer', 'transport_hyogo', '2000', '駐禁対策員交通費・兵庫', 1, 'B');
