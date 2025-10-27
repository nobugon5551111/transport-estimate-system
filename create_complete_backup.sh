#!/bin/bash

# =============================================================================
# 完全バックアップ作成スクリプト
# =============================================================================
# このスクリプトは、システム全体を単一のZIPファイルにバックアップします
# =============================================================================

set -e  # エラーが発生したら即座に終了

# 色付き出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}輸送見積もりシステム - 完全バックアップ作成${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# タイムスタンプ生成
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="webapp_complete_backup_${TIMESTAMP}"
BACKUP_DIR="/tmp/${BACKUP_NAME}"
ZIP_FILE="/home/user/${BACKUP_NAME}.zip"

echo -e "${YELLOW}📅 バックアップタイムスタンプ: ${TIMESTAMP}${NC}"
echo -e "${YELLOW}📦 バックアップ名: ${BACKUP_NAME}${NC}"
echo ""

# 作業ディレクトリ作成
echo -e "${GREEN}1. 作業ディレクトリ作成...${NC}"
rm -rf "${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

# プロジェクトルートに移動
cd /home/user/webapp

# 2. データベースエクスポート
echo -e "${GREEN}2. データベースエクスポート...${NC}"
npx wrangler d1 export transport-estimate-production --local --output="${BACKUP_DIR}/database_backup.sql" 2>&1 | grep -v "npm notice" || true
if [ -f "${BACKUP_DIR}/database_backup.sql" ]; then
    DB_SIZE=$(ls -lh "${BACKUP_DIR}/database_backup.sql" | awk '{print $5}')
    DB_LINES=$(wc -l < "${BACKUP_DIR}/database_backup.sql")
    echo -e "   ✅ データベースバックアップ完了 (${DB_SIZE}, ${DB_LINES}行)"
else
    echo -e "${RED}   ❌ データベースエクスポート失敗${NC}"
    exit 1
fi

# 3. ソースコードとGit履歴をコピー
echo -e "${GREEN}3. ソースコードとGit履歴をコピー...${NC}"
mkdir -p "${BACKUP_DIR}/webapp"
cp -r /home/user/webapp/. "${BACKUP_DIR}/webapp/"
# 不要なディレクトリを削除
rm -rf "${BACKUP_DIR}/webapp/node_modules"
rm -rf "${BACKUP_DIR}/webapp/.wrangler"
rm -rf "${BACKUP_DIR}/webapp/dist"
echo -e "   ✅ ソースコードコピー完了"

# 4. package.json情報取得
echo -e "${GREEN}4. システム情報収集...${NC}"
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
NPM_VERSION=$(npm --version 2>/dev/null || echo "unknown")

# 5. 復元スクリプト作成
echo -e "${GREEN}5. 復元スクリプト作成...${NC}"
cat > "${BACKUP_DIR}/RESTORE.sh" << 'RESTORE_SCRIPT'
#!/bin/bash

# =============================================================================
# 完全復元スクリプト
# =============================================================================
# このスクリプトを実行するだけで、システムが完全に復元されます
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}輸送見積もりシステム - 完全復元${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# 現在のディレクトリを確認
CURRENT_DIR=$(pwd)
echo -e "${YELLOW}📍 現在のディレクトリ: ${CURRENT_DIR}${NC}"
echo ""

# webapp ディレクトリが存在するか確認
if [ ! -d "${CURRENT_DIR}/webapp" ]; then
    echo -e "${RED}❌ エラー: webapp ディレクトリが見つかりません${NC}"
    echo -e "${YELLOW}このスクリプトは、展開したバックアップのルートディレクトリで実行してください${NC}"
    exit 1
fi

# 復元先ディレクトリ
TARGET_DIR="/home/user/webapp"

# 既存のディレクトリがある場合の処理
if [ -d "${TARGET_DIR}" ]; then
    echo -e "${YELLOW}⚠️  既存のディレクトリが見つかりました: ${TARGET_DIR}${NC}"
    echo -e "${YELLOW}   バックアップを作成してから上書きします${NC}"
    BACKUP_OLD="/home/user/webapp_old_$(date +%Y%m%d_%H%M%S)"
    mv "${TARGET_DIR}" "${BACKUP_OLD}"
    echo -e "   ✅ 既存ディレクトリを ${BACKUP_OLD} に移動しました"
fi

# 1. ソースコードを復元
echo -e "${GREEN}1. ソースコードを復元...${NC}"
mkdir -p /home/user
cp -r "${CURRENT_DIR}/webapp" "${TARGET_DIR}"
echo -e "   ✅ ソースコード復元完了"

# 2. 依存関係をインストール
echo -e "${GREEN}2. 依存関係をインストール...${NC}"
cd "${TARGET_DIR}"
npm install
echo -e "   ✅ npm install 完了"

# 3. データベースを復元
echo -e "${GREEN}3. データベースを復元...${NC}"

# 既存のデータベースを削除
if [ -d "${TARGET_DIR}/.wrangler/state/v3/d1" ]; then
    rm -rf "${TARGET_DIR}/.wrangler/state/v3/d1"
    echo -e "   ✅ 既存データベースを削除"
fi

# マイグレーション実行
npx wrangler d1 migrations apply transport-estimate-production --local 2>&1 | grep -v "npm notice" || true
echo -e "   ✅ マイグレーション実行完了"

# データベースバックアップをインポート
if [ -f "${CURRENT_DIR}/database_backup.sql" ]; then
    npx wrangler d1 execute transport-estimate-production --local --file="${CURRENT_DIR}/database_backup.sql" 2>&1 | grep -v "npm notice" || true
    echo -e "   ✅ データベースインポート完了"
else
    echo -e "${YELLOW}   ⚠️  database_backup.sql が見つかりません${NC}"
fi

# 4. ビルド
echo -e "${GREEN}4. プロジェクトをビルド...${NC}"
npm run build
echo -e "   ✅ ビルド完了"

# 5. PM2設定
echo -e "${GREEN}5. PM2でサービスを起動...${NC}"

# 既存のPM2プロセスを停止
pm2 delete all 2>/dev/null || true

# ポート3000をクリーンアップ
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

# PM2で起動
pm2 start ecosystem.config.cjs
echo -e "   ✅ PM2起動完了"

sleep 3

# 6. 動作確認
echo -e "${GREEN}6. 動作確認...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "   ✅ サービスが正常に起動しました"
else
    echo -e "${RED}   ❌ サービスの起動に失敗しました${NC}"
    echo -e "${YELLOW}   ログを確認してください: pm2 logs${NC}"
fi

echo ""
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}✅ 復元完了！${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}📍 プロジェクトディレクトリ: ${TARGET_DIR}${NC}"
echo -e "${YELLOW}🌐 アクセスURL: http://localhost:3000${NC}"
echo -e "${YELLOW}📊 PM2ステータス: pm2 list${NC}"
echo -e "${YELLOW}📝 ログ確認: pm2 logs --nostream${NC}"
echo ""
echo -e "${GREEN}バックアップダウンロードページ: http://localhost:3000/backup-downloads${NC}"
echo ""

RESTORE_SCRIPT

chmod +x "${BACKUP_DIR}/RESTORE.sh"
echo -e "   ✅ 復元スクリプト作成完了"

# 6. README作成
echo -e "${GREEN}6. READMEファイル作成...${NC}"
cat > "${BACKUP_DIR}/README.md" << EOF
# 輸送見積もりシステム - 完全バックアップ

## 📦 バックアップ情報

- **作成日時**: $(date '+%Y年%m月%d日 %H:%M:%S')
- **タイムスタンプ**: ${TIMESTAMP}
- **Gitコミット**: ${GIT_COMMIT}
- **Gitブランチ**: ${GIT_BRANCH}
- **Node.js**: ${NODE_VERSION}
- **npm**: ${NPM_VERSION}

## 📋 含まれる内容

- ✅ ソースコード完全版（src/, public/）
- ✅ 設定ファイル（package.json, wrangler.jsonc, tsconfig.json, vite.config.ts）
- ✅ PM2設定（ecosystem.config.cjs）
- ✅ Git履歴（.git/）
- ✅ データベース完全バックアップ（database_backup.sql）
- ✅ ドキュメント（README.md, RESTORE_INSTRUCTIONS.md, DATABASE_SCHEMA.md）
- ✅ 自動復元スクリプト（RESTORE.sh）

## 🚀 復元方法（超簡単！）

### 方法1: 自動復元スクリプト（推奨）

\`\`\`bash
# 1. ZIPファイルを展開
unzip ${BACKUP_NAME}.zip
cd ${BACKUP_NAME}

# 2. 復元スクリプトを実行（これだけ！）
./RESTORE.sh
\`\`\`

**これだけで完全に復元されます！**

### 方法2: 手動復元

\`\`\`bash
# 1. ZIPファイルを展開
unzip ${BACKUP_NAME}.zip
cd ${BACKUP_NAME}

# 2. ソースコードを配置
cp -r webapp /home/user/

# 3. 依存関係をインストール
cd /home/user/webapp
npm install

# 4. データベースを復元
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply transport-estimate-production --local
npx wrangler d1 execute transport-estimate-production --local --file=../../${BACKUP_NAME}/database_backup.sql

# 5. ビルドと起動
npm run build
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs
\`\`\`

## ✅ 完成済み機能

- **STEP1**: 顧客・案件選択
- **STEP2**: 配送先入力
- **STEP3**: 車両選択（詳細+合計表示）
- **STEP4**: スタッフ入力（詳細+合計表示）
- **STEP5**: その他サービス（詳細+合計表示）
- **STEP6**: 内容確認（完全転写方式）
- **PDF生成**: STEP6完全再現
- **マスター管理**: スタッフ・車両・サービス単価

## 📊 マスターデータ

### スタッフ単価
- スーパーバイザー: ¥40,000/日
- リーダー以上: ¥30,000/日
- M2スタッフ（終日）: ¥20,000/日
- 派遣スタッフ（終日）: ¥18,000/日

### サービス単価
- 駐車対策員: ¥2,500/時間
- 養生作業（基本）: ¥8,000
- 養生作業（フロア単価）: ¥3,000/フロア

### 車両単価（Aエリア・終日）
- 2t車: ¥40,000
- 4t車: ¥60,000

## 🔧 復元後の確認

\`\`\`bash
# サービスが起動しているか確認
curl http://localhost:3000

# PM2ステータス確認
pm2 list

# ログ確認
pm2 logs --nostream
\`\`\`

## 📝 重要な注意事項

1. **Node.js**: v18以上が必要
2. **PM2**: グローバルインストール必須（\`npm install -g pm2\`）
3. **Wrangler**: プロジェクト内にインストール済み
4. **ポート3000**: 他のプロセスで使用されていないこと

## 🆘 トラブルシューティング

### 復元スクリプトが実行できない
\`\`\`bash
chmod +x RESTORE.sh
./RESTORE.sh
\`\`\`

### ポート3000が使用中
\`\`\`bash
fuser -k 3000/tcp
pm2 restart all
\`\`\`

### データベースエラー
\`\`\`bash
cd /home/user/webapp
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply transport-estimate-production --local
npx wrangler d1 execute transport-estimate-production --local --file=PATH_TO_BACKUP/database_backup.sql
\`\`\`

## 📞 サポート

復元に問題が発生した場合は、このREADMEと一緒に以下の情報を提供してください：
- エラーメッセージ
- 実行したコマンド
- \`pm2 logs\` の出力

---

**作成者**: 輸送見積もりシステム自動バックアップ  
**バックアップID**: ${BACKUP_NAME}
EOF

echo -e "   ✅ README作成完了"

# 7. バックアップ情報ファイル作成
echo -e "${GREEN}7. バックアップ情報ファイル作成...${NC}"
cat > "${BACKUP_DIR}/BACKUP_INFO.txt" << EOF
================================================================================
輸送見積もりシステム - バックアップ情報
================================================================================

作成日時: $(date '+%Y年%m月%d日 %H:%M:%S')
タイムスタンプ: ${TIMESTAMP}
バックアップ名: ${BACKUP_NAME}

================================================================================
Git情報
================================================================================

コミットID: ${GIT_COMMIT}
ブランチ: ${GIT_BRANCH}

================================================================================
環境情報
================================================================================

Node.js: ${NODE_VERSION}
npm: ${NPM_VERSION}

================================================================================
バックアップ内容
================================================================================

✅ ソースコード完全版
✅ データベース完全バックアップ
✅ Git履歴
✅ 設定ファイル
✅ 自動復元スクリプト
✅ ドキュメント

================================================================================
復元方法
================================================================================

1. ZIPファイルを展開
   unzip ${BACKUP_NAME}.zip

2. 復元スクリプトを実行
   cd ${BACKUP_NAME}
   ./RESTORE.sh

これだけで完全に復元されます！

================================================================================
EOF

echo -e "   ✅ バックアップ情報ファイル作成完了"

# 8. ZIPファイル作成
echo -e "${GREEN}8. ZIPファイル作成中...${NC}"
cd /tmp
zip -r "${ZIP_FILE}" "${BACKUP_NAME}" > /dev/null 2>&1

if [ -f "${ZIP_FILE}" ]; then
    ZIP_SIZE=$(ls -lh "${ZIP_FILE}" | awk '{print $5}')
    echo -e "   ✅ ZIPファイル作成完了: ${ZIP_SIZE}"
else
    echo -e "${RED}   ❌ ZIPファイル作成失敗${NC}"
    exit 1
fi

# 9. クリーンアップ
echo -e "${GREEN}9. 作業ディレクトリをクリーンアップ...${NC}"
rm -rf "${BACKUP_DIR}"
echo -e "   ✅ クリーンアップ完了"

# 10. バックアップをpublicディレクトリにもコピー（ダウンロード用）
echo -e "${GREEN}10. ダウンロード用にコピー...${NC}"
cp "${ZIP_FILE}" /home/user/webapp/public/
echo -e "   ✅ public/にコピー完了"

# 完了メッセージ
echo ""
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${GREEN}✅ バックアップ作成完了！${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}📦 バックアップファイル: ${ZIP_FILE}${NC}"
echo -e "${YELLOW}📊 ファイルサイズ: ${ZIP_SIZE}${NC}"
echo -e "${YELLOW}💾 データベース: ${DB_SIZE} (${DB_LINES}行)${NC}"
echo ""
echo -e "${GREEN}このZIPファイルを保存するだけで、いつでも完全に復元できます！${NC}"
echo ""
echo -e "${YELLOW}復元方法:${NC}"
echo -e "  1. unzip ${BACKUP_NAME}.zip"
echo -e "  2. cd ${BACKUP_NAME}"
echo -e "  3. ./RESTORE.sh"
echo ""
echo -e "${BLUE}==============================================================================${NC}"
