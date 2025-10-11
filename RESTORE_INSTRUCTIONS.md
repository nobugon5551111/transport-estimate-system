# 輸送見積もりシステム - 完全復旧手順

## バックアップ日時
- 作成日時: 2024年10月11日
- 状態: 車両・スタッフ・サービス料金修正完了、安定動作確認済み
- キャッシュバスター: v=1760180166

## 修正完了済み機能
### ✅ 解決済みの問題
1. **車両料金上書き問題** - APIサブカテゴリー修正完了
2. **スタッフ料金上書き問題** - データ保護機能追加完了  
3. **サービス料金上書き問題** - キャッシュバスター実装完了
4. **二重初期化問題** - 実行フラグ追加完了

### ✅ 確認済み正常値
- 養生作業基本料金: 5000円（8000→5000の変更保存済み）
- 養生作業フロア単価: 3000円（2000→3000の変更保存済み）  
- 早朝時間係数: 1.2（1.15→1.2の変更保存済み）
- 夜間時間係数: 1.5（1.25→1.5の変更保存済み）
- 深夜時間係数: 2.0（1.5→2.0の変更保存済み）

## プロジェクト構造
### 主要ファイル
- `/src/index.tsx` - メインアプリケーション（Hono）
- `/src/renderer.tsx` - 共通HTMLレンダラー
- `/public/static/app.js` - フロントエンドメインロジック
- `/public/static/style.css` - カスタムスタイル
- `/migrations/` - データベーススキーマ
- `ecosystem.config.cjs` - PM2設定
- `wrangler.jsonc` - Cloudflare設定

### データベース構造
- **master_settings** テーブル: カテゴリー/サブカテゴリー/キー/値構造
- **customers** テーブル: 顧客マスター
- **projects** テーブル: 案件マスター  
- **estimates** テーブル: 見積データ

## 復旧手順
1. **tarファイルを展開**: `tar -xzf transport_estimate_system_stable_backup_20241011.tar.gz`
2. **依存関係インストール**: `npm install`
3. **ビルド**: `npm run build`  
4. **データベース設定**: `npm run db:migrate:local && npm run db:seed`
5. **開発サーバー起動**: `pm2 start ecosystem.config.cjs`

## 重要な技術情報
- **Node.js**: v18以上推奨
- **フレームワーク**: Hono + Cloudflare Workers  
- **データベース**: Cloudflare D1 (SQLite)
- **フロントエンド**: Vanilla JS + TailwindCSS CDN
- **プロセス管理**: PM2

## 既知の未解決問題  
- 顧客マスター新規追加時のモーダル即座クローズ問題（既存機能に影響なし）

## 緊急時の連絡先
- キャッシュ問題: Ctrl+Shift+R で強制リフレッシュ
- データ不整合: `npm run db:reset` でデータベースリセット
