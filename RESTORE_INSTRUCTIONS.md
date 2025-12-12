# 🔄 システム復元手順書

## 📅 バックアップ作成日時
2025年10月27日 01:24 (JST)

## 📦 バックアップファイル

### 1. プロジェクトバックアップ（推奨）
- **ファイル名**: `webapp_stable_all_features_working.tar.gz`
- **CDN URL**: https://page.gensparksite.com/project_backups/webapp_stable_all_features_working.tar.gz
- **サイズ**: 約7.7MB
- **内容**: すべてのソースコード、設定ファイル、データベースバックアップ、Git履歴

### 2. データベースバックアップ
- **ファイル名**: `backup_database_20251027_012350.sql`
- **場所**: `/home/user/webapp/backup_database_20251027_012350.sql`
- **サイズ**: 28KB
- **内容**: マスターデータ（スタッフ単価、サービス単価、車両単価など）

### 3. Git履歴
- **コミットハッシュ**: `3698b0b`
- **コミットメッセージ**: "✅ 安定版バックアップ: マスターデータ正常動作、STEP6表示完全対応、養生作業計算修正完了"

---

## 🚀 完全復元手順（プロジェクトバックアップから）

### ステップ1: バックアップダウンロード＆展開
```bash
cd /home/user
wget https://page.gensparksite.com/project_backups/webapp_stable_all_features_working.tar.gz
tar -xzf webapp_stable_all_features_working.tar.gz
cd webapp
```

### ステップ2: 依存関係インストール
```bash
npm install
```

### ステップ3: データベース復元
```bash
# ローカルデータベースをクリーンアップ
rm -rf .wrangler/state/v3/d1

# マイグレーション実行
npx wrangler d1 migrations apply transport-estimate-production --local

# バックアップから復元
npx wrangler d1 execute transport-estimate-production --local --file=backup_database_20251027_012350.sql
```

### ステップ4: ビルド＆起動
```bash
# ビルド
npm run build

# ポートクリーンアップ
fuser -k 3000/tcp 2>/dev/null || true

# PM2で起動
pm2 start ecosystem.config.cjs

# サービス確認
curl http://localhost:3000
pm2 logs --nostream
```

---

## 🗄️ データベースのみ復元（部分復元）

現在のコードはそのままで、データベースだけ復元する場合：

```bash
cd /home/user/webapp

# 現在のデータベースをバックアップ（念のため）
npx wrangler d1 export transport-estimate-production --local --output=backup_before_restore.sql

# データベースをクリーンアップ
rm -rf .wrangler/state/v3/d1

# マイグレーション実行
npx wrangler d1 migrations apply transport-estimate-production --local

# バックアップから復元
npx wrangler d1 execute transport-estimate-production --local --file=backup_database_20251027_012350.sql

# サービス再起動
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs
```

---

## 🔙 Git履歴から復元

特定のコミットに戻す場合：

```bash
cd /home/user/webapp

# 現在の変更を保存（必要に応じて）
git stash

# 安定版コミットに戻る
git checkout 3698b0b

# または、mainブランチの最新安定版に戻る
git checkout main
git reset --hard 3698b0b

# 依存関係再インストール
npm install

# ビルド＆再起動
npm run build
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs
```

---

## 📊 バックアップ時の動作状況

### ✅ 正常動作している機能

1. **マスターデータ管理**
   - スタッフ単価: 正しく保存・読み込み
   - サービス単価: 正しく保存・読み込み
   - 車両単価: 正しく保存・読み込み

2. **見積作成フロー**
   - STEP1-6: すべて正常動作
   - データ保存: sessionStorage + データベース

3. **STEP6表示**
   - 車両費用: マスター単価で再計算表示
   - スタッフ費用: マスター単価で再計算表示
   - その他サービス費用: すべて表示（引き取り廃棄、残材回収、養生作業、作業時間帯割増など）

4. **養生作業計算**
   - 基本料金: ¥8,000
   - フロア単価: ¥3,000/フロア
   - 計算式: 基本料金 + (フロア単価 × フロア数)
   - STEP6表示: 2行に分けて明細表示

5. **PDF生成**
   - STEP6完全転写方式: line_items_jsonを使用
   - すべての明細が正確に出力

### 🔧 重要な修正履歴

1. **複合キー対応** (service-rates API)
   - `waste_disposal_medium` / `material_collection_medium` の区別

2. **スタッフ単価API修正**
   - `subcategory='pricing'` → `subcategory='daily_rate'`
   - キー名変換: `supervisor` → `supervisor_rate`

3. **STEP6サービスレート取得**
   - initialize時にサービスレートを取得
   - buildLineItems用に準備

4. **養生作業計算ロジック**
   - STEP5: 基本料金 + フロア単価計算
   - STEP6: 2行表示（基本料金、フロア単価別々）

---

## 📁 重要なファイル一覧

### バックエンド
- `/home/user/webapp/src/index.tsx` - メインアプリケーション、API全般

### フロントエンド
- `/home/user/webapp/public/static/app.js` - STEP1-6ロジック全般

### データベース
- `/home/user/webapp/migrations/*.sql` - マイグレーションファイル
- `/home/user/webapp/backup_database_20251027_012350.sql` - データバックアップ

### 設定ファイル
- `/home/user/webapp/wrangler.jsonc` - Cloudflare設定
- `/home/user/webapp/package.json` - 依存関係
- `/home/user/webapp/ecosystem.config.cjs` - PM2設定

---

## 🆘 トラブルシューティング

### データベースが空の場合
```bash
# マイグレーション実行
npx wrangler d1 migrations apply transport-estimate-production --local

# バックアップから復元
npx wrangler d1 execute transport-estimate-production --local --file=backup_database_20251027_012350.sql
```

### スタッフ単価が古い値を表示する場合
```bash
# スタッフ単価データを確認
npx wrangler d1 execute transport-estimate-production --local --command="SELECT key, value FROM master_settings WHERE category = 'staff' AND subcategory = 'daily_rate'"

# APIレスポンスを確認
curl -s http://localhost:3000/api/staff-rates | jq .
```

### サービスが起動しない場合
```bash
# ポートを解放
fuser -k 3000/tcp 2>/dev/null || true

# PM2をクリーンアップ
pm2 delete all
pm2 kill

# 再ビルド＆起動
npm run build
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs --nostream
```

### ビルドエラーが発生する場合
```bash
# node_modulesをクリーンアップ
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
rm -rf dist .wrangler

# 再ビルド
npm run build
```

---

## 📞 緊急連絡先・参考情報

### 公開URL
https://3000-iak3jgd7prr064uac2ub6.e2b.dev

### データベース構造
- **master_settings**: カテゴリー別マスターデータ
  - `category='staff'`, `subcategory='daily_rate'` - スタッフ単価
  - `category='service'`, `subcategory='*'` - サービス単価
  - `category='vehicle'`, `subcategory='*'` - 車両単価

### 主要APIエンドポイント
- `/api/staff-rates` - スタッフ単価取得
- `/api/service-rates` - サービス単価取得
- `/api/estimates` - 見積保存・取得
- `/api/estimates/:id/pdf` - PDF生成

---

**作成者**: AI Assistant  
**作成日時**: 2025年10月27日 01:24  
**バージョン**: v1.0 - 安定版
