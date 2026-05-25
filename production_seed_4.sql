-- 本番環境用サンプルデータ Part 4: ステータス履歴データ

-- ===== ステータス履歴データ =====
-- 各案件のステータス変遷を記録

-- Project 1: 丸の内オフィス移転 (initial → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(1, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2025-06-10 09:00:00'),
(1, 1, 'initial', 'quote_sent', '見積書送付完了', 'nobugon5551111@gmail.com', '2025-06-12 10:00:00'),
(1, 1, 'quote_sent', 'order', 'お客様より受注確定', 'nobugon5551111@gmail.com', '2025-06-15 09:00:00');

-- Project 2: 六本木倉庫搬入 (initial → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(2, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2025-07-05 10:00:00'),
(2, 2, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2025-07-07 11:00:00'),
(2, 2, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2025-07-10 10:00:00');

-- Project 3: 秋葉原イベント搬入 (initial → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(3, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2025-08-20 09:00:00'),
(3, 4, 'initial', 'quote_sent', '見積書メール送付', 'nobugon5551111@gmail.com', '2025-08-22 14:00:00'),
(3, 4, 'quote_sent', 'order', '受注決定（イベント日程確定）', 'nobugon5551111@gmail.com', '2025-08-25 09:00:00');

-- Project 4: 横浜倉庫間移動 (initial → under_consideration → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(4, NULL, NULL, 'initial', '新規問い合わせ', 'nobugon5551111@gmail.com', '2025-09-10 10:00:00'),
(4, NULL, 'initial', 'under_consideration', '現地調査日程調整中', 'nobugon5551111@gmail.com', '2025-09-11 10:00:00'),
(4, 6, 'under_consideration', 'quote_sent', '見積書送付（現調結果反映）', 'nobugon5551111@gmail.com', '2025-09-13 15:00:00'),
(4, 6, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2025-09-15 10:00:00');

-- Project 5: 千葉工場設備搬入 (initial → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(5, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2025-10-15 09:00:00'),
(5, 8, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2025-10-18 10:00:00'),
(5, 8, 'quote_sent', 'order', '受注（設備搬入日確定）', 'nobugon5551111@gmail.com', '2025-10-20 09:00:00');

-- Project 6: 大宮支社開設 (initial → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(6, NULL, NULL, 'initial', '新規問い合わせ', 'nobugon5551111@gmail.com', '2025-12-01 10:00:00'),
(6, 11, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2025-12-03 11:00:00'),
(6, 11, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2025-12-05 10:00:00');

-- Project 7: 新宿本社改装 (initial → under_consideration → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(7, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2026-02-01 09:00:00'),
(7, NULL, 'initial', 'under_consideration', '改装範囲確認中', 'nobugon5551111@gmail.com', '2026-02-02 10:00:00'),
(7, 14, 'under_consideration', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2026-02-04 14:00:00'),
(7, 14, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2026-02-05 09:00:00');

-- Project 8: 渋谷ショップ開店 (initial → quote_sent → order)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(8, NULL, NULL, 'initial', '新規問い合わせ', 'nobugon5551111@gmail.com', '2026-03-15 10:00:00'),
(8, 16, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2026-03-18 11:00:00'),
(8, 16, 'quote_sent', 'order', '受注（開店日確定）', 'nobugon5551111@gmail.com', '2026-03-20 10:00:00');

-- Project 9: 品川倉庫整理 (initial → quote_sent → order → completed)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(9, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2025-11-01 09:00:00'),
(9, 10, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2025-11-03 10:00:00'),
(9, 10, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2025-11-05 09:00:00'),
(9, 10, 'order', 'completed', '作業完了・検収済み', 'nobugon5551111@gmail.com', '2025-12-20 09:00:00');

-- Project 10: 港区マンション配送 (initial → quote_sent → order → completed)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(10, NULL, NULL, 'initial', '新規問い合わせ', 'nobugon5551111@gmail.com', '2025-08-01 10:00:00'),
(10, 5, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2025-08-03 11:00:00'),
(10, 5, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2025-08-05 10:00:00'),
(10, 5, 'order', 'completed', '配送完了', 'nobugon5551111@gmail.com', '2025-08-30 10:00:00');

-- Project 11: 横浜港コンテナ搬出 (initial → quote_sent → order → completed)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(11, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2026-01-10 09:00:00'),
(11, 13, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2026-01-12 10:00:00'),
(11, 13, 'quote_sent', 'order', '受注確定', 'nobugon5551111@gmail.com', '2026-01-15 09:00:00'),
(11, 13, 'order', 'completed', 'コンテナ搬出完了', 'nobugon5551111@gmail.com', '2026-02-15 09:00:00');

-- Project 12: 千葉港荷揚げ作業 (initial → quote_sent)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(12, NULL, NULL, 'initial', '新規問い合わせ', 'nobugon5551111@gmail.com', '2026-03-01 10:00:00'),
(12, 18, 'initial', 'quote_sent', '見積書送付・回答待ち', 'nobugon5551111@gmail.com', '2026-03-05 10:00:00');

-- Project 13: 浦和事務所移転 (initial → quote_sent)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(13, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2026-04-01 09:00:00'),
(13, 19, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2026-04-05 09:00:00');

-- Project 14: 川崎工場搬入 (initial → quote_sent)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(14, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2026-04-15 10:00:00'),
(14, 20, 'initial', 'quote_sent', '見積書送付・検討中', 'nobugon5551111@gmail.com', '2026-04-20 10:00:00');

-- Project 15: 池袋倉庫整理 (initial → under_consideration)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(15, NULL, NULL, 'initial', '新規問い合わせ', 'nobugon5551111@gmail.com', '2026-04-20 09:00:00'),
(15, NULL, 'initial', 'under_consideration', '倉庫レイアウト確認中', 'nobugon5551111@gmail.com', '2026-04-25 09:00:00');

-- Project 16: 目黒オフィス移転 (initial → under_consideration)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(16, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2026-05-01 10:00:00'),
(16, NULL, 'initial', 'under_consideration', '移転先レイアウト確認中', 'nobugon5551111@gmail.com', '2026-05-05 10:00:00');

-- Project 17: 横須賀配送案件 (initial)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(17, NULL, NULL, 'initial', '新規問い合わせ受付', 'nobugon5551111@gmail.com', '2026-05-10 09:00:00');

-- Project 18: 丸の内追加配送 (initial)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(18, NULL, NULL, 'initial', '既存顧客からの追加依頼', 'nobugon5551111@gmail.com', '2026-05-15 10:00:00');

-- Project 19: 千葉配送見送り (initial → quote_sent → failed)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(19, NULL, NULL, 'initial', '新規案件登録', 'nobugon5551111@gmail.com', '2025-09-01 09:00:00'),
(19, 7, 'initial', 'quote_sent', '見積書送付', 'nobugon5551111@gmail.com', '2025-09-08 10:00:00'),
(19, 7, 'quote_sent', 'failed', '予算超過のため見送り', 'nobugon5551111@gmail.com', '2025-09-20 09:00:00');

-- Project 20: 港区緊急配送 (initial → cancelled)
INSERT INTO status_history (project_id, estimate_id, old_status, new_status, notes, user_id, created_at) VALUES
(20, NULL, NULL, 'initial', '緊急配送依頼', 'nobugon5551111@gmail.com', '2025-10-01 10:00:00'),
(20, 9, 'initial', 'cancelled', 'スケジュール合わず中止', 'nobugon5551111@gmail.com', '2025-10-10 10:00:00');
