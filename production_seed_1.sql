-- 本番環境用サンプルデータ
-- トランザクションデータのみリセット（マスターデータはそのまま）
-- user_id: 'nobugon5551111@gmail.com' を使用

-- ===== 既存データ削除 =====
DELETE FROM status_history;
DELETE FROM free_estimate_items;
DELETE FROM estimates;
DELETE FROM projects;
DELETE FROM customers;
DELETE FROM sessions;

-- ===== 顧客データ（8社） =====
INSERT INTO customers (id, name, contact_person, phone, email, address, notes, user_id, created_at) VALUES
(1, '株式会社山田物流', '山田太郎', '03-1234-5678', 'yamada@example.com', '東京都千代田区丸の内1-1-1', '大口顧客', 'nobugon5551111@gmail.com', '2025-06-01 09:00:00'),
(2, '東京運輸サービス', '佐藤花子', '03-2345-6789', 'sato@example.com', '東京都港区六本木2-2-2', '定期配送あり', 'nobugon5551111@gmail.com', '2025-06-15 10:00:00'),
(3, '関東配送センター', '田中一郎', '045-111-2222', 'tanaka@example.com', '神奈川県横浜市中区3-3-3', '', 'nobugon5551111@gmail.com', '2025-07-01 11:00:00'),
(4, '千葉ロジスティクス', '鈴木次郎', '043-333-4444', 'suzuki@example.com', '千葉県千葉市中央区4-4-4', '新規顧客', 'nobugon5551111@gmail.com', '2025-08-01 09:00:00'),
(5, '埼玉輸送株式会社', '高橋三郎', '048-555-6666', 'takahashi@example.com', '埼玉県さいたま市大宮区5-5-5', '', 'nobugon5551111@gmail.com', '2025-09-01 10:00:00'),
(6, 'グローバル物流', '渡辺美咲', '03-7777-8888', 'watanabe@example.com', '東京都新宿区西新宿6-6-6', '国際配送', 'nobugon5551111@gmail.com', '2025-10-01 09:00:00'),
(7, '日本通運パートナーズ', '伊藤健太', '03-9999-0000', 'ito@example.com', '東京都渋谷区道玄坂7-7-7', '', 'nobugon5551111@gmail.com', '2025-11-01 10:00:00'),
(8, '首都圏デリバリー', '中村康介', '044-111-3333', 'nakamura@example.com', '神奈川県川崎市幸区8-8-8', '小口配送', 'nobugon5551111@gmail.com', '2026-01-01 09:00:00');
