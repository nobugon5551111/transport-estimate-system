# AGENT.md - AIエージェント向け開発ガイド

## プロジェクト概要

**プロジェクト名:** 輸送見積もりシステム (Transport Estimate System)  
**コードネーム:** webapp  
**プロジェクトパス:** `/home/user/webapp/`  
**技術スタック:** Hono + TypeScript + Cloudflare Workers + D1 Database

## 完全バックアップシステム

### バックアップの重要性

このプロジェクトでは、**単一ZIPファイルによる完全バックアップシステム**を採用しています。
このバックアップには以下のすべてが含まれます：

- ✅ 完全なソースコード
- ✅ データベース完全バックアップ（SQL形式）
- ✅ Git履歴（全コミット履歴）
- ✅ すべての設定ファイル
- ✅ 自動復元スクリプト（RESTORE.sh）
- ✅ 復元手順書（README.md）

### バックアップの作成方法

#### 1. 自動バックアップスクリプトの実行

```bash
cd /home/user/webapp
./create_complete_backup.sh
```

このスクリプトは以下を自動的に実行します：

1. **データベースエクスポート**
   ```bash
   npx wrangler d1 export transport-estimate-production --local --output="database_backup.sql"
   ```

2. **ソースコードのコピー**
   - `node_modules/`、`.wrangler/`、`dist/`を除外
   - Git履歴を含むすべてのファイルをコピー

3. **自動復元スクリプトの生成**
   - `RESTORE.sh`を自動生成（実行可能権限付き）
   - 復元に必要なすべての手順を含む

4. **単一ZIPファイルの作成**
   ```bash
   zip -r webapp_complete_backup_YYYYMMDD_HHMMSS.zip backup_directory/
   ```

5. **ファイルの配置**
   - `/home/user/` にコピー（ダウンロード用）
   - `public/static/` にコピー（Web経由でのダウンロード用）

#### 2. バックアップ完了後の確認

```bash
# バックアップファイルの存在確認
ls -lh /home/user/webapp_complete_backup_*.zip

# ZIPファイルの内容確認
unzip -l /home/user/webapp_complete_backup_*.zip
```

#### 3. バックアップファイルのダウンロード

**Web経由でダウンロード（推奨）：**

1. ダウンロードページにアクセス：
   ```
   https://[your-service-url]/backup-downloads.html
   ```

2. 「完全バックアップをダウンロード」ボタンをクリック

**直接ダウンロードURL：**
```
https://[your-service-url]/static/webapp_complete_backup_[timestamp].zip
```

### バックアップの復元方法

#### 自動復元（推奨）

```bash
# 1. ZIPファイルを展開
unzip webapp_complete_backup_20251027_030934.zip

# 2. ディレクトリに移動
cd webapp_complete_backup_20251027_030934

# 3. 自動復元スクリプトを実行
./RESTORE.sh
```

`RESTORE.sh`は以下を自動的に実行します：

1. 既存の`/home/user/webapp/`をバックアップ（`webapp_old_[timestamp]`に移動）
2. ソースコードを`/home/user/webapp/`に復元
3. 依存関係のインストール（`npm install`）
4. データベースの復元
   - `.wrangler/state/v3/d1`の削除
   - マイグレーションの適用
   - バックアップSQLの実行
5. プロジェクトのビルド（`npm run build`）
6. PM2でサービスを起動
7. サービスの動作確認（`curl http://localhost:3000`）

#### 手動復元

自動復元スクリプトが動作しない場合の手順：

```bash
# 1. ソースコードの復元
cp -r webapp/ /home/user/webapp/

# 2. プロジェクトディレクトリに移動
cd /home/user/webapp

# 3. 依存関係のインストール
npm install

# 4. データベースの復元
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply transport-estimate-production --local
npx wrangler d1 execute transport-estimate-production --local --file=[backup-dir]/database_backup.sql

# 5. ビルド
npm run build

# 6. サービス起動
fuser -k 3000/tcp 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 7. 動作確認
curl http://localhost:3000
```

### バックアップシステムの技術的詳細

#### ファイル構造

```
webapp_complete_backup_20251027_030934/
├── database_backup.sql          # データベース完全エクスポート（30KB, 303行）
├── RESTORE.sh                   # 自動復元スクリプト（実行可能）
├── README.md                    # 復元手順書
├── BACKUP_INFO.txt              # バックアップメタデータ
└── webapp/                      # 完全なソースコードツリー
    ├── src/                     # TypeScriptソースコード
    ├── public/                  # 静的ファイル
    │   └── static/             # 静的アセット（CSS, JS, 画像）
    ├── migrations/             # D1データベースマイグレーション
    ├── .git/                   # Git履歴（全コミット）
    ├── package.json            # 依存関係定義
    ├── wrangler.jsonc          # Cloudflare設定
    ├── tsconfig.json           # TypeScript設定
    ├── vite.config.ts          # Vite設定
    ├── ecosystem.config.cjs    # PM2設定
    └── create_complete_backup.sh  # バックアップスクリプト
```

#### 重要な設定ファイル

**1. ecosystem.config.cjs（PM2設定）**
```javascript
module.exports = {
  apps: [
    {
      name: 'transport-estimate-system',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=transport-estimate-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
}
```

**2. wrangler.jsonc（Cloudflare設定）**
```jsonc
{
  "name": "webapp",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "transport-estimate-production",
      "database_id": "your-database-id"
    }
  ]
}
```

#### バックアップファイルのWeb配信

バックアップZIPファイルをWeb経由でダウンロード可能にするため、以下の手順を実施しています：

1. **ファイル配置**
   ```bash
   # public/static/にコピー
   cp /home/user/webapp_complete_backup_*.zip /home/user/webapp/public/static/
   ```

2. **Viteビルド**
   - `npm run build`実行時、`public/`の内容が`dist/`にコピーされる
   - `public/static/backup.zip` → `dist/static/backup.zip`

3. **Hono静的ファイル配信**
   ```typescript
   // src/index.tsx
   app.use('/static/*', serveStatic({ root: './' }))
   ```

4. **アクセスURL**
   ```
   https://[service-url]/static/webapp_complete_backup_20251027_030934.zip
   ```

### トラブルシューティング

#### バックアップが作成できない

**問題:** `create_complete_backup.sh`実行時にエラー

**解決策:**
```bash
# スクリプトに実行権限を付与
chmod +x /home/user/webapp/create_complete_backup.sh

# データベースエクスポートを個別にテスト
cd /home/user/webapp
npx wrangler d1 export transport-estimate-production --local --output=test_backup.sql
```

#### ZIPファイルがダウンロードできない

**問題:** Webページからダウンロードボタンを押しても404エラー

**原因:** ZIPファイルが`public/static/`に配置されていない

**解決策:**
```bash
# 1. ZIPファイルを正しい場所にコピー
cp /home/user/webapp_complete_backup_*.zip /home/user/webapp/public/static/

# 2. 再ビルド
cd /home/user/webapp
npm run build

# 3. サービス再起動
fuser -k 3000/tcp 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 4. 確認
curl -I http://localhost:3000/static/webapp_complete_backup_*.zip
```

#### 復元後にサービスが起動しない

**問題:** `RESTORE.sh`実行後、サービスが起動しない

**解決策:**
```bash
# 1. PM2ログを確認
pm2 logs transport-estimate-system --nostream --lines 30

# 2. ポートの確認と解放
fuser -k 3000/tcp 2>/dev/null || true

# 3. データベースの再初期化
cd /home/user/webapp
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply transport-estimate-production --local

# 4. 再度起動
pm2 start ecosystem.config.cjs

# 5. 動作確認
curl http://localhost:3000
```

### ベストプラクティス

#### 定期的なバックアップ

**推奨頻度:**
- 重要な機能追加後：即座にバックアップ
- 大規模な変更前：事前バックアップ
- 定期バックアップ：週1回

**バックアップコマンド:**
```bash
cd /home/user/webapp && ./create_complete_backup.sh
```

#### バックアップファイルの管理

**命名規則:**
```
webapp_complete_backup_YYYYMMDD_HHMMSS.zip
例: webapp_complete_backup_20251027_030934.zip
```

**保存場所:**
- `/home/user/` - ローカルバックアップ
- `public/static/` - Web経由でのダウンロード用
- AI Drive - 長期保存用（オプション）

#### Git管理との併用

バックアップシステムはGit管理を補完します：

**Gitでカバー:**
- コードの変更履歴
- ブランチ管理
- コミットメッセージ

**バックアップでカバー:**
- データベースの状態
- 設定ファイルの実際の値
- ビルド成果物
- 完全な動作環境

**併用のメリット:**
```bash
# Gitコミット
git add .
git commit -m "Add new feature"

# 完全バックアップ
./create_complete_backup.sh

# GitHub push
git push origin main
```

## 開発ワークフロー

### 1. 開発環境のセットアップ

```bash
cd /home/user/webapp
npm install
npm run build
pm2 start ecosystem.config.cjs
```

### 2. データベース操作

```bash
# マイグレーション適用
npx wrangler d1 migrations apply transport-estimate-production --local

# データベースリセット
npm run db:reset

# SQLコマンド実行
npx wrangler d1 execute transport-estimate-production --local --command="SELECT * FROM customers"
```

### 3. サービス管理

```bash
# サービス起動
pm2 start ecosystem.config.cjs

# 状態確認
pm2 list

# ログ確認
pm2 logs transport-estimate-system --nostream

# 再起動
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart transport-estimate-system

# 停止
pm2 stop transport-estimate-system
```

### 4. ビルドとデプロイ

```bash
# ローカルビルド
npm run build

# 開発サーバー起動
pm2 start ecosystem.config.cjs

# 本番デプロイ（Cloudflare Pages）
npm run deploy:prod
```

## プロジェクト構造

```
webapp/
├── src/
│   ├── index.tsx              # メインアプリケーションエントリポイント
│   ├── renderer.tsx           # JSXレンダラー
│   └── types.ts               # TypeScript型定義
├── public/
│   └── static/
│       ├── app.js             # フロントエンドJavaScript
│       ├── style.css          # カスタムCSS
│       └── *.zip              # バックアップファイル（Web配信用）
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_features.sql
│   └── meta/
├── .git/                      # Git履歴
├── .wrangler/                 # Wrangler作業ディレクトリ（gitignore）
├── dist/                      # ビルド出力（gitignore）
├── node_modules/              # 依存関係（gitignore）
├── package.json               # 依存関係とスクリプト定義
├── wrangler.jsonc             # Cloudflare設定
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
├── ecosystem.config.cjs       # PM2設定
├── create_complete_backup.sh  # バックアップスクリプト
├── BACKUP_SYSTEM_GUIDE.md    # バックアップシステムガイド
├── AGENT.md                   # このファイル
└── README.md                  # プロジェクトREADME
```

## 重要な注意事項

### 1. Cloudflare Workers環境の制限

- ❌ Node.jsの`fs`モジュールは使用不可（本番環境）
- ❌ ファイルシステムへの書き込み不可
- ✅ ローカル開発環境ではNode.js APIが使用可能
- ✅ 静的ファイルは`public/`経由で配信

### 2. データベース管理

- ローカル開発では`--local`フラグを使用
- 本番環境では`--local`フラグを削除
- データベース名: `transport-estimate-production`

### 3. バックアップの重要性

このプロジェクトでは、**見積書作成からPDF印刷までの完全なフロー**が実装されています。
この完全に動作する状態を保持するため、定期的なバックアップが極めて重要です。

**バックアップが特に重要な理由:**
- データベーススキーマとデータの一致
- 複雑なフロー制御ロジック
- マスター設定値
- 顧客・案件・見積データの整合性

## まとめ

このプロジェクトのバックアップシステムは、**完全な復元可能性**を保証するために設計されています。

**キーポイント:**
- 🎯 単一ZIPファイルで完全バックアップ
- 🔄 3ステップで自動復元
- 📦 ソースコード + データベース + Git履歴すべて含む
- 🌐 Web経由でダウンロード可能
- 🚀 バックアップから復元まで5分以内

**バックアップコマンド（重要）:**
```bash
cd /home/user/webapp && ./create_complete_backup.sh
```

このコマンド1つで、プロジェクトの完全なスナップショットが作成されます。
