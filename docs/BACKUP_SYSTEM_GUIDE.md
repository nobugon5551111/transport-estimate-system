# データバックアップシステム運用ガイド

## 目次
- [概要](#概要)
- [機能一覧](#機能一覧)
- [操作手順](#操作手順)
- [API仕様](#api仕様)
- [定期バックアップ設定](#定期バックアップ設定)
- [復元手順](#復元手順)
- [トラブルシューティング](#トラブルシューティング)

---

## 概要

輸送見積もりシステムに統合されたデータバックアップシステムは、システムデータの安全な保護と復元機能を提供します。

### 主要特徴
- **手動バックアップ**: 任意のタイミングでのデータ取得
- **定期バックアップ**: スケジュールによる自動実行
- **選択的バックアップ**: 必要なテーブルのみを対象
- **データ復元**: バックアップからの完全復元
- **Web管理画面**: 直感的な操作インターフェース

### 対象データ
- 顧客データ (customers)
- 案件データ (projects)
- 見積データ (estimates)
- 車両料金マスター (vehicle_pricing)
- スタッフ料金マスター (staff_rates)

---

## 機能一覧

### 1. 手動バックアップ作成
- **目的**: 即座にデータをバックアップ
- **形式**: JSON形式でのデータエクスポート
- **保存場所**: ローカルダウンロードまたはシステム内保存
- **保持期間**: デフォルト30日間

### 2. 定期バックアップ
- **頻度**: 日次・週次・月次
- **自動実行**: 指定時刻での自動バックアップ
- **保持管理**: 設定可能な保持期間
- **実行ログ**: 詳細な実行履歴記録

### 3. データ復元
- **対象**: 任意のバックアップから復元
- **範囲**: 全テーブルまたは選択テーブル
- **安全性**: 確認プロセス付き復元
- **ログ記録**: 復元操作の詳細ログ

### 4. バックアップ管理
- **一覧表示**: バックアップファイルの管理
- **ダウンロード**: バックアップファイルの取得
- **削除**: 不要なバックアップの削除
- **統計情報**: 容量・件数などの統計

---

## 操作手順

### 管理画面へのアクセス

1. **システムメニューから**
   ```
   トップページ → バックアップボタン
   ```

2. **直接URL**
   ```
   https://your-domain.com/admin/backup
   ```

### 手動バックアップの作成

1. **バックアップ作成ボタンをクリック**
2. **設定項目を入力**
   - バックアップ名: 識別しやすい名前を入力
   - 対象テーブル: 必要なテーブルを選択
3. **バックアップ作成を実行**
4. **ダウンロードまたは保存**

### バックアップファイルのダウンロード

1. **バックアップ一覧から対象を選択**
2. **ダウンロードボタンをクリック**
3. **JSONファイルとして保存**

### データ復元の実行

⚠️ **注意**: データ復元は既存データを置き換えます

1. **復元対象のバックアップを選択**
2. **復元ボタンをクリック**
3. **警告メッセージを確認**
4. **復元実行を確認**
5. **完了確認とシステムチェック**

---

## API仕様

### バックアップ一覧取得
```http
GET /api/backups
```

**レスポンス例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "backup_name": "手動バックアップ_2024-08-22",
      "backup_type": "manual",
      "file_size": 15420,
      "record_count": 25,
      "status": "completed",
      "created_at": "2024-08-22T10:00:00.000Z",
      "expires_at": "2024-09-22T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### バックアップ作成
```http
POST /api/backups/create
```

**リクエスト例**
```json
{
  "backup_name": "手動バックアップ_2024-08-22",
  "backup_type": "manual",
  "tables": ["customers", "projects", "estimates"]
}
```

### バックアップダウンロード
```http
GET /api/backups/:id/download
```

### データ復元
```http
POST /api/backups/:id/restore
```

**リクエスト例**
```json
{
  "confirm": true,
  "tables": ["customers", "projects"]
}
```

### バックアップ削除
```http
DELETE /api/backups/:id
```

---

## 定期バックアップ設定

### スケジュール設定API

#### 設定取得
```http
GET /api/backup-schedule
```

#### 設定保存
```http
POST /api/backup-schedule
```

**リクエスト例**
```json
{
  "schedule_name": "日次バックアップ",
  "frequency": "daily",
  "time_hour": 2,
  "time_minute": 0,
  "tables": ["customers", "projects", "estimates"],
  "retention_days": 7,
  "is_active": true
}
```

### 頻度設定

#### 日次バックアップ
```json
{
  "frequency": "daily",
  "frequency_value": null,
  "time_hour": 2,
  "time_minute": 0
}
```

#### 週次バックアップ
```json
{
  "frequency": "weekly",
  "frequency_value": 0,  // 0=日曜日, 1=月曜日, ..., 6=土曜日
  "time_hour": 3,
  "time_minute": 0
}
```

#### 月次バックアップ
```json
{
  "frequency": "monthly",
  "frequency_value": 1,  // 1-31の日付
  "time_hour": 1,
  "time_minute": 0
}
```

### 自動実行チェック
```http
GET /api/backup-schedule/check
```

**注意**: この API は Cron Job や定期実行スクリプトから呼び出します

---

## 復元手順

### 事前確認

1. **復元対象の確認**
   - バックアップの作成日時
   - 含まれるデータの範囲
   - データの整合性

2. **システム状態の確認**
   - アクティブユーザーの確認
   - 処理中のタスクの完了待ち
   - メンテナンスモードの検討

### 復元実行

1. **管理画面での操作**
   ```
   管理画面 → バックアップ一覧 → 復元ボタン → 確認 → 実行
   ```

2. **API経由での復元**
   ```bash
   curl -X POST "http://localhost:3000/api/backups/1/restore" \
     -H "Content-Type: application/json" \
     -d '{"confirm": true}'
   ```

### 復元後の確認

1. **データ整合性チェック**
   - 各テーブルのレコード数確認
   - 関連データの整合性確認
   - 業務フローでの動作確認

2. **システム動作確認**
   - 見積作成フローの確認
   - API レスポンスの確認
   - ユーザー操作の確認

---

## トラブルシューティング

### よくある問題

#### 1. バックアップ作成に失敗する

**症状**: バックアップ作成時にエラーが発生

**原因と対処**:
```bash
# データベース接続確認
curl http://localhost:3000/api/customers

# ディスク容量確認
df -h

# サーバーログ確認
pm2 logs transport-estimate-system --nostream
```

#### 2. ダウンロードができない

**症状**: バックアップファイルがダウンロードできない

**対処方法**:
```bash
# API直接テスト
curl -I "http://localhost:3000/api/backups/1/download"

# ブラウザキャッシュクリア
# JavaScript コンソールエラーの確認
```

#### 3. 復元処理が失敗する

**症状**: データ復元時にエラーが発生

**対処方法**:
```bash
# データベース状態確認
npx wrangler d1 execute webapp-production --local --command "SELECT COUNT(*) FROM customers"

# トランザクション状態確認
# 部分復元の試行
```

#### 4. 定期バックアップが実行されない

**症状**: スケジュールされたバックアップが実行されない

**対処方法**:
```bash
# スケジュール確認API
curl "http://localhost:3000/api/backup-schedule"

# 手動チェック実行
curl "http://localhost:3000/api/backup-schedule/check"

# Cron Job の設定確認
crontab -l
```

### エラーコード一覧

| コード | 説明 | 対処方法 |
|---|---|---|
| 404 | バックアップが見つからない | ID確認、一覧更新 |
| 500 | データベースエラー | 接続確認、再起動 |
| 400 | 不正なリクエスト | パラメータ確認 |

### 復旧手順

#### システム全体の復旧

1. **最新バックアップの特定**
2. **システム停止**
3. **データベースクリア**
4. **バックアップからの復元**
5. **システム再起動**
6. **動作確認**

```bash
# 復旧コマンド例
pm2 stop transport-estimate-system
curl -X POST "http://localhost:3000/api/backups/latest/restore" -d '{"confirm": true}'
pm2 start transport-estimate-system
```

---

## 運用推奨事項

### バックアップ戦略

#### 頻度設定推奨
- **日次**: 重要データ (customers, estimates)
- **週次**: 全データ (全テーブル)
- **月次**: アーカイブ用 (全データ + 長期保存)

#### 保持期間推奨
- **日次バックアップ**: 7日間
- **週次バックアップ**: 30日間
- **月次バックアップ**: 1年間

### 監視設定

#### 確認項目
- バックアップ実行成功率
- ファイルサイズの変化
- ディスク容量
- 復元テストの定期実行

#### アラート設定
```bash
# バックアップ失敗時のアラート例
if [ $(curl -s "http://localhost:3000/api/backups" | jq -r '.data[0].status') != "completed" ]; then
  echo "バックアップが失敗しました" | mail -s "Backup Alert" admin@company.com
fi
```

### セキュリティ考慮事項

#### データ保護
- バックアップファイルの暗号化検討
- アクセス権限の制限
- ダウンロード履歴の記録

#### アクセス制御
- 管理画面への認証機能
- 操作ログの記録
- IP制限の検討

---

## 付録

### Cron Job 設定例

```bash
# 定期バックアップチェック (毎時間実行)
0 * * * * curl -s "http://localhost:3000/api/backup-schedule/check" > /dev/null

# 古いバックアップの削除 (毎日午前5時)
0 5 * * * curl -s -X POST "http://localhost:3000/api/backups/cleanup"
```

### データベーススキーマ

#### backup_metadata テーブル
```sql
CREATE TABLE backup_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'manual',
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  record_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  created_by TEXT DEFAULT 'system',
  notes TEXT
);
```

#### backup_schedules テーブル
```sql
CREATE TABLE backup_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  frequency_value INTEGER,
  time_hour INTEGER DEFAULT 2,
  time_minute INTEGER DEFAULT 0,
  target_tables TEXT,
  retention_days INTEGER DEFAULT 30,
  is_active INTEGER DEFAULT 1,
  last_run DATETIME,
  run_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### バックアップファイル形式

```json
{
  "metadata": {
    "backup_name": "手動バックアップ_2024-08-22",
    "backup_type": "manual",
    "created_at": "2024-08-22T10:00:00.000Z",
    "version": "1.0",
    "tables": ["customers", "projects", "estimates"]
  },
  "data": {
    "customers": [
      {
        "id": 1,
        "name": "株式会社サンプル",
        "contact_person": "田中太郎",
        "created_at": "2024-08-22T09:00:00.000Z"
      }
    ],
    "projects": [...],
    "estimates": [...]
  }
}
```

---

## 更新履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|---|---|---|---|
| 1.0 | 2024-08-22 | 初版作成・基本機能実装 | 開発チーム |