# 輸送見積もりシステム 詳細設計書

## 目次
- [システム概要](#システム概要)
- [システム構成](#システム構成)
- [データベース設計](#データベース設計)
- [画面設計](#画面設計)
- [機能設計](#機能設計)
- [セキュリティ設計](#セキュリティ設計)
- [パフォーマンス設計](#パフォーマンス設計)

## システム概要

### プロジェクト名
輸送見積もりシステム (Transport Estimate System)

### 目的
輸送業務における見積作成・管理の効率化とデジタル化

### 対象ユーザー
- 営業担当者
- 現場責任者
- 管理者

### 主要機能
1. 見積作成フロー（6ステップ）
2. 顧客・案件管理
3. 料金計算エンジン
4. PDF見積書生成
5. AI メール文生成

---

## システム構成

### アーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │    │   バックエンド     │    │   データベース   │
│                │    │                │    │                │
│ HTML/CSS/JS    │◄──►│ Hono Framework │◄──►│ Cloudflare D1  │
│ TailwindCSS    │    │ TypeScript     │    │ SQLite         │
│                │    │                │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     CDN配信      │    │  Cloudflare     │    │   ファイル      │
│                │    │  Workers/Pages  │    │   ストレージ     │
│ Static Assets  │    │   Edge Runtime  │    │                │
│ TailwindCSS    │    │                │    │ PDF生成        │
│ FontAwesome    │    │                │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

#### フロントエンド
- **HTML5/CSS3**: 基本構造・スタイリング
- **JavaScript (ES6+)**: クライアントサイドロジック
- **TailwindCSS**: CSSフレームワーク
- **Font Awesome**: アイコンライブラリ
- **Axios**: HTTP通信ライブラリ

#### バックエンド
- **Hono Framework**: 軽量Webフレームワーク
- **TypeScript**: 型安全なJavaScript
- **Cloudflare Workers**: エッジランタイム
- **Cloudflare Pages**: 静的サイトホスティング

#### データベース
- **Cloudflare D1**: SQLiteベースの分散DB
- **ローカル開発**: SQLite（--localモード）

#### 開発・デプロイ
- **Vite**: ビルドツール
- **Wrangler**: Cloudflareデプロイツール
- **PM2**: プロセス管理（開発環境）
- **Git**: バージョン管理

---

## データベース設計

### ER図
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  customers  │     │  projects   │     │  estimates  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────┤ customer_id │     │ id (PK)     │
│ name        │     │ id (PK)     │◄────┤ project_id  │
│ contact_person    │ name        │     │ customer_id │
│ phone       │     │ description │     │ estimate_no │
│ email       │     │ status      │     │ vehicle_*   │
│ address     │     │ created_at  │     │ staff_*     │
│ created_at  │     └─────────────┘     │ service_*   │
└─────────────┘                        │ total_amount│
                                       │ created_at  │
┌─────────────┐     ┌─────────────┐     └─────────────┘
│vehicle_pricing│   │staff_rates  │
├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │
│ area        │     │ role_type   │
│ vehicle_type│     │ rate_type   │
│ operation   │     │ amount      │
│ base_price  │     │ updated_at  │
│ created_at  │     └─────────────┘
└─────────────┘
```

### テーブル定義

#### customers（顧客マスター）
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### projects（案件マスター）
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

#### estimates（見積データ）
```sql
CREATE TABLE estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  estimate_number TEXT NOT NULL UNIQUE,
  
  -- 配送情報
  delivery_address TEXT NOT NULL,
  delivery_postal_code TEXT NOT NULL,
  delivery_area TEXT NOT NULL,
  
  -- 車両情報
  vehicle_type TEXT,
  operation_type TEXT NOT NULL,
  vehicle_cost REAL DEFAULT 0,
  vehicle_2t_count INTEGER DEFAULT 0,
  vehicle_4t_count INTEGER DEFAULT 0,
  uses_multiple_vehicles BOOLEAN DEFAULT FALSE,
  external_contractor_cost REAL DEFAULT 0,
  
  -- スタッフ情報
  supervisor_count INTEGER DEFAULT 0,
  leader_count INTEGER DEFAULT 0,
  m2_staff_half_day INTEGER DEFAULT 0,
  m2_staff_full_day INTEGER DEFAULT 0,
  temp_staff_half_day INTEGER DEFAULT 0,
  temp_staff_full_day INTEGER DEFAULT 0,
  staff_cost REAL DEFAULT 0,
  
  -- サービス情報
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
  
  -- 作業条件
  work_time_type TEXT DEFAULT 'normal',
  work_time_multiplier REAL DEFAULT 1.0,
  
  -- 追加費用
  parking_fee REAL DEFAULT 0,
  highway_fee REAL DEFAULT 0,
  
  -- 合計
  subtotal REAL NOT NULL,
  tax_rate REAL DEFAULT 0.1,
  tax_amount REAL NOT NULL,
  total_amount REAL NOT NULL,
  
  -- メタ情報
  notes TEXT,
  ai_email_generated TEXT,
  pdf_generated BOOLEAN DEFAULT FALSE,
  user_id TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

#### vehicle_pricing（車両料金マスター）
```sql
CREATE TABLE vehicle_pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  base_price REAL NOT NULL,
  distance_price REAL DEFAULT 0,
  time_price REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### staff_rates（スタッフ料金マスター）
```sql
CREATE TABLE staff_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_type TEXT NOT NULL,
  rate_type TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### インデックス設計
```sql
-- パフォーマンス向上用インデックス
CREATE INDEX idx_estimates_customer_id ON estimates(customer_id);
CREATE INDEX idx_estimates_project_id ON estimates(project_id);
CREATE INDEX idx_estimates_created_at ON estimates(created_at);
CREATE INDEX idx_estimates_estimate_number ON estimates(estimate_number);

CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_vehicle_pricing_lookup ON vehicle_pricing(area, vehicle_type, operation_type);
CREATE INDEX idx_staff_rates_lookup ON staff_rates(role_type, rate_type);
```

---

## 画面設計

### 画面一覧
1. **トップページ** (`/`)
2. **見積作成フロー**
   - STEP1: 顧客・案件選択 (`/estimate/step1`)
   - STEP2: 配送先設定 (`/estimate/step2`)
   - STEP3: 車両選択 (`/estimate/step3`)
   - STEP4: スタッフ設定 (`/estimate/step4`)
   - STEP5: その他サービス (`/estimate/step5`)
   - STEP6: 最終確認・保存 (`/estimate/step6`)
3. **見積一覧** (`/estimates`)
4. **見積詳細** (`/estimates/:id`)

### 画面フロー
```
トップページ
    │
    ▼
STEP1（顧客・案件選択）
    │
    ▼
STEP2（配送先設定）
    │
    ▼
STEP3（車両選択）
    │
    ▼
STEP4（スタッフ設定）
    │
    ▼
STEP5（その他サービス）
    │
    ▼
STEP6（最終確認・保存）
    │
    ├──► PDF生成
    ├──► AI メール生成
    └──► 見積一覧へ
```

### レスポンシブ対応
- **デスクトップ**: 1200px以上
- **タブレット**: 768px - 1199px
- **モバイル**: 767px以下

### UIコンポーネント設計

#### 共通コンポーネント
```javascript
// ボタンスタイル
.btn-primary: 青色プライマリボタン
.btn-secondary: グレーセカンダリボタン
.btn-danger: 赤色警告ボタン
.btn-success: 緑色成功ボタン

// フォームコンポーネント
.form-input: テキスト入力フィールド
.form-select: セレクトボックス
.form-textarea: テキストエリア
.form-checkbox: チェックボックス
.form-radio: ラジオボタン

// レイアウトコンポーネント
.container: メインコンテナ
.card: カードレイアウト
.modal: モーダルダイアログ
.step-container: ステップ表示コンテナ
```

---

## 機能設計

### 見積作成フロー

#### フロー管理
```javascript
// sessionStorageベースの状態管理
const estimateFlow = {
  step: 1,
  customer: { id, name, contact_person },
  project: { id, name, description },
  delivery: { address, postal_code, area },
  vehicle: { type, operation, cost, ... },
  staff: { counts, rates, total_cost },
  services: {各種サービス設定 },
  totals: { subtotal, tax, total }
}
```

#### バリデーション
```javascript
// 各ステップでの必須項目チェック
const validateStep = (step, data) => {
  const rules = {
    1: ['customer_id', 'project_id'],
    2: ['delivery_address', 'postal_code'],
    3: ['vehicle_type', 'operation_type'],
    4: [], // スタッフは任意
    5: [], // サービスは任意
    6: ['total_amount']
  }
  // バリデーション実行...
}
```

### 料金計算エンジン

#### 車両料金計算
```javascript
const calculateVehicleCost = (area, vehicleType, operation, counts) => {
  const basePricing = getVehiclePricing(area, vehicleType, operation)
  
  if (vehicleType === 'multiple') {
    // 複数車両の場合
    const cost2t = counts.vehicle_2t_count * basePricing['2t車'].base_price
    const cost4t = counts.vehicle_4t_count * basePricing['4t車'].base_price
    return cost2t + cost4t
  } else {
    // 単一車両の場合
    return basePricing.base_price
  }
}
```

#### スタッフ料金計算
```javascript
const calculateStaffCost = (staffCounts, rates) => {
  return (
    (staffCounts.supervisor_count || 0) * rates.supervisor +
    (staffCounts.leader_count || 0) * rates.leader +
    (staffCounts.m2_staff_half_day || 0) * rates.m2_half_day +
    (staffCounts.m2_staff_full_day || 0) * rates.m2_full_day +
    (staffCounts.temp_staff_half_day || 0) * rates.temp_half_day +
    (staffCounts.temp_staff_full_day || 0) * rates.temp_full_day
  )
}
```

#### 作業時間帯割増
```javascript
const applyTimeMultiplier = (baseCost, timeType) => {
  const multipliers = {
    'normal': 1.0,
    'early': 1.2,    // 早朝20%割増
    'late': 1.3,     // 夜間30%割増
    'midnight': 1.5  // 深夜50%割増
  }
  return baseCost * (multipliers[timeType] || 1.0)
}
```

### PDF生成

#### 生成フロー
1. 見積データの取得
2. HTMLテンプレート生成
3. CSS スタイル適用
4. PDF変換（ブラウザAPI使用）
5. ファイルダウンロード

#### テンプレート設計
```javascript
const pdfTemplate = {
  header: '見積書ヘッダー（会社情報・ロゴ）',
  estimateInfo: '見積番号・作成日・顧客情報',
  itemsTable: '明細テーブル（車両・スタッフ・サービス）',
  totalsSection: '合計金額・税額',
  notes: '備考・特記事項',
  footer: 'フッター（ページ番号・作成者）'
}
```

### AI機能

#### メール文生成
```javascript
const generateEmailContent = async (estimateData) => {
  const prompt = `
    以下の見積情報を基に、丁寧な営業メール文を生成してください。
    
    顧客: ${estimateData.customer.name}
    案件: ${estimateData.project.name}
    金額: ¥${estimateData.total_amount.toLocaleString()}
    
    要件:
    - 丁寧な敬語
    - 簡潔で読みやすい文章
    - 見積の概要説明
    - 次のアクション提案
  `
  
  // AI API呼び出し...
}
```

---

## セキュリティ設計

### 入力値検証
- SQLインジェクション対策
- XSS対策（HTMLエスケープ）
- CSRFトークン実装（将来対応）

### データ保護
- 個人情報の暗号化（将来対応）
- アクセスログ記録
- データバックアップ

### 認証・認可
- ユーザー認証機能（将来対応）
- ロールベースアクセス制御（将来対応）

---

## パフォーマンス設計

### データベース最適化
- インデックス設計
- クエリ最適化
- 接続プール管理

### キャッシュ戦略
- マスターデータのメモリキャッシュ
- API レスポンスキャッシュ
- 静的ファイルのCDN配信

### フロントエンド最適化
- 遅延読み込み（Lazy Loading）
- バンドルサイズの最小化
- 画像最適化

---

## 拡張性・保守性

### モジュール設計
```
src/
├── components/     # 再利用可能コンポーネント
├── services/       # ビジネスロジック
├── utils/          # ユーティリティ関数
├── types/          # TypeScript型定義
└── migrations/     # データベースマイグレーション
```

### 設定管理
```javascript
// 環境別設定
const config = {
  development: {
    api_base_url: 'http://localhost:3000',
    database: 'local_sqlite'
  },
  production: {
    api_base_url: 'https://your-project.pages.dev',
    database: 'cloudflare_d1'
  }
}
```

---

## 監視・運用設計

### ログ設計
- アプリケーションログ
- エラーログ
- アクセスログ
- パフォーマンスログ

### アラート設計
- エラー率監視
- レスポンス時間監視
- リソース使用量監視

### バックアップ設計
- データベース定期バックアップ
- コード リポジトリバックアップ
- 設定ファイルバックアップ

---

## 今後の拡張計画

### フェーズ2（認証・権限管理）
- ユーザー登録・ログイン
- ロールベースアクセス制御
- 操作ログ記録

### フェーズ3（高度な機能）
- ダッシュボード機能
- レポート・分析機能
- モバイルアプリ対応

### フェーズ4（統合機能）
- 会計システム連携
- 顧客管理システム連携
- API エコシステム構築

---

## 更新履歴

| バージョン | 日付 | 変更内容 |
|---|---|---|
| 1.0 | 2024-08-22 | 初版作成 |