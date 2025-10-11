# 🗄️ 輸送見積もりシステム - 完全復旧ガイド

**作成日時**: 2025年10月11日 11:03
**バックアップ時点**: 車両・スタッフ・サービス料金機能正常動作確認済み
**キャッシュバスター**: v=1760180166

---

## 📦 **バックアップファイル**

### 1. **プロジェクトファイル**
- **URL**: https://page.gensparksite.com/project_backups/transport_estimate_system_stable_backup.tar.gz
- **サイズ**: 2.17MB
- **内容**: 全ソースコード、設定ファイル、Git履歴

### 2. **データベースファイル** 
- **ファイル名**: `database_backup_20251011_110317.sql`
- **場所**: プロジェクトルート
- **内容**: 全マスター設定、顧客データ、見積データ

---

## 🔧 **完全復旧手順**

### **Step 1: プロジェクト復元**
```bash
# バックアップファイルをダウンロード
wget https://page.gensparksite.com/project_backups/transport_estimate_system_stable_backup.tar.gz

# ホームディレクトリで展開（絶対パス構造を保持）
cd /home/user
tar -xzf transport_estimate_system_stable_backup.tar.gz

# プロジェクトディレクトリに移動
cd /home/user/webapp
```

### **Step 2: 依存関係インストール**
```bash
npm install
```

### **Step 3: データベース復元**
```bash
# ローカルデータベースをリセット
rm -rf .wrangler/state/v3/d1

# マイグレーション実行
npm run db:migrate:local

# バックアップデータを復元
npx wrangler d1 execute transport-estimate-production --local --file=./database_backup_20251011_110317.sql
```

### **Step 4: ビルド・起動**
```bash
# プロジェクトをビルド
npm run build

# PM2で起動
pm2 start ecosystem.config.cjs
```

### **Step 5: 動作確認**
```bash
# サービス状況確認
curl http://localhost:3000

# PM2ログ確認
pm2 logs transport-estimate-system --nostream
```

---

## ✅ **復旧時の確認項目**

### **1. 基本機能**
- [ ] マスタ管理のタブ切り替え（車両・スタッフ・サービス・顧客・案件）
- [ ] 設定ページの表示

### **2. データ保存機能**
- [ ] 車両料金の数字表示（例：41000、52000）
- [ ] スタッフ料金の保存・表示
- [ ] サービス料金の保存・表示
  - 養生作業基本料金: **5000円**
  - 養生作業フロア単価: **3000円**
  - 早朝時間係数: **1.2**
  - 夜間時間係数: **1.5**
  - 深夜時間係数: **2.0**

### **3. キャッシュバスター確認**
- コンソールで `app.js?v=1760180166` が読み込まれていること

---

## 🚨 **既知の問題**

### **顧客マスター新規追加**
- **症状**: モーダルが開いた後すぐに閉じる
- **原因**: 動的作成フォームのイベントリスナー問題
- **状況**: 未修正（既存機能に影響させないため保留）

---

## 📋 **技術仕様**

### **環境**
- **Node.js**: 最新版
- **Framework**: Hono + Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Process Manager**: PM2

### **重要ファイル**
- `src/index.tsx`: メインアプリケーション
- `src/renderer.tsx`: 共通レンダラー（キャッシュバスター含む）
- `public/static/app.js`: メインJavaScript（キャッシュバスター更新済み）
- `wrangler.jsonc`: Cloudflare設定
- `ecosystem.config.cjs`: PM2設定

### **キャッシュバスター管理**
キャッシュ問題が発生した場合：
1. 新しいタイムスタンプを生成: `date +%s`
2. 以下のファイルでバージョン番号更新:
   - `src/renderer.tsx`
   - `src/index.tsx` (2箇所)
   - `public/static/app.js` (コメント内)

---

## 📞 **サポート**

このガイドでの復旧で問題が発生した場合：
1. **エラーログを確認**: `pm2 logs --nostream`
2. **ポート競合確認**: `fuser -k 3000/tcp`
3. **ブラウザキャッシュクリア**: Ctrl+Shift+R

**最終更新**: 2025年10月11日 11:03
**バックアップ作成者**: AI Assistant