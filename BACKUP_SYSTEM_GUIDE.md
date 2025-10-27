# 単一ZIPファイルバックアップシステム

## 🎯 概要

このシステムは、**すべてを1つのZIPファイルにまとめる**バックアップ方式です。
あなたがZIPファイルを渡すだけで、誰でも完全にシステムを復元できます。

## 📦 単一ZIPファイルに含まれるもの

### 1. **ソースコード完全版**
- `src/` - バックエンドコード
- `public/` - フロントエンドコード、静的ファイル
- すべての設定ファイル

### 2. **データベース完全バックアップ**
- `database_backup.sql` - 全テーブル、全マスターデータ

### 3. **設定ファイル**
- `package.json` - 依存関係
- `wrangler.jsonc` - Cloudflare設定
- `tsconfig.json` - TypeScript設定
- `vite.config.ts` - ビルド設定
- `ecosystem.config.cjs` - PM2設定

### 4. **Git履歴**
- `.git/` - 完全なコミット履歴

### 5. **自動復元スクリプト**
- `RESTORE.sh` - **1つのコマンドで完全復元**

### 6. **ドキュメント**
- `README.md` - プロジェクト説明
- `BACKUP_INFO.txt` - バックアップ情報

## 🚀 バックアップの作成方法

### ステップ1: スクリプトを実行

```bash
cd /home/user/webapp
./create_complete_backup.sh
```

**これだけです！**

### 実行内容

1. ✅ データベースをエクスポート
2. ✅ ソースコードをコピー
3. ✅ 自動復元スクリプトを生成
4. ✅ READMEを生成
5. ✅ すべてを1つのZIPファイルに圧縮
6. ✅ `/home/user/` と `public/` にコピー

### 出力

```
/home/user/webapp_complete_backup_YYYYMMDD_HHMMSS.zip
```

**ファイルサイズ**: 約9.2MB（node_modules、dist、.wranglerは除外）

## 📥 復元方法（超簡単！）

### 方法1: 自動復元スクリプト（推奨）

```bash
# 1. ZIPファイルを展開
unzip webapp_complete_backup_YYYYMMDD_HHMMSS.zip
cd webapp_complete_backup_YYYYMMDD_HHMMSS

# 2. 復元スクリプトを実行（これだけ！）
./RESTORE.sh
```

**完了！** システムが完全に復元されます。

### 復元スクリプトが自動実行すること

1. ✅ 既存の`/home/user/webapp`をバックアップ
2. ✅ ソースコードを`/home/user/webapp`にコピー
3. ✅ `npm install`で依存関係をインストール
4. ✅ データベースを復元
5. ✅ `npm run build`でビルド
6. ✅ PM2でサービスを起動
7. ✅ 動作確認

### 方法2: 手動復元

自動スクリプトが使えない場合:

```bash
# 1. ZIPを展開
unzip webapp_complete_backup_YYYYMMDD_HHMMSS.zip
cd webapp_complete_backup_YYYYMMDD_HHMMSS

# 2. ソースコードを配置
cp -r webapp /home/user/

# 3. 依存関係をインストール
cd /home/user/webapp
npm install

# 4. データベースを復元
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply transport-estimate-production --local
npx wrangler d1 execute transport-estimate-production --local --file=PATH_TO_ZIP/database_backup.sql

# 5. ビルドと起動
npm run build
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs
```

## 🌐 ダウンロード方法

### ブラウザからダウンロード

1. システムにアクセス: http://localhost:3000
2. ダウンロードページを開く: http://localhost:3000/backup-downloads
3. 「完全バックアップをダウンロード」ボタンをクリック

### コマンドラインからコピー

```bash
# /home/user/ にあるZIPファイルをコピー
cp /home/user/webapp_complete_backup_*.zip /path/to/your/backup/
```

## 📋 使用シーン

### シーン1: 定期バックアップ

```bash
# 毎週月曜日にバックアップを作成
cd /home/user/webapp
./create_complete_backup.sh

# ZIPファイルを外部ストレージに保存
cp /home/user/webapp_complete_backup_*.zip /mnt/backup/
```

### シーン2: 緊急復元

システムが壊れた場合:

```bash
# 最新のバックアップを展開
cd /tmp
unzip /path/to/webapp_complete_backup_YYYYMMDD_HHMMSS.zip
cd webapp_complete_backup_YYYYMMDD_HHMMSS

# 復元
./RESTORE.sh
```

### シーン3: 別環境への移行

新しいサーバーにシステムを移行:

```bash
# 1. 新しいサーバーにZIPファイルをアップロード
scp webapp_complete_backup_YYYYMMDD_HHMMSS.zip user@newserver:/tmp/

# 2. 新しいサーバーで復元
ssh user@newserver
cd /tmp
unzip webapp_complete_backup_YYYYMMDD_HHMMSS.zip
cd webapp_complete_backup_YYYYMMDD_HHMMSS
./RESTORE.sh
```

## ⚠️ 重要な注意事項

### 1. バックアップファイルの保管

- ✅ **複数の場所に保存**: ローカル + クラウド + 外部ストレージ
- ✅ **定期的にバックアップ**: 週1回以上推奨
- ✅ **古いバックアップも保持**: 最低3世代分

### 2. 復元時の注意

- ✅ **Node.js v18以上**: 必須
- ✅ **PM2インストール**: `npm install -g pm2`
- ✅ **ポート3000**: 他のプロセスで使用されていないこと
- ✅ **ディスク容量**: 最低1GB以上の空き容量

### 3. セキュリティ

- ⚠️ **データベースに機密情報が含まれる**: ZIPファイルは安全に保管
- ⚠️ **Git履歴を含む**: コミットメッセージに機密情報がないか確認

## 🔧 トラブルシューティング

### 問題1: 復元スクリプトが実行できない

```bash
chmod +x RESTORE.sh
./RESTORE.sh
```

### 問題2: npm install が失敗

```bash
# Node.jsのバージョンを確認
node --version  # v18以上が必要

# npmキャッシュをクリア
npm cache clean --force
npm install
```

### 問題3: データベース復元エラー

```bash
# データベースを完全にクリア
rm -rf .wrangler/state/v3/d1

# マイグレーションを再実行
npx wrangler d1 migrations apply transport-estimate-production --local

# バックアップをインポート
npx wrangler d1 execute transport-estimate-production --local --file=database_backup.sql
```

### 問題4: PM2起動エラー

```bash
# PM2プロセスをすべて削除
pm2 delete all

# ポート3000をクリーンアップ
fuser -k 3000/tcp

# 再起動
pm2 start ecosystem.config.cjs
```

## 📊 バックアップファイルの構造

```
webapp_complete_backup_YYYYMMDD_HHMMSS.zip
├── database_backup.sql          # データベース完全バックアップ
├── RESTORE.sh                   # 自動復元スクリプト
├── README.md                    # 復元手順
├── BACKUP_INFO.txt              # バックアップ情報
└── webapp/                      # プロジェクト完全版
    ├── src/                     # ソースコード
    ├── public/                  # 静的ファイル
    ├── migrations/              # データベースマイグレーション
    ├── .git/                    # Git履歴
    ├── package.json             # 依存関係
    ├── wrangler.jsonc           # Cloudflare設定
    ├── tsconfig.json            # TypeScript設定
    ├── vite.config.ts           # ビルド設定
    ├── ecosystem.config.cjs     # PM2設定
    └── ... (その他すべてのファイル)
```

## 🎉 まとめ

### バックアップ作成
```bash
cd /home/user/webapp
./create_complete_backup.sh
```

### 復元
```bash
unzip webapp_complete_backup_YYYYMMDD_HHMMSS.zip
cd webapp_complete_backup_YYYYMMDD_HHMMSS
./RESTORE.sh
```

**これだけです！** 単一ZIPファイルで完全バックアップ・完全復元が可能です。

---

**作成日**: 2025年10月27日  
**バージョン**: 1.0  
**作成者**: 輸送見積もりシステム
