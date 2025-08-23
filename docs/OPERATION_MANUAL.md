# 輸送見積もりシステム 運用マニュアル

## 目次
- [システム概要](#システム概要)
- [環境構築](#環境構築)
- [デプロイ手順](#デプロイ手順)
- [日常運用](#日常運用)
- [トラブルシューティング](#トラブルシューティング)
- [メンテナンス](#メンテナンス)
- [監視](#監視)
- [緊急時対応](#緊急時対応)

---

## システム概要

### システム名
輸送見積もりシステム (Transport Estimate System)

### 運用環境
- **本番環境**: Cloudflare Pages + Workers + D1
- **開発環境**: ローカル環境 + SQLite
- **バージョン管理**: Git + GitHub

### サービス構成
```
┌─────────────────┐
│ Cloudflare Pages│ ← フロントエンド配信
├─────────────────┤
│ Cloudflare Workers│ ← バックエンドAPI
├─────────────────┤
│ Cloudflare D1   │ ← データベース
└─────────────────┘
```

---

## 環境構築

### 前提条件
- Node.js 18.x以上
- npm 9.x以上
- Git
- Cloudflareアカウント
- GitHub アカウント

### 開発環境セットアップ

#### 1. リポジトリクローン
```bash
git clone https://github.com/your-username/transport-estimate-system.git
cd transport-estimate-system
```

#### 2. 依存関係インストール
```bash
npm install
```

#### 3. 環境変数設定
```bash
# .dev.vars ファイルを作成
cp .dev.vars.example .dev.vars

# 必要に応じて設定値を編集
# CLOUDFLARE_API_TOKEN=your_api_token
# DATABASE_URL=local_sqlite
```

#### 4. データベース初期化
```bash
# マイグレーション実行
npm run db:migrate:local

# サンプルデータ投入
npm run db:seed
```

#### 5. 開発サーバー起動
```bash
# PM2を使った開発サーバー起動
npm run dev:sandbox

# 通常の開発サーバー（ローカル環境のみ）
npm run dev
```

#### 6. 動作確認
```bash
# ヘルスチェック
curl http://localhost:3000/

# APIテスト
curl http://localhost:3000/api/customers
```

---

## デプロイ手順

### 初回デプロイ

#### 1. Cloudflare認証設定
```bash
# APIキーの設定（Deploy tab経由）
# setup_cloudflare_api_key ツールを使用

# 認証確認
npx wrangler whoami
```

#### 2. データベース作成
```bash
# 本番D1データベース作成
npx wrangler d1 create transport-estimate-production

# データベースIDを wrangler.jsonc に設定
# "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 3. マイグレーション実行
```bash
# 本番データベースにマイグレーション適用
npm run db:migrate:prod
```

#### 4. Cloudflare Pages プロジェクト作成
```bash
# プロジェクト作成
npx wrangler pages project create transport-estimate-system \
  --production-branch main \
  --compatibility-date 2024-08-22
```

#### 5. ビルド・デプロイ
```bash
# ビルド実行
npm run build

# デプロイ実行
npm run deploy
```

#### 6. 環境変数設定
```bash
# 本番環境の秘密情報設定
npx wrangler pages secret put API_SECRET_KEY --project-name transport-estimate-system
npx wrangler pages secret put DATABASE_URL --project-name transport-estimate-system
```

### 継続デプロイ

#### GitHub Actions（推奨）
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name transport-estimate-system
```

#### 手動デプロイ
```bash
# 最新コードを取得
git pull origin main

# ビルド・デプロイ
npm run build
npm run deploy
```

---

## 日常運用

### データベース管理

#### バックアップ
```bash
# 本番データベースのバックアップ
npx wrangler d1 execute transport-estimate-production \
  --command ".backup /tmp/backup_$(date +%Y%m%d_%H%M%S).db"

# ローカルにダウンロード
# (実際の運用では定期的なバックアップスクリプトを作成)
```

#### データ確認
```bash
# データベース内容確認
npx wrangler d1 execute transport-estimate-production \
  --command "SELECT COUNT(*) FROM estimates"

# 最新の見積確認
npx wrangler d1 execute transport-estimate-production \
  --command "SELECT estimate_number, total_amount, created_at FROM estimates ORDER BY created_at DESC LIMIT 10"
```

### ログ監視
```bash
# 本番ログ確認（Workers）
npx wrangler tail --project-name transport-estimate-system

# 開発環境ログ確認
pm2 logs transport-estimate-system --nostream
```

### パフォーマンス監視
```bash
# レスポンス時間測定
curl -w "@curl-format.txt" -o /dev/null -s "https://your-project.pages.dev/api/customers"

# curl-format.txt の内容:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. 見積保存時に「スタッフ費用が0円」になる

**症状**: PDF生成時にスタッフ費用が¥0と表示される

**原因**: STEP4→STEP5進行時のデータ保存問題

**解決方法**:
```bash
# 1. ブラウザのコンソールログを確認
# 「🔄 完全に再構築したスタッフ情報」が出力されているか確認

# 2. sessionStorageの内容確認
# ブラウザのDeveloper Tools > Application > Session Storage で確認

# 3. サーバーログ確認
pm2 logs transport-estimate-system --nostream | grep "staff_cost"

# 4. 最新コードが適用されているか確認
git status
npm run build  # 必要に応じて再ビルド
pm2 restart transport-estimate-system
```

#### 2. API エラー（502 Bad Gateway）

**症状**: API呼び出し時に502エラーが発生

**原因**: データベース接続エラーまたはコード実行エラー

**解決方法**:
```bash
# 1. ログ確認
npx wrangler tail --project-name transport-estimate-system

# 2. データベース接続確認
npx wrangler d1 execute transport-estimate-production --command "SELECT 1"

# 3. 環境変数確認
npx wrangler pages secret list --project-name transport-estimate-system

# 4. 再デプロイ
npm run build
npm run deploy
```

#### 3. PDF生成エラー

**症状**: PDF生成ボタンをクリックしてもPDFが生成されない

**解決方法**:
```bash
# 1. ブラウザのコンソールエラー確認
# Developer Tools > Console でエラーメッセージ確認

# 2. 見積データの確認
# /api/estimates/{id} で見積データが正常に取得できるか確認

# 3. PDF生成API直接テスト
curl -I "https://your-project.pages.dev/api/estimates/123/pdf"
```

#### 4. 車両料金が正しく計算されない

**症状**: 車両料金が予想と異なる金額で計算される

**解決方法**:
```bash
# 1. マスターデータ確認
npx wrangler d1 execute transport-estimate-production \
  --command "SELECT * FROM vehicle_pricing WHERE area='A' AND vehicle_type='2t車'"

# 2. 郵便番号エリア判定確認
curl "https://your-project.pages.dev/api/postal-areas/1234567"

# 3. フロントエンドの計算ロジック確認
# ブラウザのコンソールで計算過程のログを確認
```

### エラーコード一覧

| エラーコード | 説明 | 対処方法 |
|---|---|---|
| DB_CONNECTION_ERROR | データベース接続エラー | D1の状態確認、再デプロイ |
| VALIDATION_ERROR | 入力値検証エラー | 入力データの形式確認 |
| PDF_GENERATION_ERROR | PDF生成エラー | 見積データの完整性確認 |
| API_RATE_LIMIT | API制限エラー | しばらく待ってから再試行 |

---

## メンテナンス

### 定期メンテナンス

#### 日次作業
- [ ] システム死活監視確認
- [ ] エラーログチェック
- [ ] データベース容量確認

#### 週次作業
- [ ] パフォーマンス指標確認
- [ ] データベースバックアップ
- [ ] セキュリティアップデート確認

#### 月次作業
- [ ] 全機能の動作確認テスト
- [ ] 不要データのクリーンアップ
- [ ] システム利用状況レポート作成

### システム更新

#### マイナーアップデート
```bash
# 1. 開発環境でテスト
git checkout develop
git pull origin develop
npm install
npm run test  # テスト実行（将来実装）

# 2. ステージング環境でテスト
npm run build
npm run deploy:staging

# 3. 本番環境デプロイ
git checkout main
git merge develop
npm run deploy
```

#### メジャーアップデート
```bash
# 1. メンテナンスモード設定
# Cloudflare Pages の設定でメンテナンスページを表示

# 2. データベースバックアップ
npm run db:backup

# 3. マイグレーション実行
npm run db:migrate:prod

# 4. デプロイ実行
npm run deploy

# 5. 動作確認
npm run test:e2e  # E2Eテスト（将来実装）

# 6. メンテナンスモード解除
```

---

## 監視

### 監視項目

#### システム監視
- **稼働率**: 99.9%目標
- **レスポンス時間**: 2秒以内
- **エラー率**: 1%以下

#### ビジネス監視
- **見積作成数**: 日次・月次集計
- **PDF生成数**: 利用状況把握
- **顧客データ登録数**: データ増加トレンド

### 監視設定

#### Cloudflare Analytics
```bash
# Analytics API でデータ取得
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"
```

#### 外部監視サービス
```yaml
# uptimerobot.com 等での監視設定例
monitors:
  - name: "Transport Estimate System - Main"
    url: "https://your-project.pages.dev/"
    type: "http"
    interval: 300  # 5分間隔
  
  - name: "Transport Estimate System - API"
    url: "https://your-project.pages.dev/api/customers"
    type: "http"
    interval: 300
```

### アラート設定
```bash
# Slack通知設定例（webhook使用）
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 Transport Estimate System - Error Rate High: 5%"}' \
  YOUR_SLACK_WEBHOOK_URL
```

---

## 緊急時対応

### 障害対応フロー

#### レベル1: 軽微な障害
- **対象**: 機能の一部に影響
- **対応時間**: 4時間以内
- **担当者**: 開発チーム

#### レベル2: 重大な障害
- **対象**: 主要機能に影響
- **対応時間**: 1時間以内
- **担当者**: 開発チーム + 運用チーム

#### レベル3: 致命的な障害
- **対象**: システム全体が利用不可
- **対応時間**: 30分以内
- **担当者**: 全チーム

### 障害対応手順

#### 1. 障害検知
```bash
# 自動監視アラート または 手動発見

# 即座に状況確認
curl -I https://your-project.pages.dev/
npx wrangler tail --project-name transport-estimate-system
```

#### 2. 影響範囲特定
```bash
# システム全体の状況確認
curl https://your-project.pages.dev/api/customers
curl https://your-project.pages.dev/api/projects
curl https://your-project.pages.dev/api/estimates

# データベース状況確認
npx wrangler d1 execute transport-estimate-production --command "SELECT 1"
```

#### 3. 一時対応
```bash
# 過去の安定版へのロールバック
git checkout {stable_commit_hash}
npm run build
npm run deploy

# または、メンテナンスページの表示
# Cloudflare Pages 設定でメンテナンスページを有効化
```

#### 4. 根本対応
```bash
# 問題修正
git checkout main
# コード修正作業...

# テスト環境での確認
npm run build
npm run deploy:staging

# 本番適用
npm run deploy
```

#### 5. 事後処理
- 障害報告書作成
- 再発防止策検討
- 監視・アラート設定見直し

### 緊急連絡先

#### 開発チーム
- **責任者**: [名前] <email@example.com>
- **副責任者**: [名前] <email@example.com>

#### インフラチーム
- **Cloudflare**: サポートポータル
- **GitHub**: status.github.com

#### 関係者
- **プロジェクトマネージャー**: [名前] <email@example.com>
- **事業責任者**: [名前] <email@example.com>

---

## セキュリティ運用

### セキュリティチェック項目

#### 日次チェック
- [ ] 不正アクセスログの確認
- [ ] 異常なトラフィックパターンの検知

#### 週次チェック
- [ ] 依存関係の脆弱性スキャン
- [ ] アクセスログの詳細分析

#### 月次チェック
- [ ] セキュリティパッチの適用
- [ ] アクセス権限の棚卸し

### セキュリティインシデント対応
```bash
# 1. 即座にアクセス遮断
# Cloudflare セキュリティ設定で特定IPをブロック

# 2. ログ収集・保全
npx wrangler tail --project-name transport-estimate-system > incident_$(date +%Y%m%d_%H%M%S).log

# 3. 影響範囲調査
# データベースへの不正アクセスがないか確認
npx wrangler d1 execute transport-estimate-production --command "SELECT * FROM estimates ORDER BY updated_at DESC LIMIT 10"

# 4. 対策実施・報告
```

---

## データ管理

### データ保持ポリシー

#### 見積データ
- **保持期間**: 3年間
- **バックアップ**: 月次フルバックアップ + 日次差分バックアップ

#### ログデータ
- **保持期間**: 6ヶ月
- **バックアップ**: 週次アーカイブ

#### 個人情報
- **保持期間**: 法定保持期間に準拠
- **削除方法**: 論理削除 + 物理削除（一定期間後）

### データ移行

#### エクスポート
```bash
# CSV形式でのデータエクスポート
npx wrangler d1 execute transport-estimate-production \
  --command ".mode csv" \
  --command ".headers on" \
  --command ".output estimates_export.csv" \
  --command "SELECT * FROM estimates"
```

#### インポート
```bash
# CSVファイルからのデータインポート
npx wrangler d1 execute transport-estimate-production \
  --command ".mode csv" \
  --command ".import estimates_import.csv estimates"
```

---

## 更新履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|---|---|---|---|
| 1.0 | 2024-08-22 | 初版作成 | 開発チーム |

---

## 付録

### 便利なコマンド集

#### 開発環境
```bash
# 完全クリーンスタート
rm -rf node_modules .wrangler
npm install
npm run db:reset
npm run dev:sandbox

# デバッグ用ログ表示
pm2 logs transport-estimate-system --nostream | grep -E "(ERROR|WARN|staff_cost)"

# データベースリセット
npm run db:reset
```

#### 本番環境
```bash
# 本番データベース直接操作（注意して使用）
npx wrangler d1 execute transport-estimate-production --command "..."

# 本番ログ監視
npx wrangler tail --project-name transport-estimate-system | tee production.log

# デプロイ状況確認
npx wrangler pages deployment list --project-name transport-estimate-system
```

### 設定ファイル一覧

#### 重要ファイル
- `wrangler.jsonc`: Cloudflare設定
- `package.json`: 依存関係・スクリプト
- `ecosystem.config.cjs`: PM2設定
- `.dev.vars`: 開発環境変数
- `migrations/`: データベーススキーマ

#### バックアップ推奨ファイル
- プロジェクト全体: `tar -czvf backup.tar.gz /home/user/webapp/`
- 設定のみ: `tar -czvf config_backup.tar.gz wrangler.jsonc package.json ecosystem.config.cjs`