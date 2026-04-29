-- 車両マスター設定にプランBデータを作成（AのコピーをBとして追加）
INSERT OR IGNORE INTO master_settings (category, subcategory, key, value, data_type, description, user_id, plan_type, created_at, updated_at)
SELECT category, subcategory, key, value, data_type, description, user_id, 'B', created_at, CURRENT_TIMESTAMP
FROM master_settings
WHERE category = 'vehicle' AND plan_type = 'A';

-- distance_area_pricingにプランBデータがない場合追加
INSERT OR IGNORE INTO distance_area_pricing (area_rank, dedicated_price_1, dedicated_price_2, effective_date, plan_type, created_at, updated_at)
SELECT area_rank, dedicated_price_1, dedicated_price_2, effective_date || '-B', 'B', created_at, CURRENT_TIMESTAMP
FROM distance_area_pricing
WHERE plan_type = 'A'
AND area_rank NOT IN (SELECT area_rank FROM distance_area_pricing WHERE plan_type = 'B');

-- konsai_pricingにプランBデータがない場合追加
INSERT OR IGNORE INTO konsai_pricing (rank, price, overtime_fee, road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee, oneman_discount_amount, effective_date, plan_type, created_at, updated_at)
SELECT rank, price, overtime_fee, road_permit_fee, transport_vehicle_fee, survey_twoman_fee, survey_oneman_fee, oneman_discount_amount, effective_date || '-B', 'B', created_at, CURRENT_TIMESTAMP
FROM konsai_pricing
WHERE plan_type = 'A'
AND rank NOT IN (SELECT rank FROM konsai_pricing WHERE plan_type = 'B');
