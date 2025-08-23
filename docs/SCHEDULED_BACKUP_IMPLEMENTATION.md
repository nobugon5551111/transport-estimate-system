# 定期バックアップ自動実行機能 実装ガイド

## 📋 概要

定期バックアップシステムは**Cloudflare Cron Triggers**を使用して自動実行されます。

## 🚀 実装内容

### 1. Cronトリガー設定

**wrangler.jsonc**
```jsonc
{
  "triggers": {
    "crons": ["0 * * * *"]  // 毎時0分に実行
  }
}
```

### 2. 自動実行ハンドラー

**src/index.tsx**
```typescript
export default {
  fetch: app.fetch,
  scheduled: async (event, env, ctx) => {
    // 毎時実行される定期バックアップチェック
    const result = await checkAndExecuteScheduledBackups(env.DB)
  }
}
```

### 3. 実行スケジュール例

| 設定 | 実行タイミング | 説明 |
|-----|---------------|------|
| **daily, 02:00** | 毎日午前2時 | 02:00台にCronが実行されると処理 |
| **weekly, 日曜, 03:00** | 毎週日曜午前3時 | 03:00台のCronで日曜日をチェック |
| **monthly, 1日, 04:00** | 毎月1日午前4時 | 04:00台のCronで1日をチェック |

## 🔄 動作フロー

```
Cloudflare Cron (毎時)
      ↓
scheduled() ハンドラー呼び出し
      ↓
checkAndExecuteScheduledBackups()
      ↓
各スケジュールをチェック
      ↓
shouldRunBackup() で実行判定
      ↓
executeScheduledBackup() でバックアップ実行
      ↓
backup_metadata テーブルに記録
```

## ⚙️ 設定管理

### Web管理画面
- **URL**: `/admin/backup`
- **機能**: スケジュール作成・編集・削除・有効/無効切り替え

### API エンドポイント
- `GET /api/backup-schedule` - スケジュール一覧取得
- `POST /api/backup-schedule` - スケジュール作成
- `GET /api/backup-schedule/check` - 手動実行（開発/テスト用）

## 📊 ログ確認

### デプロイ後のログ確認
```bash
# Cloudflare Dashboardでログ確認
wrangler pages deployment tail

# または特定の関数のログを確認
wrangler tail --format=pretty
```

### ログ出力例
```
🕐 定期バックアップCronトリガー実行: 2025-08-22T02:00:00.000Z
🔍 定期バックアップチェック開始: 2025-08-22T02:00:00.000Z
⚡ 定期バックアップ実行: 日次データバックアップ
✅ 定期バックアップ完了: 日次データバックアップ
✅ 定期バックアップCron完了: {"checked_at":"...","executed_backups":[...],"count":1}
```

## 🛠️ トラブルシューティング

### 1. Cronが動作しない
- デプロイ後に有効化されるため、本番環境でのみ動作
- ローカル開発では `/api/backup-schedule/check` で手動テスト

### 2. 実行時間の調整
```javascript
// 例：毎日午前3時に変更
"crons": ["0 3 * * *"]

// 例：6時間ごとに実行
"crons": ["0 */6 * * *"]
```

### 3. 実行履歴の確認
```sql
-- 最近の実行履歴
SELECT schedule_name, last_run, run_count 
FROM backup_schedules 
WHERE is_active = 1 
ORDER BY last_run DESC;

-- バックアップ生成履歴
SELECT backup_name, created_at, record_count, file_size
FROM backup_metadata 
WHERE backup_type = 'scheduled'
ORDER BY created_at DESC 
LIMIT 10;
```

## ✅ 完了チェックリスト

- [x] Cronトリガー設定追加
- [x] scheduled()ハンドラー実装
- [x] checkAndExecuteScheduledBackups()関数実装
- [x] 実行ログ出力
- [x] エラーハンドリング
- [x] ドキュメント作成

## 🎯 次回デプロイ後の確認事項

1. Cloudflare Dashboardでスケジュール設定確認
2. 最初の実行まで待機（最大1時間）
3. ログでCron実行の確認
4. バックアップ管理画面で生成されたバックアップ確認