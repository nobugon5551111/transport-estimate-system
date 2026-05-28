-- プランB: master_settings vehicle カテゴリ データ投入
-- プランAより5-10%高い料金設定
INSERT INTO master_settings (category, subcategory, key, value, data_type, description, user_id, plan_type)
VALUES
('vehicle', '2t_shared_A', 'price', '15500', 'number', '2t_shared_A車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_half_day_A', 'price', '42000', 'number', '2t_half_day_A車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_full_day_A', 'price', '33000', 'number', '2t_full_day_A車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_shared_B', 'price', '17500', 'number', '2t_shared_B車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_half_day_B', 'price', '42000', 'number', '2t_half_day_B車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_full_day_B', 'price', '38500', 'number', '2t_full_day_B車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_shared_C', 'price', '20000', 'number', '2t_shared_C車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_half_day_C', 'price', '33000', 'number', '2t_half_day_C車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_full_day_C', 'price', '44000', 'number', '2t_full_day_C車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_shared_D', 'price', '22000', 'number', '2t_shared_D車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_half_day_D', 'price', '44000', 'number', '2t_half_day_D車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '2t_full_day_D', 'price', '49500', 'number', '2t_full_day_D車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_shared_A', 'price', '27500', 'number', '4t_shared_A車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_half_day_A', 'price', '33000', 'number', '4t_half_day_A車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_full_day_A', 'price', '46000', 'number', '4t_full_day_A車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_shared_B', 'price', '33000', 'number', '4t_shared_B車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_half_day_B', 'price', '39500', 'number', '4t_half_day_B車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_full_day_B', 'price', '51500', 'number', '4t_full_day_B車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_shared_C', 'price', '41000', 'number', '4t_shared_C車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_half_day_C', 'price', '49500', 'number', '4t_half_day_C車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_full_day_C', 'price', '58000', 'number', '4t_full_day_C車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_shared_D', 'price', '55000', 'number', '4t_shared_D車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_half_day_D', 'price', '66000', 'number', '4t_half_day_D車両料金', 'nobugon5551111@gmail.com', 'B'),
('vehicle', '4t_full_day_D', 'price', '66000', 'number', '4t_full_day_D車両料金', 'nobugon5551111@gmail.com', 'B');
