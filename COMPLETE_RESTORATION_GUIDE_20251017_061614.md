# 完全システム復元ガイド - 2025-10-17 06:16:14

## バックアップ概要

このバックアップは**新フェーズ移行前の完全なシステム状態**を保存しています。

### システム状態
- ✅ Step4重複セクション削除完了
- ✅ Step5養生作業フロア計算機能追加完了  
- ✅ マスターデータ動的ラベル機能実装済み
- ✅ Step4/Step5ラベル自動更新機能動作中
- ✅ 全機能統合テスト完了

---

## 📦 バックアップファイル一覧

### 1. プロジェクトコード完全アーカイブ
```
🔗 ダウンロードURL: https://page.gensparksite.com/project_backups/complete_system_backup_20251017_061614.tar.gz
📊 サイズ: 4.0MB
📁 内容: 全ソースコード、設定ファイル、依存関係、ビルド済みファイル
```

### 2. データベースバックアップファイル
```
📄 complete_database_schema_20251017_061614.sql - テーブル構造
📄 complete_data_export_20251017_061614.sql - 全データ内容
📄 export_database_data_20251017_061614.sql - 詳細データ
```

### 3. 環境設定ファイル
```
📄 ENVIRONMENT_CONFIG_20251017_061614.md - 環境情報
📄 package.json - 依存関係定義
📄 wrangler.jsonc - Cloudflare設定
📄 ecosystem.config.cjs - PM2設定
```

---

## 🔄 完全復元手順

### Step 1: プロジェクトファイルの復元
```bash
# 1. バックアップファイルをダウンロード
wget https://page.gensparksite.com/project_backups/complete_system_backup_20251017_061614.tar.gz

# 2. アーカイブを展開（既存ディレクトリを完全復元）
cd /home/user
tar -xzf complete_system_backup_20251017_061614.tar.gz

# 3. プロジェクトディレクトリに移動
cd /home/user/webapp
```

### Step 2: 依存関係の復元
```bash
# Node.js依存関係をインストール
npm install

# 依存関係が正常にインストールされたか確認
npm list --depth=0
```

### Step 3: データベースの復元
```bash
# ローカルD1データベースを初期化
npx wrangler d1 migrations apply transport-estimate-production --local

# データベースファイルが存在しない場合は作成
mkdir -p .wrangler/state/v3/d1

# データを復元（SQLファイルがある場合）
npx wrangler d1 execute transport-estimate-production --local --file=./complete_database_schema_20251017_061614.sql
```

### Step 4: ビルドとサービス開始
```bash
# プロジェクトをビルド
npm run build

# PM2でサービスを開始
pm2 start ecosystem.config.cjs

# サービス状態確認
pm2 list
curl http://localhost:3000
```

### Step 5: 機能確認
```bash
# 各機能をテスト
# 1. マスター設定API
curl http://localhost:3000/api/master-settings

# 2. ダイナミックラベル機能確認
# ブラウザでStep4, Step5を開いてラベル更新を確認

# 3. 養生作業計算機能確認  
# Step5で養生作業にチェックを入れ、フロア数を変更して計算確認
```

---

## 🗂️ 主要コンポーネント詳細

### フロントエンド
```
📁 public/static/
  └── app-1760678720.js - メインJavaScript（動的ラベル更新機能付き）
  └── style.css - スタイル定義

📁 src/
  └── index.tsx - Honoメインアプリケーション（全Step実装済み）
```

### データベース構造
```
🗃️ transport-estimate-production
├── customers - 顧客マスタ
├── projects - 案件マスタ  
├── estimates - 見積データ
├── master_settings - 料金マスタ（動的ラベル対応）
├── area_settings - エリア設定
└── status_history - ステータス履歴
```

### 設定ファイル
```
📄 wrangler.jsonc - Cloudflare Workers設定
📄 package.json - 依存関係とスクリプト定義
📄 ecosystem.config.cjs - PM2プロセス管理設定
📄 vite.config.ts - Viteビルド設定
```

---

## ⚙️ 重要な設定値

### データベース設定
```json
{
  "binding": "DB",
  "database_name": "transport-estimate-production", 
  "database_id": "7f1910de-adb4-4233-a87e-86a36975d538"
}
```

### PM2設定
```javascript
{
  name: 'transport-estimate-system',
  script: 'npx',
  args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000'
}
```

### マスターデータAPI
```
GET /api/master-settings - 全マスター設定取得
GET /api/staff-rates - スタッフ料金取得  
POST /api/ai-optimize-staff - AI最適化提案
```

---

## 🔧 実装済み機能一覧

### ✅ 完了機能
1. **Step4 スタッフ入力**
   - 動的ラベル更新（マスターデータ連携）
   - AI最適化提案機能
   - 重複詳細明細セクション削除済み

2. **Step5 その他サービス**
   - 養生作業フロア数計算機能（基本料金 + フロア数×3,000円）
   - 動的ラベル更新機能
   - 全サービス料金計算

3. **マスターデータ連携**
   - スタッフ料金6種類の自動更新
   - サービス料金の自動更新
   - フォールバック機能実装

4. **UI/UX改善**
   - 重複要素の削除
   - 一貫性のある表示
   - エラーハンドリング

---

## 🚨 トラブルシューティング

### データベース接続エラー
```bash
# D1データベースが見つからない場合
npx wrangler d1 list
npx wrangler d1 create transport-estimate-production --local
```

### ビルドエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PM2エラー
```bash
# PM2プロセスをリセット
pm2 delete all
pm2 start ecosystem.config.cjs
```

### ポート競合エラー  
```bash
# ポート3000を解放
fuser -k 3000/tcp 2>/dev/null || true
```

---

## 📋 復元後の確認項目

### 必須確認項目
- [ ] サービスが http://localhost:3000 で起動する
- [ ] Step1-6の全画面が正常に表示される
- [ ] Step4でスタッフ料金ラベルが動的更新される
- [ ] Step5で養生作業のフロア数計算が動作する
- [ ] マスター設定APIが正常に応答する
- [ ] データベースに既存データが存在する

### 動作テスト項目
- [ ] 新規見積作成フローが完全動作する
- [ ] AI最適化機能が提案を返す
- [ ] Step6で正確な金額計算が表示される
- [ ] PDF出力機能が動作する
- [ ] データの保存・読み込みが正常動作する

---

## 📞 サポート情報

この復元ガイドで問題が解決しない場合：

1. **ログファイル確認**: `/home/user/.config/.wrangler/logs/` 
2. **PM2ログ確認**: `pm2 logs --nostream`
3. **ブラウザコンソール確認**: F12 → Console

復元完了後は、完全に同じ機能・状態でシステムが動作します。

---
**バックアップ作成日時**: 2025-10-17 06:16:14  
**システム状態**: 新フェーズ移行前完全状態  
**次の開発フェーズ**: システム拡張・新機能実装  