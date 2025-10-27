# 完全バックアップガイド（2025年10月27日）

## 📦 バックアップ概要

**バックアップ日時**: 2025年10月27日 02:41:07
**バックアップ内容**: 見積もり作成から印刷まで完全動作確認済み

---

## 🎯 バックアップに含まれる内容

### 1. **データベース完全バックアップ**
- **ファイル**: `backup_database_20251027_024107.sql`
- **サイズ**: 30KB
- **行数**: 303行
- **内容**:
  - 全マスター設定データ
  - スタッフ単価（supervisor: ¥40,000、leader: ¥30,000、m2_full_day: ¥20,000、等）
  - 車両単価（2t車・4t車の全エリア・全運用タイプ）
  - サービス単価（駐車対策員、人員輸送、廃棄処理、養生作業、等）
  - 顧客データ
  - 案件データ
  - 見積もりデータ

### 2. **コード完全バックアップ**
- **ファイル**: `webapp_complete_backup_20251027_024107.tar.gz`
- **サイズ**: 376KB
- **除外項目**: `node_modules`, `.wrangler`, `dist`, `.git/objects`（再生成可能なファイル）
- **内容**:
  - ソースコード（`src/index.tsx`）
  - フロントエンドロジック（`public/static/app.js`）
  - スタイルシート（`public/static/style.css`）
  - 設定ファイル（`package.json`, `wrangler.jsonc`, `tsconfig.json`, `vite.config.ts`）
  - PM2設定（`ecosystem.config.cjs`）
  - Git履歴（`.git/`）
  - ドキュメント（`README.md`, `RESTORE_INSTRUCTIONS.md`, `DATABASE_SCHEMA.md`）

---

## ✅ 実装完了機能一覧

### **STEP1: 顧客・案件選択**
- ✅ 顧客一覧表示・検索
- ✅ 案件一覧表示・選択
- ✅ 新規顧客・案件作成
- ✅ データ保存・読み込み

### **STEP2: 配送先入力**
- ✅ 配送先エリア選択（A/B/C/Dエリア）
- ✅ 詳細住所入力
- ✅ 配送日時選択
- ✅ データ保存・読み込み

### **STEP3: 車両選択**
- ✅ 車両タイプ選択（2t車/4t車）
- ✅ 運用タイプ選択（終日/半日/共配）
- ✅ 車両台数入力
- ✅ マスターデータから料金自動取得
- ✅ 詳細と合計の表示
- ✅ データ保存・読み込み

### **STEP4: スタッフ入力**
- ✅ AI最適人数提案
- ✅ 基本スタッフ入力（スーパーバイザー、リーダー）
- ✅ M2スタッフ入力（半日/終日）
- ✅ 派遣スタッフ入力（半日/終日）
- ✅ マスターデータから単価自動取得
- ✅ **詳細と合計の表示**（修正完了）
- ✅ データ保存・読み込み

### **STEP5: その他サービス**
- ✅ 駐車対策員（時間単位）
- ✅ 人員輸送車両（20km圏内一律/距離指定）
- ✅ 引き取り廃棄（なし/小/中/大）
- ✅ 養生作業（基本料金 + フロア単価 × フロア数）
- ✅ 残材回収（なし/少/中/多）
- ✅ 作業時間帯割増（なし/早朝深夜/深夜）
- ✅ 実費入力（高速道路、駐車場、その他）
- ✅ マスターデータから単価自動取得
- ✅ 詳細と合計の表示
- ✅ データ保存・読み込み

### **STEP6: 内容確認**
- ✅ 全STEP情報の表示
- ✅ 車両費用詳細表示
- ✅ スタッフ費用詳細表示
- ✅ その他サービス費用詳細表示
- ✅ 小計・消費税・合計の計算
- ✅ **STEP6完全転写方式（line_items_json）**
- ✅ 備考入力
- ✅ 見積もり保存

### **PDF生成**
- ✅ 見積書PDF自動生成
- ✅ STEP6の表示内容を完全再現
- ✅ 会社情報・顧客情報表示
- ✅ 案件情報・配送先情報表示
- ✅ 費用明細の詳細表示
- ✅ 小計・消費税・合計の表示
- ✅ 備考欄の表示
- ✅ ブラウザ印刷機能

### **マスター管理**
- ✅ スタッフ単価管理
- ✅ 車両単価管理
- ✅ サービス単価管理
- ✅ リアルタイム更新

### **その他機能**
- ✅ Git バージョン管理
- ✅ PM2 プロセス管理
- ✅ D1 データベース（ローカル開発）
- ✅ Cloudflare Pages デプロイ対応

---

## 🔧 復元手順

### **方法1: データベースのみ復元**

```bash
# 1. データベースバックアップを配置
cd /home/user/webapp

# 2. ローカルデータベースを削除
rm -rf .wrangler/state/v3/d1

# 3. マイグレーション実行
npx wrangler d1 migrations apply transport-estimate-production --local

# 4. バックアップからデータ復元
npx wrangler d1 execute transport-estimate-production --local --file=backup_database_20251027_024107.sql

# 5. 確認
npx wrangler d1 execute transport-estimate-production --local --command="SELECT COUNT(*) as count FROM master_settings"
```

### **方法2: コード完全復元**

```bash
# 1. バックアップを展開
cd /home/user
tar -xzf webapp_complete_backup_20251027_024107.tar.gz

# 2. 依存関係をインストール
cd webapp
npm install

# 3. データベース初期化
npx wrangler d1 migrations apply transport-estimate-production --local
npx wrangler d1 execute transport-estimate-production --local --file=backup_database_20251027_024107.sql

# 4. ビルド
npm run build

# 5. 起動
pm2 start ecosystem.config.cjs
```

### **方法3: GitHubから復元**

```bash
# 1. リポジトリをクローン
git clone https://github.com/username/webapp.git
cd webapp

# 2. 依存関係をインストール
npm install

# 3. データベースバックアップを配置
# （バックアップファイルをプロジェクトディレクトリにコピー）

# 4. データベース復元
npx wrangler d1 migrations apply transport-estimate-production --local
npx wrangler d1 execute transport-estimate-production --local --file=backup_database_20251027_024107.sql

# 5. ビルドと起動
npm run build
pm2 start ecosystem.config.cjs
```

---

## 📊 データベーススキーマ

### **master_settings テーブル**
- `id`: 主キー
- `user_id`: ユーザーID
- `category`: カテゴリ（staff/vehicle/service）
- `subcategory`: サブカテゴリ
- `key`: 設定キー
- `value`: 設定値
- `data_type`: データ型
- `description`: 説明
- `created_at`: 作成日時
- `updated_at`: 更新日時

### **customers テーブル**
- `id`: 主キー
- `user_id`: ユーザーID
- `name`: 顧客名
- `contact_person`: 担当者名
- `email`: メールアドレス
- `phone`: 電話番号
- `address`: 住所
- `created_at`: 作成日時
- `updated_at`: 更新日時

### **projects テーブル**
- `id`: 主キー
- `user_id`: ユーザーID
- `customer_id`: 顧客ID（外部キー）
- `name`: 案件名
- `status`: ステータス
- `start_date`: 開始日
- `end_date`: 終了日
- `description`: 説明
- `created_at`: 作成日時
- `updated_at`: 更新日時

### **estimates テーブル**
- `id`: 主キー
- `user_id`: ユーザーID
- `customer_id`: 顧客ID（外部キー）
- `project_id`: 案件ID（外部キー）
- `delivery_data`: 配送先データ（JSON）
- `vehicle_data`: 車両データ（JSON）
- `staff_data`: スタッフデータ（JSON）
- `services_data`: サービスデータ（JSON）
- `pricing_data`: 料金データ（JSON）
- `line_items_json`: 行項目データ（JSON）- **STEP6完全転写用**
- `notes`: 備考
- `status`: ステータス
- `created_at`: 作成日時
- `updated_at`: 更新日時

---

## 🔐 重要な設定値（マスターデータ）

### **スタッフ単価**
- スーパーバイザー: ¥40,000/日
- リーダー以上: ¥30,000/日
- M2スタッフ（半日）: ¥10,000/半日
- M2スタッフ（終日）: ¥20,000/日
- 派遣スタッフ（半日）: ¥9,000/半日
- 派遣スタッフ（終日）: ¥18,000/日

### **車両単価**（例: Aエリア・終日）
- 2t車: ¥40,000
- 4t車: ¥60,000

### **サービス単価**
- 駐車対策員: ¥2,500/時間
- 人員輸送（20km圏内）: ¥15,000
- 人員輸送（1kmあたり）: ¥150/km
- 廃棄処理（小）: ¥10,000
- 廃棄処理（中）: ¥15,000
- 廃棄処理（大）: ¥20,000
- 養生作業（基本）: ¥8,000
- 養生作業（フロア単価）: ¥3,000/フロア
- 残材回収（少）: ¥5,000
- 残材回収（中）: ¥10,000
- 残材回収（多）: ¥15,000
- 早朝深夜割増: 1.25倍
- 深夜割増: 1.5倍

---

## 📝 バックアップファイル一覧

1. **backup_database_20251027_024107.sql** - データベース完全バックアップ
2. **webapp_complete_backup_20251027_024107.tar.gz** - コード完全バックアップ
3. **BACKUP_COMPLETE_GUIDE_20251027.md** - このガイド

---

## ⚠️ 注意事項

1. **node_modules は含まれていません**: 復元時に `npm install` を実行してください
2. **ビルドファイル（dist/）は含まれていません**: 復元時に `npm run build` を実行してください
3. **Gitオブジェクトは最小限**: 完全な履歴が必要な場合はGitHubから取得してください
4. **データベースはローカル開発用**: 本番環境への復元は別途手順が必要です

---

## 🎉 バックアップ完了

このバックアップには、見積もり作成から印刷までの完全動作確認済みのシステムが含まれています。
いつでもこのバックアップから復元して、システムを再構築できます。

**バックアップ作成日時**: 2025年10月27日 02:41:07
**システム状態**: 完全動作確認済み
**次回更新**: 機能追加時
