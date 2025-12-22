-- Migration: Add Report and AI Enhancement Tables
-- Created: 2025-10-27
-- Purpose: Add tables for report caching and AI learning data

-- ================== AI基盤テーブル（依存関係のため先に作成） ==================

-- AIメールテンプレートマスタ
CREATE TABLE IF NOT EXISTS ai_email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_type TEXT NOT NULL,         -- 'quote_initial', 'follow_up', 'reminder', 'thank_you'
  customer_type TEXT NOT NULL,         -- 'corporate', 'individual', 'government'
  project_type TEXT NOT NULL,          -- 'office_move', 'house_move', 'warehouse', 'event'
  subject_template TEXT NOT NULL,      -- 件名テンプレート
  body_template TEXT NOT NULL,         -- 本文テンプレート
  success_rate REAL DEFAULT 0.5,       -- 成功率 (0.0-1.0)
  usage_count INTEGER DEFAULT 0,       -- 使用回数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_email_templates_type ON ai_email_templates(template_type, customer_type, project_type);

-- スタッフ最適化パターンマスタ
CREATE TABLE IF NOT EXISTS staff_optimization_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_type TEXT NOT NULL,          -- '2t車', '4t車'
  operation_type TEXT NOT NULL,        -- '共配', '半日', '終日'
  delivery_area TEXT NOT NULL,         -- 'Aエリア', 'Bエリア', etc.
  estimated_volume TEXT NOT NULL,      -- 'small', 'medium', 'large'
  work_complexity TEXT NOT NULL,       -- 'simple', 'normal', 'complex'
  recommended_supervisor INTEGER DEFAULT 0,
  recommended_leader INTEGER DEFAULT 0,
  recommended_m2_full INTEGER DEFAULT 0,
  recommended_m2_half INTEGER DEFAULT 0,
  recommended_temp_full INTEGER DEFAULT 0,
  recommended_temp_half INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0.5,       -- 成功率 (0.0-1.0)
  cost_efficiency REAL DEFAULT 0.5,    -- コスト効率 (0.0-1.0)
  usage_count INTEGER DEFAULT 0,       -- 使用回数
  notes TEXT,                          -- メモ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_patterns_vehicle ON staff_optimization_patterns(vehicle_type, operation_type);
CREATE INDEX IF NOT EXISTS idx_staff_patterns_area ON staff_optimization_patterns(delivery_area);

-- AIメールテンプレートのサンプルデータ
INSERT OR IGNORE INTO ai_email_templates 
  (id, template_type, customer_type, project_type, subject_template, body_template, success_rate, usage_count)
VALUES 
  (1, 'quote_initial', 'corporate', 'office_move', 
   '【見積書送付】{{customer_name}}様 オフィス移転お見積もり',
   '{{customer_name}}様\n\nいつもお世話になっております。\nご依頼いただきましたオフィス移転のお見積もりをお送りいたします。\n\n見積金額: ¥{{total_amount}}\n\nご不明な点がございましたら、お気軽にお問い合わせください。',
   0.75, 0);

-- スタッフ最適化パターンのサンプルデータ
INSERT OR IGNORE INTO staff_optimization_patterns 
  (id, vehicle_type, operation_type, delivery_area, estimated_volume, work_complexity,
   recommended_supervisor, recommended_leader, recommended_m2_full, recommended_m2_half,
   success_rate, cost_efficiency)
VALUES 
  (1, '4t車', '終日', 'Aエリア', 'medium', 'normal', 1, 2, 3, 0, 0.85, 0.80);

-- ================== レポート機能テーブル ==================

-- レポートキャッシュテーブル
-- 頻繁にアクセスされるレポートデータをキャッシュして性能向上
CREATE TABLE IF NOT EXISTS report_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_type TEXT NOT NULL,           -- 'sales', 'efficiency', 'prediction', 'custom'
  period_start DATE,                   -- レポート期間開始日
  period_end DATE,                     -- レポート期間終了日
  parameters TEXT,                     -- JSON形式のパラメータ
  data TEXT,                          -- JSON形式のレポートデータ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME                  -- キャッシュ有効期限
);

CREATE INDEX IF NOT EXISTS idx_report_cache_type ON report_cache(report_type);
CREATE INDEX IF NOT EXISTS idx_report_cache_period ON report_cache(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_report_cache_expires ON report_cache(expires_at);

-- ================== AI学習データテーブル ==================

-- AI最適化フィードバックテーブル
-- スタッフ最適化の推奨結果と実際の成果を記録
CREATE TABLE IF NOT EXISTS ai_optimization_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL,
  recommendation_id INTEGER,           -- staff_optimization_patternsのID
  recommended_config TEXT NOT NULL,    -- JSON形式の推奨構成
  actual_config TEXT,                  -- JSON形式の実際に使用した構成
  actual_outcome TEXT,                 -- 'success', 'partial_success', 'failure'
  success_rating INTEGER CHECK(success_rating BETWEEN 1 AND 5), -- 1-5の評価
  cost_actual DECIMAL(10, 2),         -- 実際のコスト
  cost_estimated DECIMAL(10, 2),      -- 推奨コスト
  efficiency_score REAL,              -- 効率スコア (0.0-1.0)
  notes TEXT,                         -- フィードバックメモ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_estimate ON ai_optimization_feedback(estimate_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_outcome ON ai_optimization_feedback(actual_outcome);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_rating ON ai_optimization_feedback(success_rating);

-- AIメール効果測定テーブル
-- 生成されたメールの効果を追跡
CREATE TABLE IF NOT EXISTS ai_email_effectiveness (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_template_id INTEGER NOT NULL,
  estimate_id INTEGER NOT NULL,
  customer_id INTEGER,
  email_type TEXT NOT NULL,            -- 'quote_initial', 'follow_up', 'reminder', etc.
  sent_at DATETIME,                    -- メール送信日時
  opened_at DATETIME,                  -- 開封日時
  clicked_at DATETIME,                 -- リンククリック日時
  responded_at DATETIME,               -- 顧客返信日時
  converted_at DATETIME,               -- 成約日時
  open_rate REAL DEFAULT 0,            -- 開封率 (0.0-1.0)
  click_rate REAL DEFAULT 0,           -- クリック率 (0.0-1.0)
  response_rate REAL DEFAULT 0,        -- 返信率 (0.0-1.0)
  conversion_rate REAL DEFAULT 0,      -- 成約率 (0.0-1.0)
  customer_satisfaction INTEGER CHECK(customer_satisfaction BETWEEN 1 AND 5), -- 顧客満足度
  notes TEXT,                          -- 追加メモ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_template_id) REFERENCES ai_email_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_email_template ON ai_email_effectiveness(email_template_id);
CREATE INDEX IF NOT EXISTS idx_ai_email_estimate ON ai_email_effectiveness(estimate_id);
CREATE INDEX IF NOT EXISTS idx_ai_email_customer ON ai_email_effectiveness(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_email_conversion ON ai_email_effectiveness(conversion_rate);

-- AI予測精度トラッキングテーブル
-- 予測分析の精度を記録して改善
CREATE TABLE IF NOT EXISTS ai_prediction_accuracy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prediction_type TEXT NOT NULL,       -- 'sales', 'order_probability', 'efficiency'
  prediction_period TEXT,              -- '1month', '3months', '6months', '1year'
  predicted_value REAL NOT NULL,       -- 予測値
  actual_value REAL,                   -- 実際の値
  prediction_date DATE NOT NULL,       -- 予測日
  target_date DATE NOT NULL,           -- 予測対象日
  accuracy_score REAL,                 -- 精度スコア (0.0-1.0)
  error_margin REAL,                   -- 誤差率
  confidence_score REAL,               -- 信頼度スコア (0.0-1.0)
  parameters TEXT,                     -- JSON形式の予測パラメータ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_prediction_type ON ai_prediction_accuracy(prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_prediction_date ON ai_prediction_accuracy(prediction_date);
CREATE INDEX IF NOT EXISTS idx_ai_prediction_accuracy ON ai_prediction_accuracy(accuracy_score);

-- ================== 既存テーブルへのカラム追加 ==================

-- estimatesテーブルに実績データカラムを追加（既存カラムがない場合のみ）
-- AI学習に必要な実績データを記録
-- 注意: SQLiteは一度に1つのALTER TABLEのみ許可

-- 実際のスタッフ構成（実績）
-- ALTER TABLE estimates ADD COLUMN actual_supervisor_count INTEGER DEFAULT 0;
-- ALTER TABLE estimates ADD COLUMN actual_leader_count INTEGER DEFAULT 0;
-- ALTER TABLE estimates ADD COLUMN actual_m2_staff_full_day INTEGER DEFAULT 0;
-- ALTER TABLE estimates ADD COLUMN actual_m2_staff_half_day INTEGER DEFAULT 0;
-- ALTER TABLE estimates ADD COLUMN actual_temp_staff_full_day INTEGER DEFAULT 0;
-- ALTER TABLE estimates ADD COLUMN actual_temp_staff_half_day INTEGER DEFAULT 0;

-- 実績データ
-- ALTER TABLE estimates ADD COLUMN actual_cost DECIMAL(10, 2);
-- ALTER TABLE estimates ADD COLUMN actual_duration_hours REAL;
-- ALTER TABLE estimates ADD COLUMN actual_completion_date DATE;
-- ALTER TABLE estimates ADD COLUMN customer_satisfaction_rating INTEGER CHECK(customer_satisfaction_rating BETWEEN 1 AND 5);

-- AI機能使用フラグ
-- ALTER TABLE estimates ADD COLUMN ai_staff_optimization_used BOOLEAN DEFAULT FALSE;
-- ALTER TABLE estimates ADD COLUMN ai_email_sent BOOLEAN DEFAULT FALSE;
-- ALTER TABLE estimates ADD COLUMN ai_prediction_generated BOOLEAN DEFAULT FALSE;

-- 注意: 上記のALTER TABLE文は、将来的に追加する場合に個別のマイグレーションとして実行してください

-- ================== サンプルデータ（開発用） ==================

-- レポートキャッシュのサンプル
INSERT OR IGNORE INTO report_cache (report_type, period_start, period_end, parameters, data, expires_at) 
VALUES 
  ('sales', '2025-01-01', '2025-01-31', '{"period":"monthly"}', 
   '{"totalRevenue":201300,"totalOrders":2,"averageOrderValue":100650}',
   datetime('now', '+1 hour'));

-- AI最適化フィードバックのサンプル（コメントアウト: 見積データが存在する場合のみ挿入可能）
-- INSERT OR IGNORE INTO ai_optimization_feedback 
--   (estimate_id, recommended_config, actual_outcome, success_rating, efficiency_score, notes)
-- VALUES 
--   (1, '{"supervisor":1,"leader":2,"m2_full":3}', 'success', 5, 0.95, 
--    '推奨通りの構成で非常にスムーズに完了');

-- AIメール効果測定のサンプル（コメントアウト: 見積データが存在する場合のみ挿入可能）
-- INSERT OR IGNORE INTO ai_email_effectiveness 
--   (email_template_id, estimate_id, email_type, open_rate, response_rate, conversion_rate)
-- VALUES 
--   (1, 1, 'quote_initial', 1.0, 0.5, 1.0);

-- AI予測精度のサンプル
INSERT OR IGNORE INTO ai_prediction_accuracy 
  (prediction_type, prediction_period, predicted_value, actual_value, 
   prediction_date, target_date, accuracy_score, confidence_score)
VALUES 
  ('sales', '3months', 250000, 201300, '2025-01-01', '2025-04-01', 0.81, 0.78);

-- ================== トリガー作成 ==================

-- updated_atの自動更新トリガー
CREATE TRIGGER IF NOT EXISTS update_ai_feedback_timestamp 
AFTER UPDATE ON ai_optimization_feedback
BEGIN
  UPDATE ai_optimization_feedback SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_ai_email_timestamp 
AFTER UPDATE ON ai_email_effectiveness
BEGIN
  UPDATE ai_email_effectiveness SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_ai_prediction_timestamp 
AFTER UPDATE ON ai_prediction_accuracy
BEGIN
  UPDATE ai_prediction_accuracy SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ================== ビュー作成 ==================

-- AI効果分析ビュー
CREATE VIEW IF NOT EXISTS v_ai_effectiveness_summary AS
SELECT 
  'staff_optimization' as ai_feature,
  COUNT(*) as total_uses,
  AVG(success_rating) as avg_rating,
  AVG(efficiency_score) as avg_efficiency,
  SUM(CASE WHEN actual_outcome = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
FROM ai_optimization_feedback
UNION ALL
SELECT 
  'email_generation' as ai_feature,
  COUNT(*) as total_uses,
  AVG(customer_satisfaction) as avg_rating,
  AVG(conversion_rate) as avg_efficiency,
  AVG(conversion_rate) * 100 as success_rate
FROM ai_email_effectiveness
WHERE conversion_rate IS NOT NULL;

-- レポート使用状況ビュー
CREATE VIEW IF NOT EXISTS v_report_usage_stats AS
SELECT 
  report_type,
  COUNT(*) as access_count,
  MAX(created_at) as last_accessed,
  AVG(julianday(expires_at) - julianday(created_at)) as avg_cache_duration_days
FROM report_cache
GROUP BY report_type;
